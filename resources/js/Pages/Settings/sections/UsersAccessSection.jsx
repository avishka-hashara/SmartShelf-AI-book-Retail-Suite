// resources/js/Pages/Settings/sections/UsersAccessSection.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import ToggleSwitch from '../components/ToggleSwitch';

/* ─────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────── */
const ROLES = [
    { value: 'admin',          label: 'Admin' },
    { value: 'manager',        label: 'Manager' },
    { value: 'cashier',        label: 'Cashier' },
    { value: 'lounge_manager', label: 'Lounge Manager' },
    { value: 'inventory',      label: 'Inventory' },
];

const MANAGEABLE_ROLES = ROLES.filter(r => r.value !== 'admin');

const PERMISSION_GROUPS = {
    'Dashboard': {
        view_dashboard: 'View Dashboard',
    },
    'POS': {
        access_pos:     'Access POS',
        apply_discount: 'Apply Discount',
        process_refund: 'Process Refund',
        hold_sale:      'Hold Sale',
    },
    'Products': {
        view_products:  'View Products',
        create_product: 'Create Product',
        edit_product:   'Edit Product',
        delete_product: 'Delete Product',
    },
    'Customers': {
        view_customers:  'View Customers',
        create_customer: 'Create Customer',
        edit_customer:   'Edit Customer',
        delete_customer: 'Delete Customer',
    },
    'Sales & Reports': {
        view_sales:     'View Sales',
        view_reports:   'View Reports',
        export_reports: 'Export Reports',
    },
    'Employees': {
        view_employees:  'View Employees',
        create_employee: 'Create Employee',
        edit_employee:   'Edit Employee',
        delete_employee: 'Delete Employee',
    },
    'Lounge': {
        access_lounge: 'Access Lounge',
        manage_lounge: 'Manage Lounge',
    },
    'Settings': {
        view_settings: 'View Settings',
        edit_settings: 'Edit Settings',
    },
};

const ROLE_COLORS = {
    admin:          'bg-red-100 text-red-700',
    manager:        'bg-indigo-100 text-indigo-700',
    cashier:        'bg-emerald-100 text-emerald-700',
    lounge_manager: 'bg-amber-100 text-amber-700',
    inventory:      'bg-sky-100 text-sky-700',
};

/* ─────────────────────────────────────────────────
   USER MODAL
   ───────────────────────────────────────────────── */
