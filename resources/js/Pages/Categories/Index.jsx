import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import { Settings2, Plus, Edit3, Trash2, XCircle, Tag, Layers, CheckCircle } from 'lucide-react';
import axios from 'axios';

/* ─────────────────────────────────────────────────
   ADD CATEGORY MODAL
   ───────────────────────────────────────────────── */
const AddCategoryModal = ({ onClose, onSuccess }) => {
    const { data, setData, post, processing, errors } = useForm({ name: '' });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Add New Category</h3>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Category Name</label>
                        <input 
                            autoFocus 
                            className={`form-input ${errors.name ? 'border-red-400' : ''}`} 
                            placeholder="e.g. Art Supplies" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required 
                        />
                        {errors.name && <p className="form-error mt-1">{errors.name}</p>}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CATEGORY FIELDS MODAL
   ───────────────────────────────────────────────── */
const CategoryFieldsModal = ({ category, onClose, onSave }) => {
    const [fields, setFields] = useState(category.custom_fields || []);
    const [processing, setProcessing] = useState(false);

    const addField = () => {
        setFields([...fields, { key: '', label: '', type: 'text', required: false, options: [] }]);
    };

    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        if (key === 'label' && !newFields[index].key) {
            newFields[index].key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
        }
        setFields(newFields);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(route('categories.fields.update', category.slug), { custom_fields: fields }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                onSave();
            },
            onError: () => {
                alert('Validation error. Please check your fields.');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-[modal-in_200ms_ease]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Custom Fields for "{category.name}"</h2>
                        <p className="text-sm text-slate-500 mt-1">Configure fields that will appear when this category is selected.</p>
                    </div>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {fields.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700 mb-1">No custom fields defined</h3>
                            <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                                Add fields like "Author", "Brand", or "Size" to collect specific information for products in this category.
                            </p>
                            <button type="button" onClick={addField} className="btn-primary inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add First Field
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((f, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-xl border border-slate-200 group">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Label</label>
                                            <input className="form-input text-sm py-2" placeholder="e.g. Author" value={f.label} onChange={e => updateField(i, 'label', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Key (Internal)</label>
                                            <input className="form-input text-sm py-2 font-mono" placeholder="e.g. author" value={f.key} onChange={e => updateField(i, 'key', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
                                            <select className="form-input text-sm py-2" value={f.type} onChange={e => updateField(i, 'type', e.target.value)}>
                                                <option value="text">Text Input</option>
                                                <option value="number">Number</option>
                                                <option value="textarea">Text Area</option>
                                                <option value="select">Dropdown</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center h-full pt-6">
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} />
                                                Required
                                            </label>
                                        </div>
                                        {f.type === 'select' && (
                                            <div className="sm:col-span-2 lg:col-span-4">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Options (comma-separated)</label>
                                                <input className="form-input text-sm py-2" placeholder="e.g. Hardcover, Paperback, E-book" value={f.options?.join(', ') || ''} onChange={e => updateField(i, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => removeField(i)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-6 opacity-0 group-hover:opacity-100" title="Remove Field">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-2">
                                <button type="button" onClick={addField} className="btn-secondary flex items-center gap-2 w-full justify-center border-dashed border-2 hover:border-indigo-400 hover:bg-indigo-50">
                                    <Plus className="w-4 h-4" />
                                    Add Another Field
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl flex-shrink-0">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={processing || fields.some(f => !f.label || !f.key)} className="btn-primary">
                        {processing ? 'Saving...' : 'Save Fields'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   DELETE CONFIRM DIALOG
   ───────────────────────────────────────────────── */
const DeleteCategoryDialog = ({ category, onConfirm, onCancel, processing }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Delete Category?</h3>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">"{category.name}"</span> will be permanently removed. This cannot be undone.
                </p>
                {category.is_system && (
                    <p className="text-xs text-red-500 font-semibold mt-2">
                        Wait, this is a system category and cannot be deleted.
                    </p>
                )}
            </div>
            <div className="flex gap-3 mt-6">
                <button onClick={onCancel} disabled={processing} className="btn-secondary flex-1">Cancel</button>
                <button onClick={onConfirm} disabled={processing || category.is_system} className="btn-danger flex-1">
                    {processing ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);


export default function CategoriesIndex({ auth, categories = [] }) {
    const { can } = usePermissions();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingFieldsCat, setEditingFieldsCat] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        setDeleting(true);
        router.delete(route('categories.destroy', deleteTarget.slug), {
            onSuccess: () => {
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <MainLayout
            activeKey="products"
            onNavigate={(key) => {
                if (key === 'products') router.visit(route('products.index'));
            }}
            pageTitle="Manage Categories"
            user={auth?.user ?? { name: 'Admin', email: 'admin@example.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="Manage Categories" />

            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-500">
                            <button onClick={() => router.visit(route('products.index'))} className="hover:text-indigo-600 transition-colors">Products</button>
                            <span>/</span>
                            <span className="text-slate-800">Categories</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Tag className="w-7 h-7 text-indigo-500" />
                            Categories & Fields
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Define product categories and their specific custom data fields.
                        </p>
                    </div>

                    {can('manage_inventory') && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    )}
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800">{category.name}</h3>
                                        {category.is_system && (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                System
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-mono text-slate-400">{category.slug}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                    <Layers className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 bg-slate-50/50">
                                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Custom Fields ({category.custom_fields?.length || 0})</h4>
                                {category.custom_fields?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {category.custom_fields.map(f => (
                                            <span key={f.key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-sm">
                                                {f.label}
                                                {f.required && <span className="w-1.5 h-1.5 rounded-full bg-red-400" title="Required" />}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No custom fields defined.</p>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                                <button 
                                    onClick={() => setEditingFieldsCat(category)}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Fields
                                </button>
                                {!category.is_system && (
                                    <button 
                                        onClick={() => setDeleteTarget(category)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Modals */}
            {showAddModal && (
                <AddCategoryModal 
                    onClose={() => setShowAddModal(false)} 
                    onSuccess={() => setShowAddModal(false)} 
                />
            )}

            {editingFieldsCat && (
                <CategoryFieldsModal
                    category={editingFieldsCat}
                    onClose={() => setEditingFieldsCat(null)}
                    onSave={() => {
                        setEditingFieldsCat(null);
                        router.reload({ only: ['categories'] });
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteCategoryDialog
                    category={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    processing={deleting}
                />
            )}
        </MainLayout>
    );
}
