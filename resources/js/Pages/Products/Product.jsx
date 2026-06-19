// resources/js/Pages/Products/Product.jsx

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { Lightbulb, Trash2, Package, XCircle, CheckCircle, Printer } from 'lucide-react';
import JsBarcode from 'jsbarcode';

/* ─────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────── */
const CATEGORIES = [
    { value: 'all',                label: 'All' },
    { value: 'books',              label: 'Books' },
    { value: 'stationery',         label: 'Stationery' },
    { value: 'school_accessories', label: 'School Accessories' },
];

const EMPTY_FORM = {
    name: '', brand: '', sku: '', category: '', description: '',
    unit_price: '', cost_price: '', stock_level: '', low_stock_threshold: '10',
    image: null, added_by: '',
};

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
const dotColor  = (s) => s === 'in_stock' ? 'bg-emerald-500' : s === 'low_stock' ? 'bg-amber-500' : 'bg-red-500';
const textColor = (s) => s === 'in_stock' ? 'text-emerald-600' : s === 'low_stock' ? 'text-amber-500' : 'text-red-500';

/** Generate a short SKU like BK-A2F4 or ST-C9E1 based on category */
const CATEGORY_PREFIX = {
    books:              'BK',
    stationery:         'ST',
    school_accessories: 'SA',
};
const generateSku = (category) => {
    const prefix = CATEGORY_PREFIX[category] || 'PR';
    const rand   = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return `${prefix}-${rand}`;
};

/* ─────────────────────────────────────────────────
   PRODUCT AVATAR
   ───────────────────────────────────────────────── */
