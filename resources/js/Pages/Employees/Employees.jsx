import React, { useState, useEffect } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { usePermissions } from '@/hooks/usePermissions';
import Badge, { statusVariant } from '@/Components/UI/Badge';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return <div style={{ padding: 20, color: 'red', background: '#ffebee' }}>
                <h1>React Crashed!</h1>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.error?.stack}</pre>
            </div>;
        }
        return this.props.children;
    }
}

export default function Employees({ auth, employees, filters = {}, stats = {} }) {
    const { can } = usePermissions();
    const currentUserId = auth?.user?.id;
    const [activeKey, setActiveKey] = useState('staff');

    // Filters State
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');

    // Debounced Search
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('staff.index'),
                { search, role: roleFilter },
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, roleFilter]);

    // Lively updates: Automatically refresh employee status and stats from server every 30 seconds
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => {
            // Partial reload: Only fetch 'employees' and 'stats' props, without a full page refresh
            router.reload({
                only: ['employees', 'stats'],
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setLastRefresh(Date.now())
            });
        }, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Modals State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [showProtectedWarning, setShowProtectedWarning] = useState(false);
    const [protectedWarningMessage, setProtectedWarningMessage] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form setup for Add/Edit
    const { data, setData, post, put, delete: destroy, errors, setError, processing, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        nic: '',
        role: 'cashier',
        status: 'active',
        password: '',
        pin: '',
        password_confirmation: '',
        admin_password: '',
        avatar: null,
    });

    // Format Date / timeago
    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) {
            if (Math.floor(interval) === 1) return "Yesterday";
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    const isOnline = (emp) => {
        if (emp.clocked_in) return true;
        if (!emp.last_active_at) return false;
        // Check if last active within 5 minutes
        const lastActive = new Date(emp.last_active_at);
        const diffMinutes = Math.abs(new Date() - lastActive) / (1000 * 60);
        return diffMinutes <= 3;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getRoleLabel = (role) => {
        const map = {
            'admin': 'Admin',
            'cashier': 'Cashier',
            'lounge_manager': 'Lounge Manager',
            'inventory': 'Inventory'
        };
        return map[role] || role;
    };

    const getRoleBadgeClasses = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'cashier': return 'bg-blue-100 text-blue-700';
            case 'lounge_manager': return 'bg-amber-100 text-amber-700';
            case 'inventory': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    // Actions
    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (employee) => {
        clearErrors();
        setSelectedEmployee(employee);
        setData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone || '',
            nic: employee.nic || '',
            role: employee.role,
            status: employee.status,
            password: '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (employee) => {
        // Guard: prevent self-deactivation
        if (employee.id === currentUserId) {
            setProtectedWarningMessage('You cannot deactivate your own account. Ask another admin to manage your account if needed.');
            setShowProtectedWarning(true);
            return;
        }
        // Guard: prevent deactivating other admins
        if (employee.role === 'admin') {
            setProtectedWarningMessage('Admin accounts cannot be deactivated from Staff Management. Use Settings → Users & Access Control instead.');
            setShowProtectedWarning(true);
            return;
        }
        setSelectedEmployee(employee);
        setIsDeleteModalOpen(true);
    };

    const openPinModal = (employee) => {
        clearErrors();
        setSelectedEmployee(employee);
        setData('pin', '');
        setIsPinModalOpen(true);
    };

    const openPasswordModal = (employee) => {
        clearErrors();
        setSelectedEmployee(employee);
        setData({ password: '', password_confirmation: '', admin_password: '' });
        setIsPasswordModalOpen(true);
    };

    const openPerformanceModal = (employee) => {
        setSelectedEmployee(employee);
        setIsPerformanceModalOpen(true);
    };

    // Calculate aggregated performance
    const getAggregatedPerformance = (employee) => {
        if (!employee || !employee.performance) return { sales: 0, tokens: 0, voids: 0 };
        return employee.performance.reduce((acc, curr) => ({
            sales: acc.sales + parseFloat(curr.retail_sales || 0),
            tokens: acc.tokens + parseInt(curr.lounge_tokens || 0, 10),
            voids: acc.voids + parseInt(curr.transaction_voids || 0, 10),
        }), { sales: 0, tokens: 0, voids: 0 });
    };

    // Submits
    const handleAdd = (e) => {
        e.preventDefault();

        // Frontend Validation
        let hasErrors = false;
        clearErrors();

        if (data.phone && !/^\d{10}$/.test(data.phone)) {
            setError('phone', 'Phone number must be exactly 10 digits.');
            hasErrors = true;
        }

        if (data.nic && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(data.nic)) {
            setError('nic', 'NIC must be 9 digits followed by a letter, or exactly 12 digits.');
            hasErrors = true;
        }

        if (hasErrors) return;

        post(route('staff.store'), {
            onSuccess: () => setIsAddModalOpen(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();

        // Frontend Validation
        let hasErrors = false;
        clearErrors();

        if (data.phone && !/^\d{10}$/.test(data.phone)) {
            setError('phone', 'Phone number must be exactly 10 digits.');
            hasErrors = true;
        }

        if (data.nic && !/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(data.nic)) {
            setError('nic', 'NIC must be 9 digits followed by a letter, or exactly 12 digits.');
            hasErrors = true;
        }

        if (hasErrors) return;

        put(route('staff.update', selectedEmployee.id), {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleDelete = (e) => {
        e.preventDefault();
        destroy(route('staff.destroy', selectedEmployee.id), {
            onSuccess: () => setIsDeleteModalOpen(false),
        });
    };

    const handleResetPin = (e) => {
        e.preventDefault();
        post(route('staff.resetPin', selectedEmployee.id), {
            onSuccess: () => setIsPinModalOpen(false),
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        post(route('staff.resetPassword', selectedEmployee.id), {
            onSuccess: () => setIsPasswordModalOpen(false),
        });
    };


    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file || !selectedEmployee) return;

        // Use Inertia's router directly since we aren't submitting the main useForm here
        router.post(route('staff.uploadAvatar', selectedEmployee.id), {
            _method: 'post',
            avatar: file,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // Update the selectedEmployee reference so the modal updates immediately
                const updatedEmployee = employees.data.find(emp => emp.id === selectedEmployee.id);
                if (updatedEmployee) {
                    setSelectedEmployee(updatedEmployee);
                }
            }
        });
    };

    return (
        <ErrorBoundary>
            <MainLayout
                activeKey={activeKey}
                onNavigate={(key, href) => { setActiveKey(key); if (href) router.visit(href); }}
                pageTitle="Staff Management"
                user={auth?.user ?? { name: 'Admin', email: 'admin@pos.com' }}
                onLogout={() => router.post('/logout')}
            >
                <Head title="Staff Management" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <span>Lumina Books POS</span>
                            <span>/</span>
                            <span className="text-indigo-600 font-medium">Staff Management</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex w-2 h-2 rounded-full bg-emerald-500"></span>
                            <p className="text-sm text-slate-500">System Online — {stats?.online || 0} Online / {stats?.total || 0} Active Staff Members</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        {can('create_employee') && (
                            <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Employee
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm">
                    <div className="relative w-full lg:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, ID, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 border-0 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-sm shadow-none"
                        />
                    </div>

                    <div className="flex space-x-1 w-full lg:w-auto overflow-x-auto">
                        {['all', 'admin', 'cashier', 'lounge_manager', 'inventory'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${roleFilter === role
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {role === 'all' ? 'All Staff' : role === 'inventory' ? 'Inventory' : getRoleLabel(role) + 's'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-white text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 border-b border-transparent">
                                {employees.data.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openPerformanceModal(employee)}>
                                                {employee.avatar ? (
                                                    <img src={`/storage/${employee.avatar}`} alt={employee.name} className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-indigo-500 transition-all border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold group-hover:ring-2 group-hover:ring-indigo-500 transition-all">
                                                        {getInitials(employee.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{employee.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">ID: {employee.employee_id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClasses(employee.role)}`}>
                                                {getRoleLabel(employee.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${isOnline(employee) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {isOnline(employee) ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {employee.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {isOnline(employee) ? (
                                                <span className="text-emerald-600 font-medium">Active Now</span>
                                            ) : formatTimeAgo(employee.last_active_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-3 text-slate-400">
                                                {/* "You" badge for current user */}
                                                {employee.id === currentUserId && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-100 text-indigo-700">You</span>
                                                )}
                                                {/* "Admin" badge for other admin accounts */}
                                                {employee.id !== currentUserId && employee.role === 'admin' && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-700">Admin</span>
                                                )}
                                                <button onClick={() => openPerformanceModal(employee)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="View Profile">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </button>
                                                {can('edit_employee') && (
                                                    <button onClick={() => openEditModal(employee)} className="hover:text-indigo-600 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {can('delete_employee') && employee.id !== currentUserId && employee.role !== 'admin' && (
                                                    <button onClick={() => openDeleteModal(employee)} className="hover:text-rose-600 transition-colors" title="Deactivate">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {employees.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                            No employees found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Simplified visually) */}
                    {employees.links && employees.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Showing {employees.from || 0} to {employees.to || 0} of {employees.total} entries
                            </span>
                            <div className="flex items-center gap-1.5">
                                {employees.links.map((link, i) => {
                                    const isPrev = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');
                                    const label = isPrev ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    ) : isNext ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    ) : link.label;

                                    return link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md ${link.active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={i}
                                            className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md bg-white border border-slate-200 text-slate-300"
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/*  Modals  */}
                {/* Add Employee Modal */}
                <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                    <form onSubmit={handleAdd} className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-6">Add New Employee</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput id="name" type="text" className="mt-1 block w-full" placeholder="e.g. John Doe" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput id="email" type="email" className="mt-1 block w-full" placeholder="e.g. john@example.com" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput id="phone" type="text" className="mt-1 block w-full" placeholder="e.g. 0771234567" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="nic" value="NIC" />
                                <TextInput id="nic" type="text" className="mt-1 block w-full" placeholder="e.g. 199912345V or 199912345678" value={data.nic} onChange={e => setData('nic', e.target.value)} />
                                <InputError message={errors.nic} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="role" value="Role" />
                                <select id="role" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.role} onChange={e => setData('role', e.target.value)} required>
                                    <option value="admin">Admin</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="lounge_manager">Lounge Manager</option>
                                    <option value="inventory">Inventory</option>
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select id="status" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.status} onChange={e => setData('status', e.target.value)} required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                            <div className="md:col-span-2 relative">
                                <InputLabel htmlFor="password" value="Temporary Password" />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="mt-1 block w-full pr-10"
                                        placeholder="Enter a secure password for the employee"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsAddModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Save Employee</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Edit Employee Modal */}
                <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <form onSubmit={handleEdit} className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-6">Edit Employee: {selectedEmployee?.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="edit_name" value="Full Name" />
                                <TextInput id="edit_name" type="text" className="mt-1 block w-full" placeholder="e.g. John Doe" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_email" value="Email Address" />
                                <TextInput id="edit_email" type="email" className="mt-1 block w-full" placeholder="e.g. john@example.com" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_phone" value="Phone Number" />
                                <TextInput id="edit_phone" type="text" className="mt-1 block w-full" placeholder="e.g. 0771234567" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_nic" value="NIC" />
                                <TextInput id="edit_nic" type="text" className="mt-1 block w-full" placeholder="e.g. 199912345V or 199912345678" value={data.nic} onChange={e => setData('nic', e.target.value)} />
                                <InputError message={errors.nic} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_role" value="Role" />
                                <select id="edit_role" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.role} onChange={e => setData('role', e.target.value)} required>
                                    <option value="admin">Admin</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="lounge_manager">Lounge Manager</option>
                                    <option value="inventory">Inventory</option>
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="edit_status" value="Status" />
                                <select id="edit_status" className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" value={data.status} onChange={e => setData('status', e.target.value)} required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 text-sm font-medium">
                                <button type="button" onClick={() => openPinModal(selectedEmployee)} className="text-indigo-600 hover:text-indigo-800 transition-colors">Reset PIN</button>
                                <span className="text-slate-300">|</span>
                                <button type="button" onClick={() => openPasswordModal(selectedEmployee)} className="text-indigo-600 hover:text-indigo-800 transition-colors">Reset Password</button>
                            </div>
                            <div className="flex justify-end gap-3 w-full md:w-auto">
                                <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Cancel</SecondaryButton>
                                <PrimaryButton disabled={processing}>Update Employee</PrimaryButton>
                            </div>
                        </div>
                    </form>
                </Modal>

                {/* Deactivate/Delete Modal */}
                <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                    <form onSubmit={handleDelete} className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Deactivate Employee</h2>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to deactivate {selectedEmployee?.name}? They will no longer be able to log in or access the POS.
                        </p>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</SecondaryButton>
                            <DangerButton disabled={processing}>Deactivate Employee</DangerButton>
                        </div>
                    </form>
                </Modal>

                {/* Reset PIN Modal */}
                <Modal show={isPinModalOpen} onClose={() => setIsPinModalOpen(false)}>
                    <form onSubmit={handleResetPin} className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Reset POS PIN</h2>
                        <p className="text-sm text-slate-600 mb-6">
                            Set a new 4-digit PIN for {selectedEmployee?.name} to access the POS register.
                        </p>
                        <div className="mb-4">
                            <InputLabel htmlFor="pin" value="New 4-Digit PIN" />
                            <TextInput id="pin" type="text" maxLength={4} className="mt-1 block w-full text-center tracking-[1em] font-mono text-xl" value={data.pin} onChange={e => setData('pin', e.target.value.replace(/\D/g, ''))} required />
                            <InputError message={errors.pin} className="mt-2" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsPinModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing || !data.pin || data.pin.length !== 4}>Save PIN</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Reset Password Modal */}
                <Modal show={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
                    <form onSubmit={handleResetPassword} className="p-6">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Reset Password</h2>
                        <p className="text-sm text-slate-600 mb-6">
                            Set a new login password for {selectedEmployee?.name}.
                        </p>
                        <div className="mb-4">
                            <InputLabel htmlFor="admin_password" value="Your Current Password (Admin)" />
                            <div className="relative mt-1">
                                <TextInput id="admin_password" type={showPassword ? "text" : "password"} className="block w-full pr-10" placeholder="Enter your own password to verify identity" value={data.admin_password} onChange={e => setData('admin_password', e.target.value)} required />
                                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.admin_password} className="mt-2" />
                        </div>
                        <hr className="my-4 border-slate-100" />
                        <div className="mb-4">
                            <InputLabel htmlFor="reset_password" value="New Password" />
                            <div className="relative mt-1">
                                <TextInput id="reset_password" type={showPassword ? "text" : "password"} className="block w-full pr-10" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        <div className="mb-4">
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <div className="relative mt-1">
                                <TextInput id="password_confirmation" type={showPassword ? "text" : "password"} className="block w-full pr-10" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required />
                                <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsPasswordModalOpen(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>Reset Password</PrimaryButton>
                        </div>
                    </form>
                </Modal>

                {/* Employee Profile Modal */}
                <Modal show={isPerformanceModalOpen} onClose={() => setIsPerformanceModalOpen(false)} maxWidth="5xl">
                    <div className="bg-white flex flex-col max-h-[90vh] p-6">
                        <div className="flex items-center justify-between mb-6 shrink-0 bg-white z-20">
                            <div className="flex items-center gap-3">
                                {selectedEmployee?.avatar ? (
                                    <img src={`/storage/${selectedEmployee.avatar}`} alt={selectedEmployee.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {getInitials(selectedEmployee?.name)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-lg font-medium text-slate-900 leading-tight">{selectedEmployee?.name}</h2>
                                    <p className="text-xs text-slate-500 font-medium">Employee Profile & Performance Dashboard</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPerformanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {selectedEmployee && (
                            <div className="overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left Column: Identity & Security */}
                                    <div className="lg:col-span-4 space-y-6">

                                        {/* Identity Card */}
                                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">

                                            <div className="flex flex-col items-center mb-6 relative group">
                                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)]">
                                                    {selectedEmployee.avatar ? (
                                                        <img src={`/storage/${selectedEmployee.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl">
                                                            {getInitials(selectedEmployee.name)}
                                                        </div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                                                        <svg className="w-6 h-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Change</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                    </label>
                                                </div>
                                                <div className="text-center mt-3">
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${selectedEmployee.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {selectedEmployee.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                                    <span className="text-sm text-slate-500">Employee ID</span>
                                                    <span className="text-sm font-medium text-slate-900 font-mono">{selectedEmployee.employee_id || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                                    <span className="text-sm text-slate-500">System Role</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getRoleBadgeClasses(selectedEmployee.role)}`}>
                                                        {getRoleLabel(selectedEmployee.role)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                                    <span className="text-sm text-slate-500">Hire Date</span>
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {new Date(selectedEmployee.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                                    <span className="text-sm text-slate-500">NIC</span>
                                                    <span className="text-sm font-medium text-slate-900">{selectedEmployee.nic || 'Not provided'}</span>
                                                </div>
                                                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                                    <span className="text-sm text-slate-500">Phone</span>
                                                    <span className="text-sm font-medium text-slate-900">{selectedEmployee.phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-slate-500">Email Address</span>
                                                    <span className="text-sm font-medium text-slate-900 truncate" title={selectedEmployee.email}>{selectedEmployee.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Security & Access Card */}
                                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                                            {/* Decorative security pattern */}
                                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7.5 3.33V11c0 4.52-2.98 8.69-7.5 9.88-4.52-1.19-7.5-5.36-7.5-9.88V6.51l7.5-3.33zM12 7a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4z" /></svg>
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Security & Access</h3>

                                            <div className="space-y-3 relative z-10">
                                                <button
                                                    onClick={() => { setIsPerformanceModalOpen(false); openPinModal(selectedEmployee); }}
                                                    className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M15.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">POS Register PIN</p>
                                                            <p className="text-xs text-slate-500">Generate a new 4-digit pin</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>

                                                <button
                                                    onClick={() => { setIsPerformanceModalOpen(false); openPasswordModal(selectedEmployee); }}
                                                    className="w-full flex justify-between items-center p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700">System Password</p>
                                                            <p className="text-xs text-slate-500">Reset dashboard login keys</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Right Column: Performance & Shifts */}
                                    <div className="lg:col-span-8 flex flex-col gap-6">

                                        {/* Aggregated KPI Cards */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">All-Time Performance Output</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-2xl shadow-indigo-200 shadow-md text-white relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20">
                                                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" /></svg>
                                                    </div>
                                                    <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Total Retail Sales</p>
                                                    <p className="text-3xl font-bold relative z-10">${getAggregatedPerformance(selectedEmployee).sales.toFixed(2)}</p>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Lounge Tokens</p>
                                                    <p className="text-3xl font-bold text-slate-800">{getAggregatedPerformance(selectedEmployee).tokens}</p>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
                                                    <p className="text-rose-500 text-xs font-semibold uppercase tracking-wider mb-1">Tx Voids</p>
                                                    <p className="text-3xl font-bold text-rose-600">{getAggregatedPerformance(selectedEmployee).voids}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Shifts Table */}
                                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Shift Logs</h3>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 10 Shifts</span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                {selectedEmployee.shifts && selectedEmployee.shifts.length > 0 ? (
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-100">
                                                            <tr>
                                                                <th className="px-5 py-3 whitespace-nowrap">Date</th>
                                                                <th className="px-5 py-3 whitespace-nowrap">Clock In</th>
                                                                <th className="px-5 py-3 whitespace-nowrap">Clock Out</th>
                                                                <th className="px-5 py-3 whitespace-nowrap text-right">Duration</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {selectedEmployee.shifts.map((shift, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="px-5 py-3 font-medium text-slate-700">
                                                                        {new Date(shift.clocked_in_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                    </td>
                                                                    <td className="px-5 py-3 text-slate-600">
                                                                        {new Date(shift.clocked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        {shift.clocked_out_at ? (
                                                                            <span className="text-slate-600">
                                                                                {new Date(shift.clocked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/50 text-emerald-700 text-xs font-semibold">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                                Active Now
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-5 py-3 text-right">
                                                                        {shift.total_hours ? (
                                                                            <span className="font-mono text-slate-700 font-medium">{parseFloat(shift.total_hours).toFixed(2)} hr</span>
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center">
                                                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-600">No shift records found</p>
                                                        <p className="text-xs text-slate-400 mt-1">This employee hasn't logged any shifts yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>

                {/* Protected Account Warning Modal */}
                <Modal show={showProtectedWarning} onClose={() => setShowProtectedWarning(false)}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Action Not Allowed</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">{protectedWarningMessage}</p>
                        <div className="flex justify-end">
                            <SecondaryButton onClick={() => setShowProtectedWarning(false)}>Understood</SecondaryButton>
                        </div>
                    </div>
                </Modal>

            </MainLayout>
        </ErrorBoundary>
    );
}
