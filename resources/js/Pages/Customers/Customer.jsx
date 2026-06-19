import React, { useState, useMemo, useEffect } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import { usePermissions } from '@/hooks/usePermissions';
import { useCurrency } from '@/hooks/useCurrency';
import StatCard from "../../Components/Dashboard/StatCard";
import { Trash2, XCircle, CheckCircle, Users, UserPlus, Star } from 'lucide-react';

/* ─────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────── */
const STATUSES = ["Active", "Inactive"];
const PAGE_SIZE = 8;

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
const AVATAR_COLORS = [
    "bg-indigo-100 text-indigo-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-600",
    "bg-cyan-100 text-cyan-600",
    "bg-rose-100 text-rose-600",
    "bg-violet-100 text-violet-600",
    "bg-pink-100 text-pink-600",
];

const getAvatarColor = (name) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name) =>
    name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

/* ─────────────────────────────────────────────────
   CUSTOMER AVATAR
   ───────────────────────────────────────────────── */
const CustomerAvatar = ({ name, avatar }) => {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={name}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
            />
        );
    }
    return (
        <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarColor(name)}`}
        >
            {getInitials(name)}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   STATUS BADGE
   ───────────────────────────────────────────────── */
const StatusBadge = ({ status }) => (
    <span
        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
        ${status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
    >
        {status}
    </span>
);

/* ─────────────────────────────────────────────────
   BREADCRUMB
   ───────────────────────────────────────────────── */
const Breadcrumb = ({ items }) => (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        {items.map((item, i) => (
            <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span
                    className={
                        i === items.length - 1
                            ? "text-slate-600 font-medium"
                            : ""
                    }
                >
                    {item}
                </span>
            </React.Fragment>
        ))}
    </nav>
);

/* ─────────────────────────────────────────────────
   DELETE CONFIRM DIALOG
   ───────────────────────────────────────────────── */
const DeleteDialog = ({ customer, onConfirm, onCancel, processing }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[modal-in_200ms_ease]">
            <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                    Delete Customer?
                </h3>
                <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">
                        "{customer.name}"
                    </span>{" "}
                    will be permanently removed. This cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onCancel}
                    disabled={processing}
                    className="btn-secondary flex-1"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={processing}
                    className="btn-danger flex-1"
                >
                    {processing ? "Deleting…" : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   PURCHASE HISTORY MODAL
   ───────────────────────────────────────────────── */
const HistoryModal = ({ customer, onClose }) => {
    const { formatCurrency } = useCurrency();
    return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modal-in_200ms_ease]">
            <div className="modal-header">
                <div className="flex items-center gap-3">
                    <CustomerAvatar
                        name={customer.name}
                        avatar={customer.avatar}
                    />
                    <div>
                        <h2 className="modal-title">{customer.name}</h2>
                        <p className="text-xs text-slate-400">
                            #{customer.customerId}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="btn-icon text-slate-400 hover:text-slate-600"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div className="modal-body space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-indigo-50 p-3">
                        <p className="text-lg font-bold text-indigo-700">
                            {customer.orders}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Total Orders
                        </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-lg font-bold text-emerald-700">
                            {formatCurrency(customer.totalPurchases)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Total Spent
                        </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-lg font-bold text-amber-600">
                            {customer.loyaltyPts}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Loyalty Pts
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-100 p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="font-medium text-slate-700">
                            {customer.email}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Phone</span>
                        <span className="font-medium text-slate-700">
                            {customer.phone}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Last Visit</span>
                        <span className="font-medium text-slate-700">
                            {customer.lastVisit}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Status</span>
                        <StatusBadge status={customer.status} />
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button onClick={onClose} className="btn-secondary flex-1">
                    Close
                </button>
            </div>
        </div>
    </div>
    );
};

/* ─────────────────────────────────────────────────
   CUSTOMER FORM MODAL  (Add / Edit)
   Uses Inertia useForm — server validation errors
   handled automatically via errors.field
   ───────────────────────────────────────────────── */
const CustomerModal = ({ mode, editId, initial, onClose }) => {
    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: initial.name || "",
        email: initial.email || "",
        phone: initial.phone || "",
        status: initial.status || "Active",
    });

    const set = (field) => (e) => {
        setData(field, e.target.value);
        if (errors[field]) clearErrors(field);
    };

    const handleSubmit = () => {
        if (mode === "add") {
            post("/customers", {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                    // Reload page to refresh the customers data and update stat cards
                    setTimeout(() => {
                        window.location.href = '/customers';
                    }, 500);
                },
            });
        } else {
            patch(`/customers/${editId}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[modal-in_200ms_ease]">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === "add"
                            ? "+ Add New Customer"
                            : "Edit Customer"}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="btn-icon text-slate-400 hover:text-slate-600"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">
                                Full Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`form-input ${errors.name ? "border-red-400" : ""}`}
                                placeholder="e.g. Jane Cooper"
                                value={data.name}
                                onChange={set("name")}
                                disabled={processing}
                            />
                            {errors.name && (
                                <p className="form-error">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">
                                Email Address{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                className={`form-input ${errors.email ? "border-red-400" : ""}`}
                                placeholder="e.g. jane@example.com"
                                value={data.email}
                                onChange={set("email")}
                                disabled={processing}
                            />
                            {errors.email && (
                                <p className="form-error">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label className="form-label">
                                Phone Number{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`form-input ${errors.phone ? "border-red-400" : ""}`}
                                placeholder="e.g. +1 (555) 000-0000"
                                value={data.phone}
                                onChange={set("phone")}
                                disabled={processing}
                            />
                            {errors.phone && (
                                <p className="form-error">{errors.phone}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Account Status</label>
                            <div className="flex gap-2 mt-1">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        disabled={processing}
                                        onClick={() => setData("status", s)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all
                                            ${
                                                data.status === s
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${s === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                                        />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="btn-primary"
                    >
                        {processing
                            ? mode === "add"
                                ? "Adding…"
                                : "Saving…"
                            : mode === "add"
                              ? "Add Customer"
                              : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CUSTOMER PAGE
   ───────────────────────────────────────────────── */
export default function Customer({ auth, customers = [] }) {
    const { can } = usePermissions();
    const { formatCurrency } = useCurrency();
    const { flash } = usePage().props;

    const [activeKey, setActiveKey] = useState("customers");
    const [search, setSearch] = useState("");
    const [activeStatus, setActiveStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [historyTarget, setHistoryTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* ── Flash → Toast ── */
    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (flash?.success) showToast(flash.success, "success");
        if (flash?.error) showToast(flash.error, "danger");
    }, [flash]);

    /* ── Navigation ── */
    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    /* ── Derived stats ── */
    const totalCustomers = customers.length;
    const activeCount = customers.filter((c) => c.status === "Active").length;
    const loyaltyMembers = customers.filter((c) => c.loyaltyPts >= 100).length;
    
    // Calculate "New This Month" by checking createdAt within current month (Feb 2026)
    const newThisMonth = customers.filter((c) => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() 
            && createdDate.getFullYear() === now.getFullYear();
    }).length;

    /* ── Filter + Paginate (client-side) ── */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return customers.filter((c) => {
            const matchStatus =
                activeStatus === "All" || c.status === activeStatus;
            const matchSearch =
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.customerId ?? "").toLowerCase().includes(q) ||
                (c.phone ?? "").includes(q);
            return matchStatus && matchSearch;
        });
    }, [customers, search, activeStatus]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const resetPage = () => setPage(1);

    /* ── Delete ── */
    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/customers/${deleteTarget.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleting(false);
            },
            onError: () => setDeleting(false),
        });
    };

    /* ── Pagination numbers ── */
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
            acc.push(p);
            return acc;
        }, []);

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Customers"
            user={
                auth?.user ?? {
                    name: "Admin User",
                    email: "admin@luminabooks.com",
                }
            }
            onLogout={() => router.post("/logout")}
        >
            <Head title="Customers" />

            {/* ── Toast ── */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up
                    ${toast.type === "danger" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
                >
                    <span>{toast.type === "danger" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</span>
                    {toast.msg}
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <Breadcrumb items={["Lumina Books POS", "Customers"]} />
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse-soft" />
                        {activeCount} active customers · {totalCustomers} total
                    </p>
                </div>
                {can('create_customer') && (
                <button
                    className="btn-primary"
                    onClick={() =>
                        setModal({
                            mode: "add",
                            data: {
                                name: "",
                                email: "",
                                phone: "",
                                status: "Active",
                            },
                        })
                    }
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Customer
                </button>
                )}
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Total Customers"
                    value={String(totalCustomers)}
                    change="+5%"
                    icon={<Users className="w-5 h-5 text-white" />}
                    tone="indigo"
                    subtitle={`${activeCount} active accounts`}
                />
                <StatCard
                    title="New This Month"
                    value={String(newThisMonth)}
                    change="+12%"
                    icon={<UserPlus className="w-5 h-5 text-white" />}
                    tone="teal"
                    subtitle="Joined in February 2026"
                />
                <StatCard
                    title="Loyalty Members"
                    value={String(loyaltyMembers)}
                    change="+3%"
                    icon={<Star className="w-5 h-5 text-white" />}
                    tone="pink"
                    subtitle="100+ loyalty points"
                />
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                {/* Search */}
                <div className="search-input-wrapper flex-1 max-w-md">
                    <span className="search-icon">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                            />
                        </svg>
                    </span>
                    <input
                        className="search-input"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            resetPage();
                        }}
                    />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                    {["All", ...STATUSES].map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setActiveStatus(s);
                                resetPage();
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                ${
                                    activeStatus === s
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">
                                    Customer Name
                                </th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4">Total Purchases</th>
                                <th className="px-6 py-4">Last Visit</th>
                                <th className="px-6 py-4 text-center">
                                    Loyalty Pts
                                </th>
                                <th className="px-6 py-4 rounded-tr-xl text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-20 text-slate-400"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-10 h-10 text-slate-300" />
                                            <p className="font-semibold text-slate-500">
                                                No customers found
                                            </p>
                                            <p className="text-xs">
                                                Try a different search or filter
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        {/* Customer Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <CustomerAvatar
                                                    name={customer.name}
                                                    avatar={customer.avatar}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        ID: #
                                                        {customer.customerId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact Info */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-slate-700">
                                                {customer.email}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {customer.phone}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge
                                                status={customer.status}
                                            />
                                        </td>

                                        {/* Total Purchases */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-slate-900">
                                                {formatCurrency(customer.totalPurchases)}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {customer.orders} Order
                                                {customer.orders !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        </td>

                                        {/* Last Visit */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {customer.lastVisit}
                                        </td>

                                        {/* Loyalty Points */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-amber-500">
                                                {customer.loyaltyPts} pts
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* History */}
                                                <button
                                                    title="View details"
                                                    onClick={() =>
                                                        setHistoryTarget(
                                                            customer,
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </button>

                                                {/* Edit */}
                                                {can('edit_customer') && (
                                                <button
                                                    title="Edit customer"
                                                    onClick={() =>
                                                        setModal({
                                                            mode: "edit",
                                                            data: {
                                                                ...customer,
                                                            },
                                                        })
                                                    }
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center transition-all"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                )}

                                                {/* Delete */}
                                                {can('delete_customer') && (
                                                <button
                                                    title="Delete customer"
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            customer,
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all"
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
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

                {/* ── Pagination ── */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-b-xl flex-wrap gap-3">
                    <span>
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {filtered.length === 0
                                ? 0
                                : (page - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-slate-700">
                            {Math.min(page * PAGE_SIZE, filtered.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {filtered.length}
                        </span>{" "}
                        customers
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="btn-secondary btn-xs disabled:opacity-40"
                        >
                            Previous
                        </button>
                        {pageNumbers.map((p, i) =>
                            p === "…" ? (
                                <span
                                    key={`dots-${i}`}
                                    className="px-1 text-slate-400 text-xs"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
                                >
                                    {p}
                                </button>
                            ),
                        )}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="btn-secondary btn-xs disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Add / Edit Modal ── */}
            {modal && (
                <CustomerModal
                    mode={modal.mode}
                    editId={modal.data?.id}
                    initial={modal.data}
                    onClose={() => setModal(null)}
                />
            )}

            {/* ── Purchase History Modal ── */}
            {historyTarget && (
                <HistoryModal
                    customer={historyTarget}
                    onClose={() => setHistoryTarget(null)}
                />
            )}

            {/* ── Delete Confirmation ── */}
            {deleteTarget && (
                <DeleteDialog
                    customer={deleteTarget}
                    processing={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </MainLayout>
    );
}
