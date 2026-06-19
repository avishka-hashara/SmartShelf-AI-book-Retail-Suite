import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { Plus, XCircle, ClipboardList, Trash2, PackageCheck, Truck, Eye, Printer } from 'lucide-react';
import { printPurchaseOrder } from './poPrint';

const STATUS_STYLES = {
    draft: 'bg-slate-100 text-slate-600',
    ordered: 'bg-amber-100 text-amber-700',
    partially_received: 'bg-sky-100 text-sky-700',
    received: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
    draft: 'Draft',
    ordered: 'Ordered',
    partially_received: 'Partially Received',
    received: 'Received',
    cancelled: 'Cancelled',
};

/* ─────────────────────────────────────────────────
   PRODUCT SEARCH INPUT (single line item)
   ───────────────────────────────────────────────── */
const ProductSearch = ({ products, value, onChange, onSelect }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(() => products.find(p => p.id === value) || null);
    const containerRef = React.useRef(null);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = query.trim().length === 0
        ? products.slice(0, 8)
        : products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);

    const handleSelect = (product) => {
        setSelectedProduct(product);
        setQuery('');
        setOpen(false);
        onSelect(product);
    };

    const handleClear = () => {
        setSelectedProduct(null);
        setQuery('');
        onChange('');
    };

    return (
        <div ref={containerRef} className="relative col-span-5">
            {selectedProduct ? (
                <div className="flex items-center gap-2 form-input text-sm py-2 bg-indigo-50 border-indigo-300">
                    <span className="flex-1 truncate font-semibold text-indigo-800">
                        {selectedProduct.name}
                        <span className="text-indigo-400 font-normal ml-1">({selectedProduct.sku})</span>
                    </span>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-indigo-400 hover:text-red-500 flex-shrink-0 transition-colors"
                        title="Change product"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="form-input text-sm py-2 pl-8 w-full"
                        placeholder="Search product by name or SKU…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        autoComplete="off"
                    />
                </div>
            )}

            {open && !selectedProduct && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">No products found</div>
                    ) : (
                        filtered.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors flex items-center justify-between gap-3 group"
                                onClick={() => handleSelect(p)}
                            >
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700">{p.name}</span>
                                    <span className="block text-xs text-slate-400 font-mono">{p.sku}</span>
                                </span>
                                {p.stock_level !== undefined && (
                                    <span className={`text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full ${p.stock_level <= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {p.stock_level} in stock
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CREATE PO MODAL
   ───────────────────────────────────────────────── */
const CreatePoModal = ({ suppliers, products, onClose, onSuccess }) => {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: suppliers[0]?.id ?? '',
        status: 'ordered',
        order_date: new Date().toISOString().slice(0, 10),
        expected_date: '',
        notes: '',
        items: [{ product_id: '', qty_ordered: 1, unit_cost: '' }],
    });

    const updateItem = (index, key, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], [key]: value };
        setData('items', items);
    };

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', qty_ordered: 1, unit_cost: '' }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const total = data.items.reduce((sum, i) => sum + (Number(i.qty_ordered) || 0) * (Number(i.unit_cost) || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchase-orders.store'), { onSuccess: () => onSuccess() });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 animate-[modal-in_200ms_ease] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Create Purchase Order</h3>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                            <label className="form-label">Supplier</label>
                            <select className={`form-input ${errors.supplier_id ? 'border-red-400' : ''}`} value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)} required>
                                {suppliers.length === 0 && <option value="">No suppliers — add one first</option>}
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {errors.supplier_id && <p className="form-error mt-1">{errors.supplier_id}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Order Date</label>
                            <input type="date" className="form-input" value={data.order_date} onChange={e => setData('order_date', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expected Date</label>
                            <input type="date" className="form-input" value={data.expected_date} onChange={e => setData('expected_date', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label mb-0">Line Items</label>
                            <button type="button" onClick={addItem} className="text-sm text-indigo-600 font-semibold flex items-center gap-1 hover:text-indigo-700">
                                <Plus className="w-4 h-4" /> Add Line
                            </button>
                        </div>
                        <div className="space-y-2">
                            {data.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <ProductSearch
                                        products={products}
                                        value={item.product_id}
                                        onChange={(val) => updateItem(i, 'product_id', val)}
                                        onSelect={(product) => {
                                            updateItem(i, 'product_id', product.id);
                                        }}
                                    />
                                    <input type="number" min="1" className="form-input text-sm py-2 col-span-2" placeholder="Qty" value={item.qty_ordered} onChange={e => updateItem(i, 'qty_ordered', e.target.value)} required />
                                    <input type="number" min="0" step="0.01" className="form-input text-sm py-2 col-span-3" placeholder="Unit Cost" value={item.unit_cost} onChange={e => updateItem(i, 'unit_cost', e.target.value)} required />
                                    <span className="text-sm text-slate-500 col-span-1">
                                        {((Number(item.qty_ordered) || 0) * (Number(item.unit_cost) || 0)).toFixed(2)}
                                    </span>
                                    <button type="button" onClick={() => removeItem(i)} disabled={data.items.length === 1} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors col-span-1 disabled:opacity-30">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {errors.items && <p className="form-error mt-1">{errors.items}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-input" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-700">Total: Rs. {total.toFixed(2)}</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={processing || suppliers.length === 0} className="btn-primary">Create PO</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   RECEIVE STOCK MODAL
   ───────────────────────────────────────────────── */
const ReceiveStockModal = ({ po, onClose, onSuccess }) => {
    const pendingLines = po.items.filter(i => i.qty_received < i.qty_ordered);
    const [quantities, setQuantities] = useState(
        Object.fromEntries(pendingLines.map(i => [i.id, i.qty_ordered - i.qty_received]))
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        const lines = pendingLines
            .map(i => ({ purchase_order_item_id: i.id, qty_received_now: Number(quantities[i.id]) || 0 }))
            .filter(l => l.qty_received_now > 0);

        router.post(route('purchase-orders.receive', po.id), { lines }, {
            onSuccess: () => onSuccess(),
            onError: (errs) => setError(Object.values(errs)[0] ?? 'Failed to receive stock.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[modal-in_200ms_ease] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Receive Stock — {po.po_number}</h3>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                {error && <p className="form-error mb-3">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-3">
                    {pendingLines.map(item => {
                        const remaining = item.qty_ordered - item.qty_received;
                        return (
                            <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{item.product?.name}</p>
                                    <p className="text-xs text-slate-400">Ordered {item.qty_ordered} · Received {item.qty_received} · Remaining {remaining}</p>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    max={remaining}
                                    className="form-input text-sm py-2 w-24 text-right"
                                    value={quantities[item.id]}
                                    onChange={e => setQuantities({ ...quantities, [item.id]: e.target.value })}
                                />
                            </div>
                        );
                    })}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1">
                            {processing ? 'Receiving…' : 'Confirm Receipt'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function PurchaseOrders({ auth, purchaseOrders = [], suppliers = [], products = [], storeSettings = {} }) {
    const { can } = usePermissions();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [receivingPo, setReceivingPo] = useState(null);
    const [printingId, setPrintingId] = useState(null);

    const handlePrint = (po) => {
        setPrintingId(po.id);
        printPurchaseOrder(po, storeSettings, { onAfterPrint: () => setPrintingId(null) });
    };

    const handleCancel = (po) => {
        if (!confirm(`Cancel purchase order ${po.po_number}?`)) return;
        router.put(route('purchase-orders.update', po.id), { status: 'cancelled' }, {
            onSuccess: () => router.reload({ only: ['purchaseOrders'] }),
        });
    };

    return (
        <MainLayout
            activeKey="purchase-orders"
            onNavigate={(key, href) => router.visit(href)}
            pageTitle="Purchase Orders"
            user={auth?.user ?? { name: 'Admin', email: 'admin@example.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="Purchase Orders" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-500">
                            <button onClick={() => router.visit(route('suppliers.index'))} className="hover:text-indigo-600 transition-colors">Procurement</button>
                            <span>/</span>
                            <span className="text-slate-800">Purchase Orders</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ClipboardList className="w-7 h-7 text-indigo-500" />
                            Purchase Orders
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Order stock from suppliers and receive it into inventory — every receipt is logged and traceable.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => router.visit(route('suppliers.index'))} className="btn-secondary flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Suppliers
                        </button>
                        {can('manage_purchase_orders') && (
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Create PO
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-5 py-3">PO Number</th>
                                <th className="text-left px-5 py-3">Supplier</th>
                                <th className="text-left px-5 py-3">Order Date</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-right px-5 py-3">Total Cost</th>
                                <th className="text-right px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {purchaseOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                                        No purchase orders yet. Create one to receive stock from a supplier.
                                    </td>
                                </tr>
                            )}
                            {purchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-slate-50/50">
                                    <td className="px-5 py-3 font-mono font-semibold">
                                        <button onClick={() => router.visit(route('purchase-orders.show', po.id))} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                            {po.po_number}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600">{po.supplier?.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{po.order_date}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[po.status]}`}>
                                            {STATUS_LABELS[po.status]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-700">Rs. {Number(po.total_cost).toFixed(2)}</td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => router.visit(route('purchase-orders.show', po.id))} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handlePrint(po)} disabled={printingId === po.id} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40" title="Print PO">
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            {can('manage_purchase_orders') && ['ordered', 'partially_received'].includes(po.status) && (
                                                <button onClick={() => setReceivingPo(po)} className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs">
                                                    <PackageCheck className="w-3.5 h-3.5" />
                                                    Receive
                                                </button>
                                            )}
                                            {can('manage_purchase_orders') && ['draft', 'ordered'].includes(po.status) && (
                                                <button onClick={() => handleCancel(po)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel PO">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <CreatePoModal
                    suppliers={suppliers}
                    products={products}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); router.reload({ only: ['purchaseOrders'] }); }}
                />
            )}

            {receivingPo && (
                <ReceiveStockModal
                    po={receivingPo}
                    onClose={() => setReceivingPo(null)}
                    onSuccess={() => { setReceivingPo(null); router.reload({ only: ['purchaseOrders'] }); }}
                />
            )}
        </MainLayout>
    );
}
