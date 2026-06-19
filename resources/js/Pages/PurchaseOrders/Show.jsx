import React from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, ClipboardList, Printer, Truck, Mail, Phone, MapPin, User, Calendar } from 'lucide-react';
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

const fmt = (n) => `Rs. ${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Show({ auth, purchaseOrder, storeSettings = {} }) {
    const { can } = usePermissions();
    const [printing, setPrinting] = React.useState(false);

    const handlePrint = () => {
        setPrinting(true);
        printPurchaseOrder(purchaseOrder, storeSettings, { onAfterPrint: () => setPrinting(false) });
    };

    return (
        <MainLayout
            activeKey="purchase-orders"
            onNavigate={(key, href) => router.visit(href)}
            pageTitle={`Purchase Order ${purchaseOrder.po_number}`}
            user={auth?.user ?? { name: 'Admin', email: 'admin@example.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title={`PO ${purchaseOrder.po_number}`} />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => router.visit(route('purchase-orders.index'))}
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Purchase Orders
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <ClipboardList className="w-7 h-7 text-indigo-500" />
                            {purchaseOrder.po_number}
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[purchaseOrder.status]}`}>
                                {STATUS_LABELS[purchaseOrder.status]}
                            </span>
                        </h1>
                    </div>

                    <button onClick={handlePrint} disabled={printing} className="btn-primary flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        {printing ? 'Preparing…' : 'Print PO'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" /> Supplier
                        </h3>
                        <p className="text-lg font-bold text-slate-800">{purchaseOrder.supplier?.name}</p>
                        <div className="mt-2 space-y-1.5 text-sm text-slate-600">
                            {purchaseOrder.supplier?.contact_person && (
                                <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" />{purchaseOrder.supplier.contact_person}</div>
                            )}
                            {purchaseOrder.supplier?.phone && (
                                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" />{purchaseOrder.supplier.phone}</div>
                            )}
                            {purchaseOrder.supplier?.email && (
                                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" />{purchaseOrder.supplier.email}</div>
                            )}
                            {purchaseOrder.supplier?.address && (
                                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" />{purchaseOrder.supplier.address}</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Order Details
                        </h3>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Order Date</p>
                                <p className="font-semibold text-slate-700 mt-0.5">{formatDate(purchaseOrder.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Expected</p>
                                <p className="font-semibold text-slate-700 mt-0.5">{formatDate(purchaseOrder.expected_date)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 uppercase tracking-wide">Received</p>
                                <p className="font-semibold text-slate-700 mt-0.5">{formatDate(purchaseOrder.received_date)}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 text-sm">
                            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Created By</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{purchaseOrder.creator?.name ?? '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-700">Line Items</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="text-left px-5 py-3">Product</th>
                                <th className="text-right px-5 py-3">Qty Ordered</th>
                                <th className="text-right px-5 py-3">Qty Received</th>
                                <th className="text-right px-5 py-3">Unit Cost</th>
                                <th className="text-right px-5 py-3">Line Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {purchaseOrder.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-5 py-3">
                                        <p className="font-semibold text-slate-700">{item.product?.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{item.product?.sku}</p>
                                    </td>
                                    <td className="px-5 py-3 text-right">{item.qty_ordered}</td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={item.qty_received >= item.qty_ordered ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                                            {item.qty_received}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">{fmt(item.unit_cost)}</td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-700">{fmt(item.qty_ordered * item.unit_cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50">
                                <td colSpan={4} className="px-5 py-3 text-right font-bold text-slate-700">Total</td>
                                <td className="px-5 py-3 text-right font-bold text-slate-900">{fmt(purchaseOrder.total_cost)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {purchaseOrder.notes && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{purchaseOrder.notes}</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
