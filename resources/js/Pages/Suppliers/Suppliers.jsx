import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { Plus, Edit3, Trash2, XCircle, Truck, Phone, Mail, MapPin, ClipboardList } from 'lucide-react';

/* ─────────────────────────────────────────────────
   ADD / EDIT SUPPLIER MODAL
   ───────────────────────────────────────────────── */
const SupplierFormModal = ({ supplier, onClose, onSuccess }) => {
    const isEditing = !!supplier;
    const { data, setData, post, put, processing, errors } = useForm({
        name: supplier?.name ?? '',
        contact_person: supplier?.contact_person ?? '',
        phone: supplier?.phone ?? '',
        email: supplier?.email ?? '',
        address: supplier?.address ?? '',
        payment_terms: supplier?.payment_terms ?? '',
        notes: supplier?.notes ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = { onSuccess: () => onSuccess() };
        if (isEditing) {
            put(route('suppliers.update', supplier.id), options);
        } else {
            post(route('suppliers.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[modal-in_200ms_ease] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="form-label">Supplier Name</label>
                        <input
                            autoFocus
                            className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                            placeholder="e.g. Northwind Book Distributors"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="form-error mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label">Contact Person</label>
                            <input className="form-input" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`} value={data.email} onChange={e => setData('email', e.target.value)} />
                        {errors.email && <p className="form-error mt-1">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea className="form-input" rows={2} value={data.address} onChange={e => setData('address', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Payment Terms</label>
                        <input className="form-input" placeholder="e.g. Net 30" value={data.payment_terms} onChange={e => setData('payment_terms', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea className="form-input" rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1">
                            {isEditing ? 'Save Changes' : 'Create Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   DELETE CONFIRM DIALOG
   ───────────────────────────────────────────────── */
const DeleteSupplierDialog = ({ supplier, onConfirm, onCancel, processing }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Delete Supplier?</h3>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">"{supplier.name}"</span> will be permanently removed. This cannot be undone.
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

export default function Suppliers({ auth, suppliers = [] }) {
    const { can } = usePermissions();
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('suppliers.destroy', deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <MainLayout
            activeKey="suppliers"
            onNavigate={(key, href) => router.visit(href)}
            pageTitle="Suppliers"
            user={auth?.user ?? { name: 'Admin', email: 'admin@example.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="Suppliers" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-500">
                            <button onClick={() => router.visit(route('purchase-orders.index'))} className="hover:text-indigo-600 transition-colors">Procurement</button>
                            <span>/</span>
                            <span className="text-slate-800">Suppliers</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Truck className="w-7 h-7 text-indigo-500" />
                            Suppliers
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage who you buy stock from. Suppliers are referenced on every purchase order.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => router.visit(route('purchase-orders.index'))} className="btn-secondary flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Purchase Orders
                        </button>
                        {can('manage_suppliers') && (
                            <button onClick={() => { setEditingSupplier(null); setShowFormModal(true); }} className="btn-primary flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Supplier
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700 mb-1">No suppliers yet</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                                Add a supplier before creating a purchase order.
                            </p>
                        </div>
                    )}

                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{supplier.name}</h3>
                                    {supplier.contact_person && <p className="text-xs text-slate-400 mt-0.5">{supplier.contact_person}</p>}
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                    <Truck className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>

                            <div className="p-5 flex-1 bg-slate-50/50 space-y-2 text-sm text-slate-600">
                                {supplier.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{supplier.phone}</div>}
                                {supplier.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{supplier.email}</div>}
                                {supplier.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{supplier.address}</div>}
                                {supplier.payment_terms && (
                                    <p className="text-xs font-semibold text-slate-500 pt-1">Terms: {supplier.payment_terms}</p>
                                )}
                                {!supplier.phone && !supplier.email && !supplier.address && (
                                    <p className="text-sm text-slate-400 italic">No contact details on file.</p>
                                )}
                            </div>

                            {can('manage_suppliers') && (
                                <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => { setEditingSupplier(supplier); setShowFormModal(true); }}
                                        className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(supplier)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        title="Delete Supplier"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showFormModal && (
                <SupplierFormModal
                    supplier={editingSupplier}
                    onClose={() => setShowFormModal(false)}
                    onSuccess={() => { setShowFormModal(false); router.reload({ only: ['suppliers'] }); }}
                />
            )}

            {deleteTarget && (
                <DeleteSupplierDialog
                    supplier={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    processing={deleting}
                />
            )}
        </MainLayout>
    );
}