const UserModal = ({ user, onClose, roles }) => {
    const isEdit = !!user?.id;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:     user?.name  ?? '',
        email:    user?.email ?? '',
        phone:    user?.phone ?? '',
        nic:      user?.nic   ?? '',
        role:     user?.role  ?? 'cashier',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('users.update', user.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Enter full name" />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="user@example.com" />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Phone & NIC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-input" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="07XXXXXXXX" />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                        <div>
                            <label className="form-label">NIC</label>
                            <input type="text" className="form-input" value={data.nic} onChange={e => setData('nic', e.target.value)} placeholder="NIC number" />
                            <InputError message={errors.nic} className="mt-1" />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="form-label">Role</label>
                        <select className="form-input" value={data.role} onChange={e => setData('role', e.target.value)}>
                            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <InputError message={errors.role} className="mt-1" />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="form-label">{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                        <input type="password" className="form-input" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="••••••••" />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Confirm */}
                    <div>
                        <label className="form-label">Confirm Password</label>
                        <input type="password" className="form-input" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="••••••••" />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   SYSTEM USERS TAB
   ───────────────────────────────────────────────── */
const SystemUsersTab = ({ users = [] }) => {
    const [modal, setModal]       = useState(null); // null | 'add' | user object
    const [deleteId, setDeleteId] = useState(null);

    const handleToggleStatus = (id) => {
        router.patch(route('users.toggleStatus', id), {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(route('users.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800">System Users</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button onClick={() => setModal('add')} className="btn-primary text-sm">
                    + Add User
                </button>
            </div>

            {/* Users table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Active</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{u.name}</p>
                                                <p className="text-xs text-slate-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                                            {ROLES.find(r => r.value === u.role)?.label || u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(u.id)}
                                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition
                                                ${u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                            {u.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">
                                        {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setModal(u)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Edit user"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(u.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete user"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                                        No users found. Click "Add User" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Modal */}
            {modal && (
                <UserModal
                    user={modal === 'add' ? null : modal}
                    onClose={() => setModal(null)}
                    roles={ROLES}
                />
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete User?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The user will be permanently removed or deactivated if they have existing orders.</p>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   ROLE PERMISSIONS TAB
   ───────────────────────────────────────────────── */
const RolePermissionsTab = ({ rolePermissions = {} }) => {
    const [selectedRole, setSelectedRole] = useState('manager');
    const [perms, setPerms]               = useState({});
    const [saving, setSaving]             = useState({});
    const [resetting, setResetting]       = useState(false);

    // Initialize perms when role changes or rolePermissions updates
    useEffect(() => {
        const rolePerms = rolePermissions[selectedRole] || {};
        setPerms(rolePerms);
    }, [selectedRole, rolePermissions]);

    const getCsrfToken = () => {
        // Try meta tag first, then XSRF-TOKEN cookie
        const meta = document.querySelector('meta[name="csrf-token"]')?.content;
        if (meta) return meta;
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    };

    const handleToggle = async (permKey, newValue) => {
        // Optimistic update
        setPerms(prev => ({ ...prev, [permKey]: newValue }));
        setSaving(prev => ({ ...prev, [permKey]: true }));

        try {
            const token = getCsrfToken();
            const response = await fetch(route('permissions.update'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    role: selectedRole,
                    permission_key: permKey,
                    is_enabled: newValue,
                }),
            });

            if (!response.ok) {
                // Revert on failure
                setPerms(prev => ({ ...prev, [permKey]: !newValue }));
            }
        } catch {
            setPerms(prev => ({ ...prev, [permKey]: !newValue }));
        } finally {
            setSaving(prev => ({ ...prev, [permKey]: false }));
        }
    };

    const handleReset = async () => {
        setResetting(true);
        try {
            const token = getCsrfToken();
            const response = await fetch(route('permissions.reset'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ role: selectedRole }),
            });

            if (response.ok) {
                // Reload page to get fresh data
                router.reload({ only: ['rolePermissions'] });
            }
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Role Permissions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure what each role can access. Admin always has full access.</p>
                </div>
                <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                >
                    {resetting ? 'Resetting…' : 'Reset to Defaults'}
                </button>
            </div>

            {/* Role selector */}
            <div className="flex items-center gap-2 flex-wrap">
                {MANAGEABLE_ROLES.map(r => (
                    <button
                        key={r.value}
                        onClick={() => setSelectedRole(r.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                            ${selectedRole === r.value
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Permission groups */}
            <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                    <div key={group} className="card">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h4 className="text-sm font-bold text-slate-700">{group}</h4>
                        </div>
                        <div className="px-5">
                            <div className="divide-y divide-slate-100">
                                {Object.entries(permissions).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between gap-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700">{label}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">{key}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {saving[key] && (
                                                <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(key, !perms[key])}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0
                                                    ${perms[key] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                                                    ${perms[key] ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   MAIN SECTION COMPONENT
   ───────────────────────────────────────────────── */
export default function UsersAccessSection({ users = [], rolePermissions = {} }) {
    const [activeTab, setActiveTab] = useState('users');

    const TABS = [
        { key: 'users',       label: 'System Users' },
        { key: 'permissions', label: 'Role Permissions' },
    ];

    return (
        <div className="space-y-6">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition
                            ${activeTab === tab.key
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'users' && <SystemUsersTab users={users} />}
            {activeTab === 'permissions' && <RolePermissionsTab rolePermissions={rolePermissions} />}
        </div>
    );
}
