import React, { useState, useMemo, useEffect } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useCurrency } from '@/hooks/useCurrency';
import MainLayout from "../../Layouts/MainLayout";
import StatCard from "../../Components/Dashboard/StatCard";
import { DollarSign, ShoppingCart, BarChart3, RotateCcw } from 'lucide-react';

/* ─────────────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────────────── */
const PAGE_SIZE = 8;

const STATUS_STYLES = {
    Completed: "bg-emerald-100 text-emerald-800",
    Pending: "bg-amber-100  text-amber-700",
    Cancelled: "bg-red-100    text-red-700",
    Requested: "bg-sky-100    text-sky-700",
    Approved: "bg-emerald-100 text-emerald-800",
    Rejected: "bg-red-100    text-red-700",
    Processed: "bg-indigo-100 text-indigo-700",
};

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "Digital Wallet"];

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
   STATUS BADGE
   ───────────────────────────────────────────────── */
const StatusBadge = ({ status }) => (
    <span
        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}
    >
        {status}
    </span>
);

/* ─────────────────────────────────────────────────
   ORDER DETAIL MODAL
   ───────────────────────────────────────────────── */
const OrderDetailModal = ({ order, onClose, onEdit, onCancel, onReturn }) => {
    const { formatCurrency } = useCurrency();
    const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[modal-in_200ms_ease]">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title font-mono text-indigo-700">
                            {order.orderId}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {order.date} · {order.time}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
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
                </div>

                {/* Body */}
                <div className="modal-body space-y-4">
                    {/* Customer */}
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Customer
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                            {order.customer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {order.customer.email}
                        </p>
                    </div>

                    {/* Items */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Order Items
                        </p>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            <table className="table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">
                                            Item
                                        </th>
                                        <th className="px-4 py-2.5 text-center">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-right">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {order.items.map((item, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="px-4 py-2.5 font-medium text-slate-700">
                                                {item.title}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-slate-500">
                                                {item.qty}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-700 font-medium">
                                                {formatCurrency(item.qty * item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500">
                            <span>Payment Method</span>
                            <span className="font-medium text-slate-700">
                                {order.payment}
                            </span>
                        </div>
                        {order.payment === 'Split Payment' && order.payments && order.payments.length > 0 && (
                            <div className="pl-4 border-l-2 border-indigo-200 ml-1 py-1 space-y-1">
                                {order.payments.map((p, idx) => (
                                    <div key={idx} className="flex justify-between text-xs text-slate-500">
                                        <span>{p.method === 'Cash' || p.method === 'cash' ? 'Cash' : p.method}</span>
                                        <span>{formatCurrency(p.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-medium text-slate-700">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                            <span className="font-semibold text-slate-800">
                                Total
                            </span>
                            <span className="font-bold text-indigo-700 text-base">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer flex-col items-stretch">
                    <div className="flex justify-end gap-3 w-full">
                        {order.status !== "Cancelled" && (
                            <button
                                onClick={onCancel}
                                className="btn-danger flex items-center gap-1.5"
                            >
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Cancel Order
                            </button>
                        )}
                        {order.status === "Completed" && (
                            <button
                                onClick={onReturn}
                                className="btn-warning flex items-center gap-1.5"
                            >
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
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                    />
                                </svg>
                                Initiate Return
                            </button>
                        )}
                        <button
                            onClick={onEdit}
                            className="btn-primary flex items-center gap-1.5"
                        >
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Edit Order
                        </button>
                    </div>
                    <div className="flex justify-center w-full pt-2">
                        <button onClick={onClose} className="btn-secondary w-full max-w-[200px]">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   RETURN DETAIL MODAL
   ───────────────────────────────────────────────── */
const ReturnDetailModal = ({ returnReq, onClose }) => {
    const { formatCurrency } = useCurrency();
    const totalItems = returnReq.items.reduce((s, i) => s + i.qty, 0);
    const [busy, setBusy] = useState(false);

    function updateStatus(status) {
        setBusy(true);
        router.patch(
            `/sales/returns/${returnReq.id}`,
            { status },
            {
                onSuccess: () => onClose(),
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[modal-in_200ms_ease]">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title font-mono text-rose-600">
                            {returnReq.returnId}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Ref:{" "}
                            <span className="font-mono text-indigo-600">
                                {returnReq.orderId}
                            </span>{" "}
                            · {returnReq.date}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={returnReq.status} />
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
                </div>

                {/* Body */}
                <div className="modal-body space-y-4">
                    {/* Customer */}
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Customer
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                            {returnReq.customer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {returnReq.customer.email}
                        </p>
                    </div>

                    {/* Reason */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                            Reason for Return
                        </p>
                        <p className="text-sm text-slate-700">
                            {returnReq.reason}
                        </p>
                    </div>

                    {/* Items */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Items Returned ({totalItems})
                        </p>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            <table className="table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">
                                            Item
                                        </th>
                                        <th className="px-4 py-2.5 text-center">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-right">
                                            Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {returnReq.items.map((item, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="px-4 py-2.5 font-medium text-slate-700">
                                                {item.title}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-slate-500">
                                                {item.qty}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-700 font-medium">
                                                {formatCurrency(item.qty * item.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Refund Amount */}
                    <div
                        className={`rounded-xl p-4 text-sm flex justify-between items-center
                        ${returnReq.status === "Rejected" ? "bg-red-50" : "bg-emerald-50"}`}
                    >
                        <span
                            className={`font-semibold ${returnReq.status === "Rejected" ? "text-red-600" : "text-emerald-700"}`}
                        >
                            Refund Amount
                        </span>
                        <span
                            className={`text-lg font-bold ${returnReq.status === "Rejected" ? "text-red-500" : "text-emerald-700"}`}
                        >
                            {returnReq.status === 'Rejected' ? 'N/A' : formatCurrency(returnReq.refundAmount)}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Close
                    </button>
                    {returnReq.status === "Requested" && (
                        <>
                            <button
                                onClick={() => updateStatus("Rejected")}
                                disabled={busy}
                                className="btn-danger flex items-center gap-1.5"
                            >
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Reject
                            </button>
                            <button
                                onClick={() => updateStatus("Approved")}
                                disabled={busy}
                                className="btn-primary flex items-center gap-1.5"
                            >
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
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Approve Return
                            </button>
                        </>
                    )}
                    {returnReq.status === "Approved" && (
                        <button
                            onClick={() => updateStatus("Processed")}
                            disabled={busy}
                            className="btn-primary flex items-center gap-1.5"
                        >
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
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Mark as Processed
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   CANCEL DIALOG
   ───────────────────────────────────────────────── */
const CancelDialog = ({ order, onClose }) => {
    const [processing, setProcessing] = useState(false);

    function handleCancel() {
        setProcessing(true);
        router.delete(`/sales/${order.id}`, {
            onSuccess: () => {
                // Reload the page to refresh stock levels in Products page
                setTimeout(() => {
                    window.location.href = '/sales';
                }, 500);
            },
            onError: () => setProcessing(false),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[modal-in_200ms_ease]">
                <div className="modal-body">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Cancel Order
                            </h3>
                            <p className="text-sm text-slate-500 font-mono">
                                {order.orderId}
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-600 mb-1">
                        Are you sure you want to cancel this order? This action
                        cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Keep Order
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={processing}
                        className="btn-danger"
                    >
                        {processing ? "Cancelling…" : "Yes, Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   EDIT ORDER MODAL
   ───────────────────────────────────────────────── */
const EditOrderModal = ({ order, onClose }) => {
    const { symbol } = useCurrency();
    const { data, setData, patch, processing, errors } = useForm({
        payment_method: order.payment,
        status: order.status,
        discount: order.discount ?? "",
        notes: order.notes ?? "",
    });

    function handleSubmit(e) {
        e.preventDefault();
        patch(`/sales/${order.id}`, { onSuccess: () => onClose() });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-[modal-in_200ms_ease]">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Edit Order</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            {order.orderId}
                        </p>
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
                <form
                    onSubmit={handleSubmit}
                    className="modal-body overflow-y-auto space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Payment Method</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) =>
                                    setData("payment_method", e.target.value)
                                }
                                className="form-input"
                            >
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) =>
                                    setData("status", e.target.value)
                                }
                                className="form-input"
                            >
                                <option>Pending</option>
                                <option>Completed</option>
                                <option>Cancelled</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Discount ({symbol})</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.discount}
                            onChange={(e) =>
                                setData("discount", e.target.value)
                            }
                            placeholder="0.00"
                            className="form-input"
                        />
                        {errors.discount && (
                            <p className="form-error">{errors.discount}</p>
                        )}
                    </div>
                    <div>
                        <label className="form-label">Notes</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Optional notes…"
                            className="form-input resize-none"
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Items (read-only)
                        </p>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                            <table className="table w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">
                                            Book
                                        </th>
                                        <th className="px-4 py-2.5 text-center w-16">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-right w-24">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {order.items.map((it, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="px-4 py-2.5 font-medium text-slate-700">
                                                {it.title}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-slate-500">
                                                {it.qty}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-700 font-medium">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(it.qty * it.price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="btn-primary"
                    >
                        {processing ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   RETURN MODAL  (Initiate return for a completed order)
   ───────────────────────────────────────────────── */
const ReturnModal = ({ completedOrders, preSelectedOrder, onClose }) => {
    const { formatCurrency } = useCurrency();
    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: preSelectedOrder ? String(preSelectedOrder.id) : "",
        reason: "",
        notes: "",
    });

    const selectedOrder =
        completedOrders.find((o) => String(o.id) === String(data.order_id)) ??
        null;

    function handleSubmit(e) {
        e.preventDefault();
        post("/sales/returns", {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-[modal-in_200ms_ease]">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Initiate Return</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Create a return request
                        </p>
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
                <form
                    onSubmit={handleSubmit}
                    className="modal-body overflow-y-auto space-y-4"
                >
                    <div>
                        <label className="form-label">Select Order</label>
                        <select
                            value={data.order_id}
                            onChange={(e) =>
                                setData("order_id", e.target.value)
                            }
                            className="form-input"
                        >
                            <option value="">
                                — Select a completed order —
                            </option>
                            {completedOrders.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.orderId} — {o.customer.name} ({formatCurrency(o.total)})
                                </option>
                            ))}
                        </select>
                        {errors.order_id && (
                            <p className="form-error">{errors.order_id}</p>
                        )}
                    </div>

                    {selectedOrder && (
                        <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-1">
                            <p className="font-semibold text-slate-800">
                                Order Preview
                            </p>
                            {selectedOrder.items.map((it, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between text-slate-500"
                                >
                                    <span>
                                        {it.title} × {it.qty}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {formatCurrency(it.qty * it.price)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-semibold text-slate-800">
                                <span>Total</span>
                                <span>{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="form-label">Reason for Return</label>
                        <textarea
                            rows={3}
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                            placeholder="Describe the reason…"
                            className="form-input resize-none"
                        />
                        {errors.reason && (
                            <p className="form-error">{errors.reason}</p>
                        )}
                    </div>
                    <div>
                        <label className="form-label">Notes</label>
                        <input
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Optional"
                            className="form-input"
                        />
                    </div>
                </form>
                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="btn-primary"
                    >
                        {processing ? "Submitting…" : "Submit Return"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   SALES PAGE
   ───────────────────────────────────────────────── */
export default function Sale({
    auth,
    orders = [],
    returns = [],
    customers = [],
    flash = {},
}) {
    const { formatCurrency } = useCurrency();
    const [activeKey, setActiveKey] = useState("sales");
    const [pageTab, setPageTab] = useState("orders");

    /* Orders state */
    const [orderSearch, setOrderSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("All");
    const [orderPage, setOrderPage] = useState(1);
    const [viewOrder, setViewOrder] = useState(null);

    /* Returns state */
    const [returnSearch, setReturnSearch] = useState("");
    const [returnStatus, setReturnStatus] = useState("All");
    const [returnPage, setReturnPage] = useState(1);
    const [viewReturn, setViewReturn] = useState(null);

    /* Modal state */

    const [editOrder, setEditOrder] = useState(null);
    const [cancelOrder, setCancelOrder] = useState(null);
    const [showReturn, setShowReturn] = useState(false);
    const [returnTarget, setReturnTarget] = useState(null);

    /* Toast */
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: "success", msg: flash.success });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
        if (flash?.error) {
            setToast({ type: "error", msg: flash.error });
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    /* ── Derived stats ── */
    const completedOrders = useMemo(
        () => orders.filter((o) => o.status === "Completed"),
        [orders],
    );
    const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
    const avgOrderValue =
        completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const pendingReturns = returns.filter(
        (r) => r.status === "Requested",
    ).length;

    /* ── Filtered orders ── */
    const filteredOrders = useMemo(() => {
        const q = orderSearch.toLowerCase();
        return orders.filter((o) => {
            const matchStatus =
                orderStatus === "All" || o.status === orderStatus;
            const matchSearch =
                !q ||
                o.orderId.toLowerCase().includes(q) ||
                o.customer.name.toLowerCase().includes(q) ||
                (o.customer.email ?? "").toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [orders, orderSearch, orderStatus]);

    const orderTotalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / PAGE_SIZE),
    );
    const paginatedOrders = filteredOrders.slice(
        (orderPage - 1) * PAGE_SIZE,
        orderPage * PAGE_SIZE,
    );

    /* ── Filtered returns ── */
    const filteredReturns = useMemo(() => {
        const q = returnSearch.toLowerCase();
        return returns.filter((r) => {
            const matchStatus =
                returnStatus === "All" || r.status === returnStatus;
            const matchSearch =
                !q ||
                r.returnId.toLowerCase().includes(q) ||
                r.orderId.toLowerCase().includes(q) ||
                (r.customer?.name ?? "").toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [returns, returnSearch, returnStatus]);

    const returnTotalPages = Math.max(
        1,
        Math.ceil(filteredReturns.length / PAGE_SIZE),
    );
    const paginatedReturns = filteredReturns.slice(
        (returnPage - 1) * PAGE_SIZE,
        returnPage * PAGE_SIZE,
    );

    /* ── Pagination builder ── */
    const buildPages = (current, total) =>
        Array.from({ length: total }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
            .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
            }, []);

    /* ── Open return from order detail ── */
    function openReturnFor(order) {
        setViewOrder(null);
        setReturnTarget(order);
        setShowReturn(true);
        setPageTab("returns");
    }

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Sales & Orders"
            user={
                auth?.user ?? {
                    name: "Admin User",
                    email: "admin@luminabooks.com",
                }
            }
            onLogout={() => router.post("/logout")}
        >
            <Head title="Sales & Orders" />

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
                    ${toast.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                >
                    {toast.type === "success" ? (
                        <svg
                            className="w-5 h-5 text-emerald-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                    {toast.msg}
                    <button
                        onClick={() => setToast(null)}
                        className="ml-2 opacity-60 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <Breadcrumb
                        items={["Lumina Books POS", "Sales & Orders"]}
                    />
                    <h1 className="page-title">Sales &amp; Orders</h1>
                    <p className="page-subtitle flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse-soft" />
                        {completedOrders.length} completed · {orders.length}{" "}
                        total this period
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-primary flex items-center gap-1.5"
                        onClick={() => router.visit("/pos")}
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
                        New Sale
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    change="+12.5%"
                    icon={<DollarSign className="w-5 h-5 text-white" />}
                    tone="orange"
                    subtitle="Completed orders only"
                />
                <StatCard
                    title="Total Orders"
                    value={String(orders.length)}
                    change="+5.2%"
                    icon={<ShoppingCart className="w-5 h-5 text-white" />}
                    tone="indigo"
                    subtitle={`${completedOrders.length} completed`}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatCurrency(avgOrderValue)}
                    change="-1.1%"
                    icon={<BarChart3 className="w-5 h-5 text-white" />}
                    tone="teal"
                    subtitle="Per completed order"
                />
                <StatCard
                    title="Pending Returns"
                    value={String(pendingReturns)}
                    change="±0"
                    icon={<RotateCcw className="w-5 h-5 text-white" />}
                    tone="pink"
                    subtitle="Awaiting review"
                />
            </div>

            {/* ── Page Tabs ── */}
            <div className="flex items-center gap-0 mb-5 border-b border-slate-200">
                {[
                    { key: "orders", label: "Sales & Orders", badge: null },
                    {
                        key: "returns",
                        label: "Returns & Refunds",
                        badge: pendingReturns,
                    },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setPageTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150
                            ${pageTab === tab.key
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                    >
                        {tab.label}
                        {tab.badge > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-600 rounded-full font-bold leading-none">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ════════════════════════
                ORDERS TAB
                ════════════════════════ */}
            {pageTab === "orders" && (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 flex-wrap">
                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                            {["All", "Completed", "Pending", "Cancelled"].map(
                                (s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setOrderStatus(s);
                                            setOrderPage(1);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                        ${orderStatus === s
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ),
                            )}
                        </div>

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
                                placeholder="Search by order ID, customer name or email..."
                                value={orderSearch}
                                onChange={(e) => {
                                    setOrderSearch(e.target.value);
                                    setOrderPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-xl">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4 text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 rounded-tr-xl text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedOrders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-20 text-slate-400"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                                                    <p className="font-semibold text-slate-500">
                                                        No orders found
                                                    </p>
                                                    <p className="text-xs">
                                                        Try a different search
                                                        or filter
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map((order) => (
                                            <tr
                                                key={order.orderId}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                {/* Order ID */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                                        {order.orderId}
                                                    </span>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {order.customer?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {order.customer?.email}
                                                    </p>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-slate-700">
                                                        {order.date}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {order.time}
                                                    </p>
                                                </td>

                                                {/* Items */}
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {order.items.reduce(
                                                            (s, i) => s + i.qty,
                                                            0,
                                                        )}{" "}
                                                        item
                                                        {order.items.reduce(
                                                            (s, i) => s + i.qty,
                                                            0,
                                                        ) !== 1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                    <p className="text-xs text-slate-400 max-w-[160px] truncate">
                                                        {order.items
                                                            .map((i) => i.title)
                                                            .join(", ")}
                                                    </p>
                                                </td>

                                                {/* Payment */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {order.payment}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </td>

                                                {/* Total */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="font-bold text-slate-800">
                                                        {formatCurrency(order.total)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* View */}
                                                        <button
                                                            title="View order"
                                                            onClick={() =>
                                                                setViewOrder(
                                                                    order,
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
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* Edit */}
                                                        {order.status !==
                                                            "Cancelled" && (
                                                                <button
                                                                    title="Edit order"
                                                                    onClick={() =>
                                                                        setEditOrder(
                                                                            order,
                                                                        )
                                                                    }
                                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 flex items-center justify-center transition-all"
                                                                >
                                                                    <svg
                                                                        className="w-3.5 h-3.5"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}

                                                        {/* Cancel */}
                                                        {(order.status ===
                                                            "Pending" ||
                                                            order.status ===
                                                            "Processing") && (
                                                                <button
                                                                    title="Cancel order"
                                                                    onClick={() =>
                                                                        setCancelOrder(
                                                                            order,
                                                                        )
                                                                    }
                                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-all"
                                                                >
                                                                    <svg
                                                                        className="w-3.5 h-3.5"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M6 18L18 6M6 6l12 12"
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

                        {/* Pagination */}
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-b-xl flex-wrap gap-3">
                            <span>
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredOrders.length === 0
                                        ? 0
                                        : (orderPage - 1) * PAGE_SIZE + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-slate-700">
                                    {Math.min(
                                        orderPage * PAGE_SIZE,
                                        filteredOrders.length,
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredOrders.length}
                                </span>{" "}
                                orders
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={orderPage === 1}
                                    onClick={() => setOrderPage((p) => p - 1)}
                                    className="btn-secondary btn-xs disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                {buildPages(orderPage, orderTotalPages).map(
                                    (p, i) =>
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
                                                onClick={() => setOrderPage(p)}
                                                className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${p === orderPage ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                )}
                                <button
                                    disabled={orderPage === orderTotalPages}
                                    onClick={() => setOrderPage((p) => p + 1)}
                                    className="btn-secondary btn-xs disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ════════════════════════
                RETURNS TAB
                ════════════════════════ */}
            {pageTab === "returns" && (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 flex-wrap">
                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 flex-shrink-0">
                            {[
                                "All",
                                "Requested",
                                "Approved",
                                "Rejected",
                                "Processed",
                            ].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        setReturnStatus(s);
                                        setReturnPage(1);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                                        ${returnStatus === s
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

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
                                placeholder="Search by return ID, order ID or customer..."
                                value={returnSearch}
                                onChange={(e) => {
                                    setReturnSearch(e.target.value);
                                    setReturnPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Returns Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-xl">
                                            Return ID
                                        </th>
                                        <th className="px-6 py-4">
                                            Original Order
                                        </th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4 text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Refund
                                        </th>
                                        <th className="px-6 py-4 rounded-tr-xl text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedReturns.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-center py-20 text-slate-400"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <RotateCcw className="w-10 h-10 text-slate-300" />
                                                    <p className="font-semibold text-slate-500">
                                                        No return requests found
                                                    </p>
                                                    <p className="text-xs">
                                                        Try a different search
                                                        or filter
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedReturns.map((ret) => (
                                            <tr
                                                key={ret.returnId}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                {/* Return ID */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                                                        {ret.returnId}
                                                    </span>
                                                </td>

                                                {/* Original Order */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                                        {ret.orderId}
                                                    </span>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {ret.customer?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {ret.customer?.email}
                                                    </p>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {ret.date}
                                                </td>

                                                {/* Reason */}
                                                <td className="px-6 py-4">
                                                    <p
                                                        className="text-sm text-slate-600 max-w-[180px] truncate"
                                                        title={ret.reason}
                                                    >
                                                        {ret.reason}
                                                    </p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <StatusBadge
                                                        status={ret.status}
                                                    />
                                                </td>

                                                {/* Refund */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span
                                                        className={`font-bold ${ret.status === "Rejected" ? "text-red-400" : "text-emerald-600"}`}
                                                    >
                                                        {ret.status === 'Rejected' ? 'N/A' : formatCurrency(ret.refundAmount)}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* View */}
                                                        <button
                                                            title="View return"
                                                            onClick={() =>
                                                                setViewReturn(
                                                                    ret,
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
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {/* Quick approve (only for Requested) */}
                                                        {ret.status ===
                                                            "Requested" && (
                                                                <button
                                                                    title="Approve return"
                                                                    onClick={() =>
                                                                        router.patch(
                                                                            `/sales/returns/${ret.id}`,
                                                                            {
                                                                                status: "Approved",
                                                                            },
                                                                        )
                                                                    }
                                                                    className="w-8 h-8 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-center transition-all"
                                                                >
                                                                    <svg
                                                                        className="w-3.5 h-3.5"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M5 13l4 4L19 7"
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

                        {/* Pagination */}
                        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-b-xl flex-wrap gap-3">
                            <span>
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredReturns.length === 0
                                        ? 0
                                        : (returnPage - 1) * PAGE_SIZE + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold text-slate-700">
                                    {Math.min(
                                        returnPage * PAGE_SIZE,
                                        filteredReturns.length,
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredReturns.length}
                                </span>{" "}
                                requests
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={returnPage === 1}
                                    onClick={() => setReturnPage((p) => p - 1)}
                                    className="btn-secondary btn-xs disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                {buildPages(returnPage, returnTotalPages).map(
                                    (p, i) =>
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
                                                onClick={() => setReturnPage(p)}
                                                className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${p === returnPage ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                )}
                                <button
                                    disabled={returnPage === returnTotalPages}
                                    onClick={() => setReturnPage((p) => p + 1)}
                                    className="btn-secondary btn-xs disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Order Detail Modal ── */}
            {viewOrder && (
                <OrderDetailModal
                    order={viewOrder}
                    onClose={() => setViewOrder(null)}
                    onEdit={() => {
                        setViewOrder(null);
                        setEditOrder(viewOrder);
                    }}
                    onCancel={() => {
                        setViewOrder(null);
                        setCancelOrder(viewOrder);
                    }}
                    onReturn={() => openReturnFor(viewOrder)}
                />
            )}

            {/* ── Return Detail Modal ── */}
            {viewReturn && (
                <ReturnDetailModal
                    returnReq={viewReturn}
                    onClose={() => setViewReturn(null)}
                />
            )}

            {/* ── Edit Order Modal ── */}
            {editOrder && (
                <EditOrderModal
                    order={editOrder}
                    onClose={() => setEditOrder(null)}
                />
            )}

            {/* ── Cancel Order Dialog ── */}
            {cancelOrder && (
                <CancelDialog
                    order={cancelOrder}
                    onClose={() => setCancelOrder(null)}
                />
            )}

            {/* ── Return Modal ── */}
            {showReturn && (
                <ReturnModal
                    completedOrders={completedOrders}
                    preSelectedOrder={returnTarget}
                    onClose={() => {
                        setShowReturn(false);
                        setReturnTarget(null);
                    }}
                />
            )}
        </MainLayout>
    );
}
