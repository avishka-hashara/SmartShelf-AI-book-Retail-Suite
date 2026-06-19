// resources/js/Pages/Promotions/Promotions.jsx

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { 
    Tag, Trash2, Package, XCircle, CheckCircle, Percent, DollarSign, 
    Calendar, Gift, ShoppingBag, Plus, Minus, Search, X, Sparkles,
    ToggleLeft, ToggleRight, Clock, AlertCircle
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────── */
const TYPE_OPTIONS = [
    { value: 'bundle', label: 'Bundle', icon: Gift, description: 'Combine products at a special price' },
    { value: 'discount', label: 'Discount', icon: Percent, description: 'Apply discount to selected products' },
];

const DISCOUNT_TYPE_OPTIONS = [
    { value: 'percentage', label: 'Percentage (%)', icon: Percent },
    { value: 'fixed', label: 'Fixed Amount (Rs.)', icon: DollarSign },
];

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const EMPTY_FORM = {
    name: '',
    description: '',
    type: 'discount',
    discount_type: 'percentage',
    discount_value: '',
    bundle_price: '',
    start_date: '',
    end_date: '',
    is_active: true,
    min_purchase_amount: '',
    usage_limit: '',
    promo_code: '',
    priority: 0,
    image: null,
    products: [],
};

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
let globalSymbol = 'Rs. ';
const fmt = (n) => `${globalSymbol}${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor = (status) => {
    switch (status) {
        case 'Active': return 'bg-emerald-100 text-emerald-700';
        case 'Inactive': return 'bg-slate-100 text-slate-600';
        case 'Scheduled': return 'bg-blue-100 text-blue-700';
        case 'Expired': return 'bg-red-100 text-red-700';
        case 'Limit Reached': return 'bg-amber-100 text-amber-700';
        default: return 'bg-slate-100 text-slate-600';
    }
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
   PRODUCT SELECTOR
   ───────────────────────────────────────────────── */
const ProductSelector = ({ products, selectedProducts, onAdd, onRemove, onUpdateQty }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const filteredProducts = useMemo(() => {
        const q = searchQuery.toLowerCase();
        const selectedIds = selectedProducts.map(p => p.id);
        return products.filter(p => 
            !selectedIds.includes(p.id) && 
            (p.name.toLowerCase().includes(q) || 
             p.brand.toLowerCase().includes(q) || 
             p.sku.toLowerCase().includes(q))
        );
    }, [products, selectedProducts, searchQuery]);

    React.useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="space-y-3">
            {/* Search and Add */}
            <div ref={containerRef} className="relative">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            className="form-input pl-9"
                            placeholder="Search products to add..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
                            onFocus={() => setIsOpen(true)}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && searchQuery && filteredProducts.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredProducts.slice(0, 10).map(product => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                    onAdd({ ...product, quantity: 1 });
                                    setSearchQuery('');
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    {product.image_path ? (
                                        <img src={`/storage/${product.image_path}`} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                    ) : (
                                        <Package className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.brand} · {fmt(product.unit_price)}</p>
                                </div>
                                <Plus className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Selected Products ({selectedProducts.length})</p>
                    <div className="space-y-2">
                        {selectedProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                    {product.image_path ? (
                                        <img src={`/storage/${product.image_path}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <Package className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{fmt(product.unit_price)} each</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onUpdateQty(product.id, product.quantity - 1)}
                                        className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center font-semibold text-slate-700">{product.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => onUpdateQty(product.id, product.quantity + 1)}
                                        className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(product.id)}
                                    className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedProducts.length === 0 && (
                <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No products selected</p>
                    <p className="text-xs">Search and add products above</p>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   DELETE CONFIRM DIALOG
   ───────────────────────────────────────────────── */
const DeleteDialog = ({ promotion, onConfirm, onCancel, processing }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Delete Promotion?</h3>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">"{promotion.name}"</span> will be permanently removed. This cannot be undone.
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
   PROMOTION FORM MODAL
   ───────────────────────────────────────────────── */
const PromotionModal = ({ mode, initial, onClose, allProducts = [] }) => {
    const initialProducts = initial.products?.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        sku: p.sku,
        unit_price: p.unit_price,
        image_path: p.image_path,
        quantity: p.quantity || 1,
        discount_override: p.discount_override,
    })) || [];

    const { data, setData, post, processing, errors } = useForm({
        ...EMPTY_FORM,
        ...initial,
        discount_value: initial.discount_value?.toString() ?? '',
        bundle_price: initial.bundle_price?.toString() ?? '',
        min_purchase_amount: initial.min_purchase_amount?.toString() ?? '',
        usage_limit: initial.usage_limit?.toString() ?? '',
        priority: initial.priority ?? 0,
        is_active: initial.is_active ?? true,
        products: initialProducts,
        _method: mode === 'edit' ? 'PUT' : undefined,
    });

    const [preview, setPreview] = useState(initial.image_path ? `/storage/${initial.image_path}` : null);
    const fileRef = useRef(null);

    // Calculate prices
    const originalPrice = useMemo(() => {
        return data.products.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0);
    }, [data.products]);

    const finalPrice = useMemo(() => {
        if (data.type === 'bundle' && data.bundle_price) {
            return parseFloat(data.bundle_price);
        }
        if (data.discount_type === 'percentage' && data.discount_value) {
            return originalPrice * (1 - (parseFloat(data.discount_value) / 100));
        }
        if (data.discount_type === 'fixed' && data.discount_value) {
            return Math.max(0, originalPrice - parseFloat(data.discount_value));
        }
        return originalPrice;
    }, [data.type, data.bundle_price, data.discount_type, data.discount_value, originalPrice]);

    const savings = originalPrice - finalPrice;

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }
        setPreview(URL.createObjectURL(file));
        setData('image', file);
    };

    const handleAddProduct = (product) => {
        setData('products', [...data.products, product]);
    };

    const handleRemoveProduct = (productId) => {
        setData('products', data.products.filter(p => p.id !== productId));
    };

    const handleUpdateProductQty = (productId, newQty) => {
        if (newQty < 1) {
            handleRemoveProduct(productId);
            return;
        }
        setData('products', data.products.map(p => 
            p.id === productId ? { ...p, quantity: newQty } : p
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Transform products for submission
        const submitData = {
            ...data,
            products: data.products.map(p => ({
                id: p.id,
                quantity: p.quantity,
                discount_override: p.discount_override || null,
            })),
        };

        const opts = { forceFormData: true, preserveScroll: true, onSuccess: onClose };
        if (mode === 'add') {
            post(route('promotions.store'), opts);
        } else {
            post(route('promotions.update', initial.id), opts);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-[modal-in_200ms_ease]">
                <div className="modal-header">
                    <h2 className="modal-title">{mode === 'add' ? '+ Create Promotion' : 'Edit Promotion'}</h2>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Promotion Type */}
                                <div className="form-group">
                                    <label className="form-label">Promotion Type <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TYPE_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setData('type', opt.value)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                                        data.type === opt.value 
                                                            ? 'border-indigo-500 bg-indigo-50' 
                                                            : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className={`w-4 h-4 ${data.type === opt.value ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                        <span className={`font-semibold text-sm ${data.type === opt.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{opt.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="form-group">
                                    <label className="form-label">Promotion Name <span className="text-red-500">*</span></label>
                                    <input 
                                        className={`form-input ${errors.name ? 'border-red-400' : ''}`} 
                                        placeholder="e.g. Back to School Bundle"
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                    />
                                    {errors.name && <p className="form-error">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea 
                                        rows={2} 
                                        className="form-input resize-none" 
                                        placeholder="Describe this promotion..."
                                        value={data.description} 
                                        onChange={e => setData('description', e.target.value)} 
                                    />
                                </div>

                                {/* Discount Settings */}
                                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Discount Settings</p>
                                    
                                    {data.type === 'discount' && (
                                        <div className="form-group">
                                            <label className="form-label text-xs">Discount Type</label>
                                            <div className="flex gap-2">
                                                {DISCOUNT_TYPE_OPTIONS.map(opt => {
                                                    const Icon = opt.icon;
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => setData('discount_type', opt.value)}
                                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                                data.discount_type === opt.value
                                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            {opt.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="form-group">
                                            <label className="form-label text-xs">
                                                {data.type === 'bundle' ? 'Discount Value' : 'Discount'} 
                                                {data.discount_type === 'percentage' ? ' (%)' : ' (Rs.)'} 
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                step={data.discount_type === 'percentage' ? '1' : '0.01'}
                                                max={data.discount_type === 'percentage' ? '100' : undefined}
                                                className={`form-input ${errors.discount_value ? 'border-red-400' : ''}`}
                                                placeholder="0"
                                                value={data.discount_value} 
                                                onChange={e => setData('discount_value', e.target.value)} 
                                            />
                                            {errors.discount_value && <p className="form-error">{errors.discount_value}</p>}
                                        </div>

                                        {data.type === 'bundle' && (
                                            <div className="form-group">
                                                <label className="form-label text-xs">Bundle Price (Rs.)</label>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    step="0.01"
                                                    className="form-input"
                                                    placeholder="Fixed bundle price"
                                                    value={data.bundle_price} 
                                                    onChange={e => setData('bundle_price', e.target.value)} 
                                                />
                                                <p className="form-hint">Leave empty to use discount</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Validity Period */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input 
                                            type="date" 
                                            className="form-input"
                                            value={data.start_date} 
                                            onChange={e => setData('start_date', e.target.value)} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input 
                                            type="date" 
                                            className="form-input"
                                            value={data.end_date} 
                                            onChange={e => setData('end_date', e.target.value)} 
                                        />
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div className="form-group">
                                    <label className="form-label">Promo Code (Optional)</label>
                                    <input 
                                        className={`form-input font-mono uppercase ${errors.promo_code ? 'border-red-400' : ''}`}
                                        placeholder="e.g. SAVE20"
                                        value={data.promo_code} 
                                        onChange={e => setData('promo_code', e.target.value.toUpperCase())} 
                                    />
                                    {errors.promo_code && <p className="form-error">{errors.promo_code}</p>}
                                </div>

                                {/* Usage Limit & Priority */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-group">
                                        <label className="form-label">Usage Limit</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="form-input"
                                            placeholder="Unlimited"
                                            value={data.usage_limit} 
                                            onChange={e => setData('usage_limit', e.target.value)} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            className="form-input"
                                            placeholder="0"
                                            value={data.priority} 
                                            onChange={e => setData('priority', parseInt(e.target.value) || 0)} 
                                        />
                                        <p className="form-hint">Higher = shows first</p>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-700">Active</p>
                                        <p className="text-xs text-slate-500">Enable this promotion immediately</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className={`w-12 h-7 rounded-full transition-colors ${data.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Right Column - Products */}
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label className="form-label">Products <span className="text-red-500">*</span></label>
                                    <ProductSelector
                                        products={allProducts}
                                        selectedProducts={data.products}
                                        onAdd={handleAddProduct}
                                        onRemove={handleRemoveProduct}
                                        onUpdateQty={handleUpdateProductQty}
                                    />
                                    {errors.products && <p className="form-error">{errors.products}</p>}
                                </div>

                                {/* Price Preview */}
                                {data.products.length > 0 && (
                                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Price Preview</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Original Price</span>
                                                <span className="text-slate-500 line-through">{fmt(originalPrice)}</span>
                                            </div>
                                            {savings > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-emerald-600">Savings</span>
                                                    <span className="text-emerald-600 font-semibold">-{fmt(savings)}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-indigo-200 flex justify-between">
                                                <span className="font-bold text-slate-800">Final Price</span>
                                                <span className="font-bold text-lg text-indigo-700">{fmt(finalPrice)}</span>
                                            </div>
                                            {savings > 0 && (
                                                <p className="text-xs text-center text-emerald-600 font-medium bg-emerald-50 rounded-lg py-1">
                                                    {((savings / originalPrice) * 100).toFixed(0)}% OFF
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Image Upload */}
                                <div className="form-group">
                                    <label className="form-label">Promotion Banner (Optional)</label>
                                    <div 
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFile} />
                                        {preview ? (
                                            <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <Sparkles className="w-7 h-7 text-indigo-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-600">{preview ? 'Click to change' : 'Upload banner'}</p>
                                            <p className="text-xs text-slate-400">PNG, JPG, WEBP — up to 5MB</p>
                                        </div>
                                        {preview && (
                                            <button 
                                                type="button" 
                                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                                onClick={(e) => { e.stopPropagation(); setPreview(null); setData('image', null); }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={processing || data.products.length === 0}>
                            {processing ? 'Saving…' : mode === 'add' ? 'Create Promotion' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   PROMOTION CARD
   ───────────────────────────────────────────────── */
const PromotionCard = ({ promotion, onEdit, onDelete, onToggle, canEdit, canDelete }) => {
    const TypeIcon = promotion.type === 'bundle' ? Gift : Percent;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
            {/* Header */}
            <div className={`px-4 py-3 ${promotion.type === 'bundle' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-white/80" />
                        <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                            {promotion.type_label}
                        </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(promotion.status_label)}`}>
                        {promotion.status_label}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-1">{promotion.name}</h3>
                {promotion.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{promotion.description}</p>
                )}

                {/* Price Info */}
                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-slate-800">{promotion.formatted_price}</span>
                    {promotion.savings > 0 && (
                        <>
                            <span className="text-sm text-slate-400 line-through">{promotion.formatted_original_price}</span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Save {promotion.formatted_savings}
                            </span>
                        </>
                    )}
                </div>

                {/* Products Preview */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                        {promotion.products?.slice(0, 4).map((product, i) => (
                            <div 
                                key={product.id} 
                                className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center overflow-hidden"
                                style={{ zIndex: 4 - i }}
                            >
                                {product.image_path ? (
                                    <img src={`/storage/${product.image_path}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-4 h-4 text-slate-400" />
                                )}
                            </div>
                        ))}
                        {promotion.products?.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                                +{promotion.products.length - 4}
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-slate-500">{promotion.products?.length} product(s)</span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                    {promotion.promo_code && (
                        <span className="bg-slate-100 px-2 py-1 rounded font-mono">{promotion.promo_code}</span>
                    )}
                    {promotion.start_date && (
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {promotion.start_date} - {promotion.end_date || '∞'}
                        </span>
                    )}
                    {promotion.usage_limit && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {promotion.times_used}/{promotion.usage_limit} used
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                        onClick={() => onToggle(promotion)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            promotion.is_active 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {promotion.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {promotion.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <div className="flex-1" />
                    {canEdit && (
                        <button
                            onClick={() => onEdit(promotion)}
                            className="w-8 h-8 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center transition-all"
                            title="Edit"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(promotion)}
                            className="w-8 h-8 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   PROMOTIONS PAGE
   ───────────────────────────────────────────────── */
export default function Promotions({ auth, promotions, products, filters = {} }) {
    const { store } = usePage().props;
    const CURRENCY_SYMBOLS = {
        LKR: 'Rs ', USD: '$', EUR: '€', GBP: '£', INR: '₹',
        AUD: 'A$', CAD: 'C$', SGD: 'S$', AED: 'AED ', JPY: '¥'
    };
    globalSymbol = CURRENCY_SYMBOLS[store?.currency] || '$';
    const { can } = usePermissions();
    const [activeKey, setActiveKey] = useState('promotions');
    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [typeFilter, setTypeFilter] = useState(filters.type ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
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
            router.get(route('promotions.index'), { search: value, type: typeFilter, status: statusFilter }, { preserveState: true, replace: true });
        }, 350);
    };

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
        router.get(route('promotions.index'), { search, type: value === 'all' ? '' : value, status: statusFilter }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        router.get(route('promotions.index'), { search, type: typeFilter, status: value === 'all' ? '' : value }, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('promotions.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`"${deleteTarget.name}" deleted.`, 'danger');
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const handleToggle = (promotion) => {
        router.patch(route('promotions.toggle', promotion.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast(`Promotion ${promotion.is_active ? 'deactivated' : 'activated'}.`);
            },
        });
    };

    const promotionList = promotions?.data ?? [];
    const meta = promotions?.meta ?? {};

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Promotions"
            user={auth?.user ?? { name: 'Admin User', email: 'admin@luminabooks.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="Promotions" />

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
                    <Breadcrumb items={['Lumina Books POS', 'Promotions']} />
                    <h1 className="page-title">Promotions</h1>
                    <p className="page-subtitle flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Create bundles and discounts to boost sales
                    </p>
                </div>
                {can('create_promotion') && (
                    <button className="btn-primary" onClick={() => setModal({ mode: 'add', data: {} })}>
                        <Plus className="w-4 h-4" />
                        New Promotion
                    </button>
                )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="search-input-wrapper flex-1 max-w-md">
                    <span className="search-icon">
                        <Search className="w-4 h-4" />
                    </span>
                    <input 
                        className="search-input" 
                        placeholder="Search promotions..."
                        value={search} 
                        onChange={(e) => handleSearch(e.target.value)} 
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Filter */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => handleTypeFilter('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                typeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            All Types
                        </button>
                        <button
                            onClick={() => handleTypeFilter('bundle')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                                typeFilter === 'bundle' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Gift className="w-3 h-3" /> Bundles
                        </button>
                        <button
                            onClick={() => handleTypeFilter('discount')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                                typeFilter === 'discount' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <Percent className="w-3 h-3" /> Discounts
                        </button>
                    </div>
                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                        {STATUS_FILTERS.map(status => (
                            <button
                                key={status.value}
                                onClick={() => handleStatusFilter(status.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    statusFilter === status.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Promotion Grid */}
            {promotionList.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
                    <Tag className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-500 text-lg mb-1">No promotions found</p>
                    <p className="text-sm">Create your first promotion to get started</p>
                    {can('create_promotion') && (
                        <button 
                            className="btn-primary mt-4"
                            onClick={() => setModal({ mode: 'add', data: {} })}
                        >
                            <Plus className="w-4 h-4" />
                            Create Promotion
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {promotionList.map(promotion => (
                            <PromotionCard
                                key={promotion.id}
                                promotion={promotion}
                                onEdit={(p) => setModal({ mode: 'edit', data: p })}
                                onDelete={setDeleteTarget}
                                onToggle={handleToggle}
                                canEdit={can('edit_promotion')}
                                canDelete={can('delete_promotion')}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="card px-5 py-3 flex items-center justify-between text-sm text-slate-500 flex-wrap gap-3">
                        <span>
                            Showing <span className="font-semibold text-slate-700">{meta.from ?? 0}</span> to{' '}
                            <span className="font-semibold text-slate-700">{meta.to ?? 0}</span> of{' '}
                            <span className="font-semibold text-slate-700">{meta.total ?? 0}</span> promotions
                        </span>
                        <div className="flex items-center gap-1">
                            {(meta.links ?? []).map((link, i) => (
                                <button 
                                    key={i} 
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all
                                        ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200 disabled:opacity-40'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Modals */}
            {modal && (
                <PromotionModal 
                    mode={modal.mode} 
                    initial={modal.data} 
                    onClose={() => setModal(null)} 
                    allProducts={products} 
                />
            )}

            {deleteTarget && (
                <DeleteDialog 
                    promotion={deleteTarget} 
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)} 
                    processing={deleting} 
                />
            )}
        </MainLayout>
    );
}