const ProductAvatar = ({ name, imagePath }) => {
    const palette = ['bg-indigo-100','bg-emerald-100','bg-amber-100','bg-cyan-100','bg-rose-100','bg-violet-100'];
    const bg = palette[(name || 'A').charCodeAt(0) % palette.length];
    const [imgError, setImgError] = React.useState(false);

    // Mirror POSTerminal exactly: build a relative /storage/ URL from the raw DB path
    const src = imagePath ? `/storage/${imagePath}` : null;

    if (src && !imgError) return (
        <img
            src={src}
            alt={name}
            className="w-10 h-10 rounded-lg object-contain border border-slate-200 flex-shrink-0 bg-slate-50"
            onError={() => setImgError(true)}
        />
    );
    return (
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200 flex-shrink-0`}>
            {(name || 'P').charAt(0).toUpperCase()}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   BREADCRUMB
   ───────────────────────────────────────────────── */
const Breadcrumb = ({ items }) => (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        {items.map((item, i) => (
            <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span className={i === items.length - 1 ? 'text-slate-600 font-medium' : ''}>{item}</span>
            </React.Fragment>
        ))}
    </nav>
);

/* ─────────────────────────────────────────────────
   CATEGORY COMBOBOX
   ───────────────────────────────────────────────── */
const SUGGESTED_CATEGORIES = [
    { value: 'books',              label: 'Books' },
    { value: 'stationery',         label: 'Stationery' },
    { value: 'school_accessories', label: 'School Accessories' },
];

const CategoryCombobox = ({ value, onChange, error, suggestions = [], onAddNew }) => {
    const allSuggestions = suggestions.length > 0 ? suggestions : SUGGESTED_CATEGORIES;
    const [inputValue, setInputValue] = useState(() => {
        const match = allSuggestions.find(c => c.value === value);
        return match ? match.label : value ?? '';
    });
    const [open, setOpen]       = useState(false);
    const [focused, setFocused] = useState(false);
    const containerRef          = useRef(null);

    // Sync inputValue with value prop when it changes
    React.useEffect(() => {
        const match = allSuggestions.find(c => c.value === value);
        setInputValue(match ? match.label : value ?? '');
    }, [value, allSuggestions]);

    React.useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedMatch = allSuggestions.find(c => c.value === value);
    const isExactMatch = selectedMatch && selectedMatch.label === inputValue;

    const filtered = isExactMatch 
        ? allSuggestions 
        : allSuggestions.filter(c =>
            c.label.toLowerCase().includes(inputValue.toLowerCase())
        );

    const isCustom = !isExactMatch && inputValue.trim() !== '' &&
        !allSuggestions.some(c => c.label.toLowerCase() === inputValue.trim().toLowerCase());

    const handleInput = (e) => {
        const v = e.target.value;
        setInputValue(v);
        setOpen(true);
        const match = allSuggestions.find(c => c.label.toLowerCase() === v.trim().toLowerCase());
        onChange(match ? match.value : v.trim().toLowerCase().replace(/\s+/g, '_'));
    };

    const handleSelect = (cat) => {
        setInputValue(cat.label);
        onChange(cat.value);
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Enter' && isCustom) {
            e.preventDefault();
            onChange(inputValue.trim().toLowerCase().replace(/\s+/g, '_'));
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className={`flex items-center form-input gap-2 p-0 overflow-hidden ${error ? 'border-red-400' : focused ? 'border-indigo-400 ring-2 ring-indigo-100' : ''}`}>
                <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                    placeholder="Select or type a category…"
                    value={inputValue}
                    onChange={handleInput}
                    onFocus={() => { setFocused(true); setOpen(true); }}
                    onBlur={() => setFocused(false)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="px-2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setOpen(o => !o)}
                >
                    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Suggested
                    </p>

                    {filtered.length > 0 ? filtered.map(cat => (
                        <button
                            key={cat.value}
                            type="button"
                            onMouseDown={() => handleSelect(cat)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors
                                ${value === cat.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-300 flex-shrink-0" />
                            {cat.label}
                            {value === cat.value && (
                                <svg className="ml-auto w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    )) : (
                        <p className="px-3 py-2 text-xs text-slate-400">No matches found</p>
                    )}

                    {isCustom && (
                        <>
                            <div className="mx-3 my-1 border-t border-slate-100" />
                            <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                Custom
                            </p>
                            <button
                                type="button"
                                onMouseDown={() => {
                                    onChange(inputValue.trim().toLowerCase().replace(/\s+/g, '_'));
                                    setOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                            >
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Use "{inputValue.trim()}"
                            </button>
                        </>
                    )}

                    <div className="px-3 pb-2 pt-1 border-t border-slate-100 mt-1">
                        <p className="text-[10px] text-slate-400">
                            <Lightbulb className="w-3 h-3 inline -mt-0.5 mr-0.5" /> Can't find your category?{' '}
                            <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); router.visit(route('categories.index')); }} 
                                className="text-indigo-500 hover:text-indigo-700 underline font-medium"
                            >
                                Go to Manage Categories
                            </button>{' '}
                            to add it.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   BARCODE STICKER MODAL
   ───────────────────────────────────────────────── */
const BarcodeStickerModal = ({ product, onClose }) => {
    const barcodeRef = useRef(null);
    const printRef = useRef(null);
    const [barcodeError, setBarcodeError] = useState(false);

    useEffect(() => {
        if (barcodeRef.current && product?.sku) {
            try {
                // Clear previous barcode
                barcodeRef.current.innerHTML = '';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                barcodeRef.current.appendChild(svg);
                
                JsBarcode(svg, product.sku, {
                    format: 'CODE128',
                    width: 2,
                    height: 50,
                    displayValue: false,
                    margin: 5,
                    background: '#ffffff',
                    lineColor: '#000000',
                });
                // Ensure the SVG never exceeds its container
                svg.style.maxWidth = '100%';
                svg.style.height = 'auto';
                svg.style.display = 'block';
                setBarcodeError(false);
            } catch (error) {
                console.error('Barcode generation error:', error);
                setBarcodeError(true);
            }
        }
    }, [product?.sku]);

    const handlePrint = useCallback(() => {
        if (!printRef.current) return;

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '_blank', 'width=400,height=300');
        
        if (!printWindow) {
            alert('Please allow pop-ups to print the barcode sticker.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Barcode - ${product.name}</title>
                <style>
                    @page {
                        size: 60mm 40mm;
                        margin: 0;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Arial', sans-serif;
                        width: 60mm;
                        height: 40mm;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 2mm;
                    }
                    .sticker {
                        width: 56mm;
                        height: 36mm;
                        border: 1px solid #e2e8f0;
                        border-radius: 4px;
                        padding: 2mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        background: #fff;
                    }
                    .product-name {
                        font-size: 9pt;
                        font-weight: 700;
                        text-align: center;
                        line-height: 1.2;
                        max-height: 2.4em;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        color: #1e293b;
                    }
                    .barcode-container {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        overflow: hidden;
                    }
                    .barcode-container svg {
                        display: block;
                        max-width: 52mm;
                        width: 100%;
                        height: auto;
                    }
                    .sku-text {
                        font-size: 7pt;
                        font-family: 'Courier New', monospace;
                        color: #475569;
                        letter-spacing: 0.5px;
                    }
                    .price {
                        font-size: 11pt;
                        font-weight: 800;
                        color: #1e293b;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);

        printWindow.document.close();
        
        // Wait for content to fully load, then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };

        // Close window after print dialog is closed (cancel or print)
        printWindow.onafterprint = () => {
            printWindow.close();
        };

        // Fallback: if onload doesn't fire (some browsers), try after a delay
        setTimeout(() => {
            if (printWindow && !printWindow.closed) {
                printWindow.focus();
                printWindow.print();
            }
        }, 500);
    }, [product]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Print Barcode Sticker</h3>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sticker Preview */}
                <div className="bg-slate-100 rounded-xl p-4 mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 text-center">Preview</p>
                    <div ref={printRef} className="flex justify-center">
                        <div className="sticker bg-white border border-slate-200 rounded-lg p-3 w-[220px] flex flex-col items-center gap-1.5 shadow-sm">
                            <p className="text-xs font-bold text-slate-800 text-center leading-tight line-clamp-2 max-w-full">
                                {product.name}
                            </p>
                            <div ref={barcodeRef} className="barcode-container flex justify-center items-center my-1 w-full overflow-hidden">
                                {barcodeError && (
                                    <div className="text-xs text-red-500 py-2">Unable to generate barcode</div>
                                )}
                            </div>
                            <p className="sku-text text-[10px] font-mono text-slate-500 tracking-wide">
                                {product.sku}
                            </p>
                            <p className="price text-sm font-extrabold text-slate-900">
                                {product.formatted_price}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 bg-indigo-50 rounded-lg p-3 mb-4">
                    <Lightbulb className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700">
                        This will print a 60×40mm sticker. Make sure your printer is configured for label printing.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handlePrint} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print Sticker
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   DELETE CONFIRM DIALOG
   ───────────────────────────────────────────────── */
const DeleteDialog = ({ product, onConfirm, onCancel, processing }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Delete Product?</h3>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">"{product.name}"</span> will be permanently removed. This cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 mt-6">
                <button onClick={onCancel} disabled={processing} className="btn-secondary flex-1">Cancel</button>
                <button onClick={onConfirm} disabled={processing} className="btn-danger flex-1">
                    {processing ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   PRODUCT FORM MODAL (Add / Edit)
   ───────────────────────────────────────────────── */
const ProductModal = ({ mode, initial, onClose, categories = [] }) => {
    const { data, setData, post, processing, errors } = useForm({
        ...EMPTY_FORM,
        ...initial,
        custom_attributes:   initial.custom_attributes   ?? {},
        description:         initial.description         ?? '',
        brand:               initial.brand               ?? '',
        added_by:            initial.added_by            ?? '',
        unit_price:          initial.unit_price?.toString()          ?? '',
        cost_price:          initial.cost_price?.toString()          ?? '',
        stock_level:         initial.stock_level?.toString()         ?? '',
        low_stock_threshold: initial.low_stock_threshold?.toString() ?? '10',
        _method:             mode === 'edit' ? 'PUT' : undefined,
    });

    const [preview, setPreview] = useState(initial.image_path ? `/storage/${initial.image_path}` : null);
    const [previewError, setPreviewError] = useState(false);
    const fileRef = useRef(null);

    // Watch category changes to reset custom_attributes
    useEffect(() => {
        if (data.category !== initial.category && Object.keys(data.custom_attributes || {}).length > 0) {
            setData('custom_attributes', {});
        }
    }, [data.category]);

    // Find custom fields for selected category
    const selectedCatData = categories.find(c => c.value === data.category);
    const customFields = selectedCatData?.custom_fields || [];

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }
        
        // Create preview URL and update form data
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setPreviewError(false);
        setData('image', file);
    };

    const margin = useMemo(() => {
        const price = parseFloat(data.unit_price);
        const cost  = parseFloat(data.cost_price);
        if (!price || !cost || price <= 0) return null;
        return (((price - cost) / price) * 100).toFixed(1);
    }, [data.unit_price, data.cost_price]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: onClose };
        
        if (mode === 'add') {
            post(route('products.store'), opts);
        } else {
            // Include _method for Laravel PUT with multipart/form-data
            const submitData = { ...data, _method: 'put' };
            // useForm doesn't allow changing data mid-flight easily with post() if we don't use transform.
            // Wait! If we use transform(), we can append it. But we can just use router.post
            router.post(route('products.update', initial.id), submitData, opts);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[modal-in_200ms_ease]">
                <div className="modal-header">
                    <h2 className="modal-title">{mode === 'add' ? '+ Add New Product' : 'Edit Product'}</h2>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Image */}
                            <div className="sm:col-span-2">
                                <label className="form-label mb-1.5 block">Product Image</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                                    onClick={() => fileRef.current?.click()}>
                                    <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFile} />
                                    {preview && !previewError
                                        ? <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0" onError={() => setPreviewError(true)} />
                                        : <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                            <Package className="w-7 h-7 text-indigo-400" />
                          </div>
                                    }
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-600">{preview ? 'Click to change image' : 'Click to upload image'}</p>
                                        <p className="text-xs text-slate-400">PNG, JPG, WEBP — up to 5MB</p>
                                        {data.image && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Image selected</p>}
                                    </div>
                                    {preview && (
                                        <button type="button" className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 font-semibold hover:bg-red-50 rounded-lg transition-all"
                                            onClick={(e) => { e.stopPropagation(); setPreview(null); setPreviewError(false); setData('image', null); fileRef.current.value = ''; }}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {errors.image && <p className="form-error mt-1">{errors.image}</p>}
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">Product Name <span className="text-red-500">*</span></label>
                                <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} placeholder="e.g. Atomic Habits" value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="form-error">{errors.name}</p>}
                            </div>

                            {/* Brand */}
                            <div className="form-group">
                                <label className="form-label">Brand / Author <span className="text-red-500">*</span></label>
                                <input className={`form-input ${errors.brand ? 'border-red-400' : ''}`} placeholder="e.g. James Clear" value={data.brand} onChange={e => setData('brand', e.target.value)} />
                                {errors.brand && <p className="form-error">{errors.brand}</p>}
                            </div>

                            {/* SKU */}
                            <div className="form-group">
                                <label className="form-label">SKU / ISBN <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input
                                        className={`form-input flex-1 font-mono ${errors.sku ? 'border-red-400' : ''}`}
                                        placeholder="e.g. BK-A2F4"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setData('sku', generateSku(data.category))}
                                        className="flex-shrink-0 px-3 h-10 rounded-lg border-2 border-dashed border-indigo-300 text-indigo-600 text-xs font-semibold hover:border-indigo-500 hover:bg-indigo-50 transition-all whitespace-nowrap"
                                        title="Auto-generate a SKU"
                                    >
                                        Generate
                                    </button>
                                </div>
                                {errors.sku && <p className="form-error">{errors.sku}</p>}
                            </div>

                            {/* Category */}
                            <div className="form-group">
                                <label className="form-label">Category <span className="text-red-500">*</span></label>
                                <CategoryCombobox
                                    value={data.category}
                                    onChange={(val) => setData('category', val)}
                                    error={errors.category}
                                    suggestions={categories}
                                />
                                {errors.category && <p className="form-error">{errors.category}</p>}
                            </div>

                            {/* Unit Price */}
                            <div className="form-group">
                                <label className="form-label">Unit Price (Rs.) <span className="text-red-500">*</span></label>
                                <input type="number" min="0" step="0.01" className={`form-input ${errors.unit_price ? 'border-red-400' : ''}`} placeholder="0.00" value={data.unit_price} onChange={e => setData('unit_price', e.target.value)} />
                                {errors.unit_price && <p className="form-error">{errors.unit_price}</p>}
                            </div>

                            {/* Cost Price */}
                            <div className="form-group">
                                <label className="form-label">Cost Price (Rs.)</label>
                                <input type="number" min="0" step="0.01" className="form-input" placeholder="0.00" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} />
                                {margin !== null && (
                                    <p className="form-hint">
                                        Margin: <span className={`font-semibold ${Number(margin) >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>{margin}%</span>
                                    </p>
                                )}
                            </div>

                            {/* Stock Level */}
                            <div className="form-group">
                                <label className="form-label">Stock Quantity <span className="text-red-500">*</span></label>
                                <input type="number" min="0" className={`form-input ${errors.stock_level ? 'border-red-400' : ''}`} placeholder="0" value={data.stock_level} onChange={e => setData('stock_level', e.target.value)} />
                                {errors.stock_level && <p className="form-error">{errors.stock_level}</p>}
                            </div>

                            {/* Low Stock Threshold */}
                            <div className="form-group">
                                <label className="form-label">Low Stock Threshold</label>
                                <input type="number" min="0" className="form-input" placeholder="10" value={data.low_stock_threshold} onChange={e => setData('low_stock_threshold', e.target.value)} />
                                <p className="form-hint">Alert when stock falls below this level</p>
                            </div>

                            {/* Added By — only on create */}
                            {mode === 'add' && (
                                <div className="form-group sm:col-span-2">
                                    <label className="form-label">Added By <span className="text-red-500">*</span></label>
                                    <input className={`form-input ${errors.added_by ? 'border-red-400' : ''}`} placeholder="Staff / cashier name" value={data.added_by} onChange={e => setData('added_by', e.target.value)} />
                                    {errors.added_by && <p className="form-error">{errors.added_by}</p>}
                                </div>
                            )}

                            {/* Description */}
                            <div className="form-group sm:col-span-2">
                                <label className="form-label">Description</label>
                                <textarea rows={3} className="form-input resize-none" placeholder="Short description…" value={data.description} onChange={e => setData('description', e.target.value)} />
                            </div>

                            {/* Custom Fields */}
                            {customFields.length > 0 && (
                                <div className="sm:col-span-2 border-t border-slate-200 pt-4 mt-2">
                                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                        Category-Specific Fields
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        {customFields.map(f => (
                                            <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2 form-group mb-0' : 'form-group mb-0'}>
                                                <label className="form-label">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                                                {f.type === 'textarea' ? (
                                                    <textarea 
                                                        rows={2} 
                                                        className={`form-input resize-none ${errors[`custom_attributes.${f.key}`] ? 'border-red-400' : ''}`} 
                                                        value={data.custom_attributes?.[f.key] || ''} 
                                                        onChange={e => setData('custom_attributes', { ...data.custom_attributes, [f.key]: e.target.value })} 
                                                        required={f.required}
                                                    />
                                                ) : f.type === 'select' ? (
                                                    <select 
                                                        className={`form-input ${errors[`custom_attributes.${f.key}`] ? 'border-red-400' : ''}`} 
                                                        value={data.custom_attributes?.[f.key] || ''} 
                                                        onChange={e => setData('custom_attributes', { ...data.custom_attributes, [f.key]: e.target.value })}
                                                        required={f.required}
                                                    >
                                                        <option value="">Select...</option>
                                                        {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input 
                                                        type={f.type === 'number' ? 'number' : 'text'} 
                                                        className={`form-input ${errors[`custom_attributes.${f.key}`] ? 'border-red-400' : ''}`} 
                                                        value={data.custom_attributes?.[f.key] || ''} 
                                                        onChange={e => setData('custom_attributes', { ...data.custom_attributes, [f.key]: e.target.value })} 
                                                        required={f.required}
                                                    />
                                                )}
                                                {errors[`custom_attributes.${f.key}`] && <p className="form-error">{errors[`custom_attributes.${f.key}`]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={processing}>
                            {processing ? 'Saving…' : mode === 'add' ? 'Add Product' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   PRODUCT MANAGEMENT PAGE
   ───────────────────────────────────────────────── */
export default function Product({ auth, products, wastedItems, filters = {}, categories = [] }) {
    const { can } = usePermissions();
    const [activeKey,    setActiveKey]    = useState('products');
    const [modal,        setModal]        = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting,     setDeleting]     = useState(false);
    const [toast,        setToast]        = useState(null);
    const [search,       setSearch]       = useState(filters.search   ?? '');
    const [category,     setCategory]     = useState(filters.category ?? 'all');
    const [barcodeProduct, setBarcodeProduct] = useState(null);

    const searchTimeout = useRef(null);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSearch = (value) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get(route('products.index'), { search: value, category }, { preserveState: true, replace: true });
        }, 350);
    };

    const handleCategory = (value) => {
        setCategory(value);
        router.get(route('products.index'), { search, category: value, view: filters.view }, { preserveState: true, replace: true });
    };

    const handleView = (view) => {
        router.get(route('products.index'), { search, category, view }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('products.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`"${deleteTarget.name}" deleted.`, 'danger');
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const productList = products?.data ?? [];
    const meta        = products?.meta ?? {};
    const filterTabs  = [{ value: 'all', label: 'All' }, ...categories];

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Products"
            user={auth?.user ?? { name: 'Admin User', email: 'admin@luminabooks.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title={filters.view === 'wasted' ? 'Wasted Items' : 'Products'} />

            {toast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up
                    ${toast.type === 'danger' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <span>{toast.type === 'danger' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</span>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="page-header">
                <div>
                    <Breadcrumb items={['Lumina Books POS', filters.view === 'wasted' ? 'Wasted Items' : 'Products']} />
                    <h1 className="page-title">{filters.view === 'wasted' ? 'Wasted Items' : 'Products'}</h1>
                    <p className="page-subtitle flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full inline-block animate-pulse-soft ${filters.view === 'wasted' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {filters.view === 'wasted' 
                            ? `SYSTEM ONLINE — ${wastedItems?.meta?.total ?? 0} wasted records`
                            : `SYSTEM ONLINE — ${meta.total ?? 0} products in inventory`}
                    </p>
                </div>
                <div className="flex gap-2">
                    {can('create_product') && (
                        <button
                            type="button"
                            onClick={() => router.visit(route('categories.index'))}
                            className="btn-secondary whitespace-nowrap flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Manage Categories
                        </button>
                    )}
                    {can('create_product') && (
                    <button className="btn-primary whitespace-nowrap flex items-center gap-2" onClick={() => setModal({ mode: 'add', data: {} })}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Product
                    </button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="search-input-wrapper flex-1 max-w-md">
                    <span className="search-icon">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                        </svg>
                    </span>
                    <input className="search-input" placeholder="Search by name, brand, or SKU..."
                        value={search} onChange={(e) => handleSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                    {filterTabs.map((cat) => (
                        <button key={cat.value} onClick={() => handleCategory(cat.value)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                ${category === cat.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                            {cat.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                    <button 
                        onClick={() => handleView(null)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                            ${!filters.view ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        Inventory
                    </button>
                    <button 
                        onClick={() => handleView('wasted')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                            ${filters.view === 'wasted' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                    >
                        Wasted Items
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            {filters.view === 'wasted' ? (
                                <tr>
                                    <th className="pl-5">Product Details</th>
                                    <th>Order ID</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total Loss</th>
                                    <th>Reason</th>
                                    <th className="pr-5">Date</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="pl-5 w-16">Thumbnail</th>
                                    <th>Name & Brand</th>
                                    <th>SKU / ISBN</th>
                                    <th>Category</th>
                                    <th>Stock Level</th>
                                    <th>Unit Price</th>
                                    <th>Status</th>
                                    <th className="text-right pr-5">Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {filters.view === 'wasted' ? (
                                wastedItems?.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <XCircle className="w-10 h-10 text-slate-300" />
                                                <p className="font-semibold text-slate-500">No wasted items recorded</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : wastedItems.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="pl-5">
                                            <p className="font-semibold text-slate-800 text-sm">{item.product_name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{item.product_sku}</p>
                                        </td>
                                        <td className="text-sm font-medium text-slate-600">{item.order_id}</td>
                                        <td className="text-sm font-bold text-slate-700">{item.qty}</td>
                                        <td className="text-sm text-slate-600">Rs. {item.unit_price.toLocaleString()}</td>
                                        <td className="text-sm font-bold text-red-600">Rs. {item.total_loss.toLocaleString()}</td>
                                        <td className="text-xs text-slate-500 max-w-[200px] truncate" title={item.reason}>{item.reason}</td>
                                        <td className="pr-5 text-xs text-slate-400">
                                            {new Date(item.created_at).toLocaleDateString('en-LK', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                productList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-20 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="w-10 h-10 text-slate-300" />
                                                <p className="font-semibold text-slate-500">No products found</p>
                                                <p className="text-xs">Try a different search or filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : productList.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="pl-5"><ProductAvatar name={product.name} imagePath={product.image_path} /></td>
                                        <td>
                                            <p className="font-semibold text-slate-800 text-sm leading-tight">{product.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{product.brand}</p>
                                        </td>
                                        <td className="text-slate-500 text-xs font-mono tracking-wide">{product.sku}</td>
                                        <td className="text-slate-600 text-sm">{product.category_label}</td>
                                        <td className="font-semibold text-slate-700 text-sm">{product.stock_level}</td>
                                        <td className="font-bold text-slate-800">{product.formatted_price}</td>
                                        <td>
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textColor(product.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(product.status)}`} />
                                                {product.status_label}
                                            </span>
                                        </td>
                                        <td className="pr-5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button title="Print Barcode" onClick={() => setBarcodeProduct(product)}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center transition-all">
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                {can('edit_product') && (
                                                <button title="Edit" onClick={() => setModal({ mode: 'edit', data: product })}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center transition-all">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                )}
                                                {can('delete_product') && (
                                                <button title="Delete" onClick={() => setDeleteTarget(product)}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-b-xl flex-wrap gap-3">
                    <span>
                        Showing <span className="font-semibold text-slate-700">{meta.from ?? 0}</span> to{' '}
                        <span className="font-semibold text-slate-700">{meta.to ?? 0}</span> of{' '}
                        <span className="font-semibold text-slate-700">{meta.total ?? 0}</span> items
                    </span>
                    <div className="flex items-center gap-1">
                        {(meta.links ?? []).map((link, i) => (
                            <button key={i} disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all
                                    ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-default'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {modal && (
                <ProductModal 
                    mode={modal.mode} 
                    initial={modal.data} 
                    onClose={() => setModal(null)} 
                    categories={categories}
                />
            )}

            {deleteTarget && (
                <DeleteDialog product={deleteTarget} onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)} processing={deleting} />
            )}

            {barcodeProduct && (
                <BarcodeStickerModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />
            )}
        </MainLayout>
    );
}