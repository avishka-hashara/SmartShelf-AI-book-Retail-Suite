// resources/js/Pages/Library/Index.jsx

import React, { useState, useCallback } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import {
    BookOpen, Users, Clock, AlertTriangle, Plus, Search, X, ChevronRight,
    BookMarked, RotateCcw, Calendar, UserPlus, Edit2, Trash2, CheckCircle,
    AlertCircle, ArrowUpRight, Flame, Shield, Eye, RefreshCw,
    TrendingUp, DollarSign, Banknote, Award
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
const fmt = (n) => `Rs. ${Number(n ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isOverdue = (dueDateStr, status) => {
    if (status !== 'active') return false;
    return new Date(dueDateStr) < new Date();
};

const daysLeft = (dueDateStr) => {
    const diff = Math.ceil((new Date(dueDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
};

const GENRE_COLORS = {
    Fiction:     'bg-violet-100 text-violet-700',
    'Non-Fiction': 'bg-blue-100 text-blue-700',
    Science:     'bg-cyan-100 text-cyan-700',
    History:     'bg-amber-100 text-amber-700',
    Biography:   'bg-rose-100 text-rose-700',
    Mystery:     'bg-slate-100 text-slate-700',
    Fantasy:     'bg-purple-100 text-purple-700',
    Romance:     'bg-pink-100 text-pink-700',
    Education:   'bg-emerald-100 text-emerald-700',
};
const genreColor = (g) => GENRE_COLORS[g] || 'bg-slate-100 text-slate-600';

const LOAN_STATUS = {
    active:   { label: 'Active',   color: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
    overdue:  { label: 'Overdue',  color: 'bg-red-100 text-red-700 ring-red-200' },
    returned: { label: 'Returned', color: 'bg-slate-100 text-slate-600 ring-slate-200' },
    lost:     { label: 'Lost',     color: 'bg-orange-100 text-orange-700 ring-orange-200' },
    damaged:  { label: 'Damaged',  color: 'bg-yellow-100 text-yellow-700 ring-yellow-200' },
};

/* ─────────────────────────────────────────────────
   MODAL SHELL
   ───────────────────────────────────────────────── */
const Modal = ({ title, onClose, children, wide = false }) => (
    // Backdrop — clicking outside the panel closes the modal (safety valve for stuck UI)
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
    >
        {/* Panel — stop propagation so clicks inside don't bubble to backdrop */}
        <div
            className={`modal-box w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
            onClick={e => e.stopPropagation()}
        >
            <div className="modal-header flex-shrink-0">
                <h2 className="modal-title">{title}</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>
            <div className="overflow-y-auto flex-1">{children}</div>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   FORM FIELD
   ───────────────────────────────────────────────── */
const Field = ({ label, error, children, required }) => (
    <div className="form-group">
        <label className="form-label">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {error && <p className="form-error mt-1">{error}</p>}
    </div>
);

const Input = ({ className = '', ...props }) => (
    <input
        className={`form-input ${className}`}
        {...props}
    />
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        rows={3}
        className={`form-textarea ${className}`}
        {...props}
    />
);

const Select = ({ className = '', children, ...props }) => (
    <select
        className={`form-select ${className}`}
        {...props}
    >
        {children}
    </select>
);

/* ─────────────────────────────────────────────────
   BOOK IMAGE
   ───────────────────────────────────────────────── */
const BookCover = ({ book, className = '' }) => {
    const [err, setErr] = useState(false);
    const src = book.image_path
        ? (book.image_path.startsWith('http') ? book.image_path : `/storage/${book.image_path}`)
        : null;

    if (src && !err) {
        return (
            // object-contain keeps the full cover visible without cropping.
            // The wrapper already has a bg-slate-50/white background.
            <img
                src={src}
                alt={book.title}
                onError={() => setErr(true)}
                className={`object-contain bg-white ${className}`}
            />
        );
    }

    const hue = (book.title?.charCodeAt(0) ?? 0) % 6;
    const gradients = [
        'from-indigo-400 to-indigo-700',
        'from-violet-400 to-violet-700',
        'from-amber-400 to-amber-700',
        'from-emerald-400 to-emerald-700',
        'from-rose-400 to-rose-700',
        'from-cyan-400 to-cyan-700',
    ];

    return (
        <div className={`bg-gradient-to-br ${gradients[hue]} flex flex-col items-center justify-center gap-1 ${className}`}>
            <BookOpen className="w-8 h-8 text-white/80" />
            <span className="text-white/60 text-[9px] font-medium px-2 text-center line-clamp-2">
                {book.title}
            </span>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   BOOK CARD
   ───────────────────────────────────────────────── */
const BookCard = ({ book, onLend, onEdit, onDelete }) => {
    const avail = book.available_copies > 0;

    return (
        <div className="card hover:-translate-y-0.5 flex flex-col overflow-hidden group">
            {/* Cover — h-52 gives portrait covers (2:3) room to breathe */}
            <div className="relative h-52 overflow-hidden bg-white border-b border-slate-100">
                <BookCover book={book} className="w-full h-full" />

                {/* Availability badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${avail ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {avail ? `${book.available_copies} avail.` : 'Unavailable'}
                </div>

                {/* Edit/Delete overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end gap-1.5 p-2 opacity-0 group-hover:opacity-100">
                    <button
                        onClick={() => onEdit(book)}
                        className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
                        title="Edit book"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        title="Delete book"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                </div>

                {book.genre && (
                    <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-semibold ${genreColor(book.genre)}`}>
                        {book.genre}
                    </span>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                    <div>
                        <p className="text-xs text-slate-400">Daily rate</p>
                        <p className="text-sm font-bold text-indigo-700">{fmt(book.daily_rate)}</p>
                    </div>
                    <button
                        onClick={() => onLend(book)}
                        disabled={!avail}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95
                            ${avail
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        {avail ? 'Lend' : 'Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   LOAN ROW
   ───────────────────────────────────────────────── */
const LoanRow = ({ loan, onReturn, onExtend, onIncident }) => {
    const st = LOAN_STATUS[loan.status] ?? LOAN_STATUS.active;
    const overdue = loan.status === 'overdue' || isOverdue(loan.due_date, loan.status);
    const days = daysLeft(loan.due_date);
    const isOpen = ['active', 'overdue'].includes(loan.status);

    return (
        <tr className="hover:bg-slate-50/70 transition-colors">
            <td className="py-3 px-4">
                <div className="font-medium text-slate-800 text-sm">{loan.book?.title}</div>
                <div className="text-xs text-slate-400">{loan.book?.author}</div>
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                        {(loan.member?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-700">{loan.member?.name}</div>
                        <div className="text-xs text-slate-400">{loan.member?.member_id}</div>
                    </div>
                </div>
            </td>
            <td className="py-3 px-4 text-xs text-slate-500">{fmtDate(loan.loan_date)}</td>
            <td className="py-3 px-4">
                <div className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                    {fmtDate(loan.due_date)}
                </div>
                {isOpen && (
                    <div className={`text-[10px] font-semibold ${days < 0 ? 'text-red-500' : days <= 2 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                    </div>
                )}
                {loan.extended_by && (
                    <div className="text-[10px] text-violet-500 flex items-center gap-0.5 mt-0.5">
                        <RefreshCw className="w-2.5 h-2.5" />
                        Extended by {loan.extended_by}
                    </div>
                )}
            </td>
            <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${st.color}`}>
                    {st.label}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="text-xs text-slate-500">{loan.issued_by}</div>
            </td>
            <td className="py-3 px-4">
                {/* Active — show daily rate + running charge so far */}
                {loan.status === 'active' && (() => {
                    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(loan.loan_date)) / 86400000));
                    const running = elapsed * parseFloat(loan.daily_rate ?? 0);
                    return (
                        <div className="text-xs text-slate-500">
                            <span className="text-slate-400">{fmt(loan.daily_rate)}/day</span>
                            {elapsed > 0 && (
                                <span className="block text-indigo-600 font-medium">~{fmt(running)} ({elapsed}d)</span>
                            )}
                            <span className="block text-slate-400">Deposit: {fmt(loan.deposit_amount)}</span>
                        </div>
                    );
                })()}
                {/* Overdue — show estimated fine accumulating */}
                {loan.status === 'overdue' && (() => {
                    const overdueDays = Math.max(0, Math.floor((Date.now() - new Date(loan.due_date)) / 86400000));
                    const estimatedFine = overdueDays * parseFloat(loan.daily_rate ?? 0) * 1.5;
                    return (
                        <div className="text-xs">
                            <span className="text-red-600 font-semibold block">~{fmt(estimatedFine)} fine</span>
                            <span className="text-red-400">{overdueDays}d × {fmt(loan.daily_rate)} × 1.5</span>
                            <span className="block text-slate-400">Deposit: {fmt(loan.deposit_amount)}</span>
                        </div>
                    );
                })()}
                {/* Returned — show late fine charged (or 'No fine' if on time) */}
                {loan.status === 'returned' && (
                    <div className="text-xs text-slate-500">
                        {parseFloat(loan.late_fine ?? 0) > 0 ? (
                            <>
                                <span className="text-red-600 font-semibold block">{fmt(loan.late_fine)} fine</span>
                                <span className="text-slate-400">Deposit refunded</span>
                            </>
                        ) : (
                            <>
                                <span className="text-emerald-600 font-medium block">No fine</span>
                                <span className="text-slate-400">Deposit refunded</span>
                            </>
                        )}
                    </div>
                )}
                {/* Lost / Damaged — show incident fee */}
                {['lost', 'damaged'].includes(loan.status) && (
                    <div className="text-xs text-orange-600 font-semibold">{fmt(loan.extra_fee)}</div>
                )}
            </td>
            <td className="py-3 px-4 text-right">
                {isOpen && (
                    <div className="flex items-center justify-end gap-1.5">
                        <button
                            onClick={() => onReturn(loan)}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                            <CheckCircle className="w-3 h-3" /> Return
                        </button>
                        <button
                            onClick={() => onExtend(loan)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                            <Calendar className="w-3 h-3" /> Extend
                        </button>
                        <button
                            onClick={() => onIncident(loan)}
                            className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Mark as lost or damaged"
                        >
                            <AlertTriangle className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

/* ─────────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color = 'indigo', sub }) => {
    const colors = {
        indigo:  'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber:   'bg-amber-50 text-amber-600',
        red:     'bg-red-50 text-red-600',
        violet:  'bg-violet-50 text-violet-600',
    };
    return (
        <div className="card px-5 py-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────
   MODALS: ADD / EDIT BOOK
   ───────────────────────────────────────────────── */
const BookFormModal = ({ book = null, onClose }) => {
    const isEdit = !!book;
    // _method is included in the form payload so Laravel's method-spoofing
    // middleware picks it up when the request is sent as multipart/form-data.
    const { data, setData, post, processing, errors } = useForm({
        _method:        isEdit ? 'PUT' : 'POST',
        title:          book?.title ?? '',
        author:         book?.author ?? '',
        isbn:           book?.isbn ?? '',
        genre:          book?.genre ?? '',
        description:    book?.description ?? '',
        publisher:      book?.publisher ?? '',
        published_year: book?.published_year ?? '',
        total_copies:   book?.total_copies ?? 1,
        daily_rate:     book?.daily_rate ?? '',
        deposit_amount: book?.deposit_amount ?? '',
        lost_fee:       book?.lost_fee ?? '',
        damage_fee:     book?.damage_fee ?? '',
        image:          null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(
            isEdit
                ? route('library.books.update', book.id)
                : route('library.books.store'),
            {
                forceFormData: true,
                preserveScroll: true,
                // onSuccess closes on a clean save; onError keeps modal open
                // so the user can see validation errors. The backdrop click-to-close
                // (on the Modal shell) acts as a manual escape hatch in all cases.
                onSuccess: () => onClose(),
            }
        );
    };

    const GENRES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Mystery', 'Fantasy', 'Romance', 'Education', 'Technology', 'Art', 'Other'];

    return (
        <Modal title={isEdit ? 'Edit Book' : 'Add New Book'} onClose={onClose} wide>
            <form onSubmit={submit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Title" required error={errors.title}>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Book title" />
                    </Field>
                    <Field label="Author" required error={errors.author}>
                        <Input value={data.author} onChange={e => setData('author', e.target.value)} placeholder="Author name" />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="ISBN" error={errors.isbn}>
                        <Input value={data.isbn} onChange={e => setData('isbn', e.target.value)} placeholder="978-..." />
                    </Field>
                    <Field label="Genre" error={errors.genre}>
                        <Select value={data.genre} onChange={e => setData('genre', e.target.value)}>
                            <option value="">Select genre</option>
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </Select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Publisher" error={errors.publisher}>
                        <Input value={data.publisher} onChange={e => setData('publisher', e.target.value)} placeholder="Publisher name" />
                    </Field>
                    <Field label="Published Year" error={errors.published_year}>
                        <Input value={data.published_year} onChange={e => setData('published_year', e.target.value)} placeholder="2024" maxLength={4} />
                    </Field>
                </div>
                <Field label="Description" error={errors.description}>
                    <Textarea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Brief description..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Total Copies" required error={errors.total_copies}>
                        <Input type="number" min={1} value={data.total_copies} onChange={e => setData('total_copies', e.target.value)} />
                    </Field>
                    <Field label="Daily Lending Rate (Rs.)" required error={errors.daily_rate}>
                        <Input type="number" min={0} step="0.01" value={data.daily_rate} onChange={e => setData('daily_rate', e.target.value)} placeholder="50.00" />
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <Field label="Deposit (Rs.)" required error={errors.deposit_amount}>
                        <Input type="number" min={0} step="0.01" value={data.deposit_amount} onChange={e => setData('deposit_amount', e.target.value)} placeholder="500.00" />
                    </Field>
                    <Field label="Lost Fee (Rs.)" error={errors.lost_fee}>
                        <Input type="number" min={0} step="0.01" value={data.lost_fee} onChange={e => setData('lost_fee', e.target.value)} placeholder="2000.00" />
                    </Field>
                    <Field label="Damage Fee (Rs.)" error={errors.damage_fee}>
                        <Input type="number" min={0} step="0.01" value={data.damage_fee} onChange={e => setData('damage_fee', e.target.value)} placeholder="500.00" />
                    </Field>
                </div>
                <Field label="Cover Image" error={errors.image}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setData('image', e.target.files[0])}
                        className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </Field>
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary flex-1">
                        {processing ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MODAL: ADD MEMBER
   ───────────────────────────────────────────────── */
const MemberFormModal = ({ member = null, onClose }) => {
    const isEdit = !!member;
    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        name:    member?.name ?? '',
        email:   member?.email ?? '',
        phone:   member?.phone ?? '',
        address: member?.address ?? '',
        status:  member?.status ?? 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(
            isEdit
                ? route('library.members.update', member.id)
                : route('library.members.store'),
            { preserveScroll: true, onSuccess: () => onClose() }
        );
    };

    return (
        <Modal title={isEdit ? 'Edit Member' : 'Add Library Member'} onClose={onClose}>
            <form onSubmit={submit} className="p-6 space-y-4">
                <Field label="Full Name" required error={errors.name}>
                    <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Member's full name" />
                </Field>
                <Field label="Email Address" error={errors.email}>
                    <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@example.com" />
                </Field>
                <Field label="Phone Number" error={errors.phone}>
                    <Input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+94 77 000 0000" />
                </Field>
                <Field label="Address" error={errors.address}>
                    <Textarea value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Home address..." />
                </Field>
                {isEdit && (
                    <Field label="Status" error={errors.status}>
                        <Select value={data.status} onChange={e => setData('status', e.target.value)}>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </Select>
                    </Field>
                )}
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary flex-1">
                        {processing ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MODAL: ISSUE LOAN
   ───────────────────────────────────────────────── */
const IssueLoanModal = ({ book, members, onClose }) => {
    const today = new Date().toISOString().slice(0, 10);
    const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    const { data, setData, post, processing, errors } = useForm({
        library_book_id:   book.id,
        library_member_id: '',
        loan_date:         today,
        due_date:          defaultDue,
        notes:             '',
    });

    const loanDays = data.loan_date && data.due_date
        ? Math.max(0, Math.ceil((new Date(data.due_date) - new Date(data.loan_date)) / 86400000))
        : 0;

    const estimatedFee = loanDays * (parseFloat(book.daily_rate) || 0);

    const submit = (e) => {
        e.preventDefault();
        post(route('library.loans.issue'), { preserveScroll: true, onSuccess: () => onClose() });
    };

    const activeMembers = (members?.data ?? members ?? []).filter(m => m.status === 'active');

    return (
        <Modal title="Issue Book" onClose={onClose}>
            <div className="px-6 pt-5 pb-2">
                {/* Book info */}
                <div className="flex gap-3 p-3 bg-indigo-50 rounded-xl mb-5">
                    <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <BookCover book={book} className="w-full h-full" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-1">{fmt(book.daily_rate)}/day · Deposit: {fmt(book.deposit_amount)}</p>
                        <p className="text-xs text-slate-400">{book.available_copies} copies available</p>
                    </div>
                </div>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
                <Field label="Member" required error={errors.library_member_id}>
                    <Select value={data.library_member_id} onChange={e => setData('library_member_id', e.target.value)}>
                        <option value="">Select a member...</option>
                        {activeMembers.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.member_id}) {m.active_loans_count > 0 ? `· ${m.active_loans_count} active loan(s)` : ''}
                            </option>
                        ))}
                    </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Loan Date" required error={errors.loan_date}>
                        <Input type="date" value={data.loan_date} onChange={e => setData('loan_date', e.target.value)} />
                    </Field>
                    <Field label="Due Date" required error={errors.due_date}>
                        <Input type="date" value={data.due_date} min={data.loan_date} onChange={e => setData('due_date', e.target.value)} />
                    </Field>
                </div>

                {/* Fee preview */}
                {loanDays > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Loan period</span><span className="font-medium">{loanDays} days</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Estimated fee</span><span className="font-medium text-indigo-700">{fmt(estimatedFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Deposit (refundable)</span><span className="font-medium">{fmt(book.deposit_amount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-700 pt-1 border-t border-slate-200">
                            <span>Total upfront</span><span>{fmt(parseFloat(book.deposit_amount) + estimatedFee)}</span>
                        </div>
                    </div>
                )}

                <Field label="Notes" error={errors.notes}>
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Optional notes..." rows={2} />
                </Field>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary flex-1">
                        {processing ? 'Issuing...' : 'Issue Book'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MODAL: RETURN
   ───────────────────────────────────────────────── */
const ReturnModal = ({ loan, onClose }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, setData, post, processing, errors } = useForm({
        return_date:    today,
        late_fine:      0,
        payment_method: 'cash',
        notes:          '',
    });

    const returnDate  = new Date(data.return_date);
    const dueDate     = new Date(loan.due_date);
    const overdueDays = Math.max(0, Math.ceil((returnDate - dueDate) / 86400000));
    const calculatedFine = overdueDays > 0 ? overdueDays * parseFloat(loan.daily_rate) * 1.5 : 0;

    // Auto-update late_fine when return_date changes
    React.useEffect(() => {
        setData('late_fine', parseFloat(calculatedFine).toFixed(2));
    }, [calculatedFine]);

    const submit = (e) => {
        e.preventDefault();
        post(route('library.loans.return', loan.id), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Modal title="Return Book" onClose={onClose}>
            <div className="px-6 pt-5 pb-2">
                <div className="p-3 bg-emerald-50 rounded-xl mb-5">
                    <p className="font-bold text-slate-800 text-sm">{loan.book?.title}</p>
                    <p className="text-xs text-slate-500">{loan.member?.name} · {loan.member?.member_id}</p>
                    <p className="text-xs text-slate-400 mt-1">Loaned: {fmtDate(loan.loan_date)} · Due: {fmtDate(loan.due_date)}</p>
                </div>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
                <Field label="Return Date" required error={errors.return_date}>
                    <Input type="date" value={data.return_date} onChange={e => setData('return_date', e.target.value)} />
                </Field>

                {/* Fine preview */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                    {overdueDays > 0 ? (
                        <>
                            <div className="flex justify-between text-red-500 font-medium">
                                <span>Overdue days</span><span>{overdueDays} days</span>
                            </div>
                            <div className="flex justify-between text-red-600 font-medium">
                                <span>Calculated fine (×1.5)</span><span>{fmt(calculatedFine)}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Returned on time — no late fine
                        </div>
                    )}
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                        <span>Deposit refund</span><span className="text-emerald-600">{fmt(loan.deposit_amount)}</span>
                    </div>
                </div>

                <Field label="Late Fine (Rs.)" error={errors.late_fine}>
                    <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        value={data.late_fine} 
                        onChange={e => setData('late_fine', e.target.value)}
                        placeholder="0.00"
                    />
                </Field>

                <Field label="Payment Method" error={errors.payment_method}>
                    <div className="flex gap-2">
                        {['cash', 'card', 'none'].map(m => (
                            <button key={m} type="button"
                                onClick={() => setData('payment_method', m)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                                    ${data.payment_method === m
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field label="Notes" error={errors.notes}>
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Optional notes..." rows={2} />
                </Field>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-success flex-1">
                        {processing ? 'Processing...' : 'Confirm Return'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MODAL: EXTEND LOAN
   ───────────────────────────────────────────────── */
const ExtendModal = ({ loan, onClose }) => {
    const { data, setData, post, processing, errors } = useForm({
        extension_days: 7,
        notes: '',
    });

    const newDue = loan.due_date
        ? new Date(new Date(loan.due_date).getTime() + data.extension_days * 86400000).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

    const submit = (e) => {
        e.preventDefault();
        post(route('library.loans.extend', loan.id), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Modal title="Extend Loan" onClose={onClose}>
            <div className="px-6 pt-5 pb-2">
                <div className="p-3 bg-indigo-50 rounded-xl mb-5">
                    <p className="font-bold text-slate-800 text-sm">{loan.book?.title}</p>
                    <p className="text-xs text-slate-500">{loan.member?.name} · {loan.member?.member_id}</p>
                    <p className="text-xs text-indigo-600 mt-1">Current due: <span className="font-semibold">{fmtDate(loan.due_date)}</span></p>
                    {loan.extended_by && (
                        <p className="text-xs text-violet-500 mt-0.5">Previously extended by {loan.extended_by}</p>
                    )}
                </div>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
                <Field label="Extension Days" required error={errors.extension_days}>
                    <div className="flex gap-2 mb-2">
                        {[3, 7, 14, 30].map(d => (
                            <button key={d} type="button"
                                onClick={() => setData('extension_days', d)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                                    ${data.extension_days === d
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                            >
                                +{d}d
                            </button>
                        ))}
                    </div>
                    <Input type="number" min={1} max={90} value={data.extension_days} onChange={e => setData('extension_days', parseInt(e.target.value))} />
                </Field>

                {newDue && (
                    <div className="bg-indigo-50 rounded-xl p-3 text-xs">
                        <span className="text-slate-500">New due date: </span>
                        <span className="font-bold text-indigo-700">{newDue}</span>
                    </div>
                )}

                <Field label="Notes" error={errors.notes}>
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Reason for extension..." rows={2} />
                </Field>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary flex-1">
                        {processing ? 'Extending...' : 'Extend Loan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MODAL: INCIDENT (LOST / DAMAGED)
   ───────────────────────────────────────────────── */
const IncidentModal = ({ loan, onClose }) => {
    const { data, setData, post, processing, errors } = useForm({
        incident_type:  'lost',
        payment_method: 'cash',
        notes:          '',
    });

    const fee = data.incident_type === 'lost'
        ? parseFloat(loan.book?.lost_fee ?? 0)
        : parseFloat(loan.book?.damage_fee ?? 0);

    const submit = (e) => {
        e.preventDefault();
        post(route('library.loans.incident', loan.id), { preserveScroll: true, onSuccess: () => onClose() });
    };

    return (
        <Modal title="Report Incident" onClose={onClose}>
            <div className="px-6 pt-5 pb-2">
                <div className="p-3 bg-orange-50 rounded-xl mb-5">
                    <p className="font-bold text-slate-800 text-sm">{loan.book?.title}</p>
                    <p className="text-xs text-slate-500">{loan.member?.name} · {loan.member?.member_id}</p>
                </div>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
                <Field label="Incident Type" required error={errors.incident_type}>
                    <div className="flex gap-3">
                        <button type="button"
                            onClick={() => setData('incident_type', 'lost')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1
                                ${data.incident_type === 'lost'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                        >
                            <Shield className="w-5 h-5" />
                            Book Lost
                            <span className={`text-xs font-medium ${data.incident_type === 'lost' ? 'text-orange-100' : 'text-orange-500'}`}>
                                {fmt(loan.book?.lost_fee ?? 0)} fee
                            </span>
                        </button>
                        <button type="button"
                            onClick={() => setData('incident_type', 'damaged')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1
                                ${data.incident_type === 'damaged'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                        >
                            <AlertCircle className="w-5 h-5" />
                            Book Damaged
                            <span className={`text-xs font-medium ${data.incident_type === 'damaged' ? 'text-yellow-100' : 'text-yellow-500'}`}>
                                {fmt(loan.book?.damage_fee ?? 0)} fee
                            </span>
                        </button>
                    </div>
                </Field>

                <div className="bg-slate-50 rounded-xl p-3 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                        <span>Fee to collect</span><span className="text-red-600 text-sm">{fmt(fee)}</span>
                    </div>
                    {data.incident_type === 'lost' && (
                        <p className="text-slate-400 mt-1">Book will be permanently removed from inventory.</p>
                    )}
                </div>

                <Field label="Payment Method" error={errors.payment_method}>
                    <div className="flex gap-2">
                        {['cash', 'card', 'none'].map(m => (
                            <button key={m} type="button"
                                onClick={() => setData('payment_method', m)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                                    ${data.payment_method === m
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field label="Notes" error={errors.notes}>
                    <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Describe the incident..." rows={2} />
                </Field>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button type="submit" disabled={processing} className="btn-danger flex-1">
                        {processing ? 'Recording...' : 'Record Incident'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/* ─────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────── */
export default function LibraryIndex({ books, members, loans, stats, revenue, filters }) {
    const { auth } = usePage().props;
    const user     = auth?.user;
    const [tab, setTab]                 = useState('books');
    const [bookSearch, setBookSearch]   = useState(filters?.book_search ?? '');
    const [memberSearch, setMemberSearch] = useState(filters?.member_search ?? '');
    const [loanStatus, setLoanStatus]   = useState(filters?.loan_status ?? 'all');

    const [showAddBook, setShowAddBook]       = useState(false);
    const [editBook, setEditBook]             = useState(null);
    const [deleteBookTarget, setDeleteBookTarget] = useState(null);
    const [lendBook, setLendBook]             = useState(null);
    const [showAddMember, setShowAddMember]   = useState(false);
    const [editMember, setEditMember]         = useState(null);
    const [returnLoan, setReturnLoan]         = useState(null);
    const [extendLoan, setExtendLoan]         = useState(null);
    const [incidentLoan, setIncidentLoan]     = useState(null);

    const search = useCallback((params) => {
        router.get(route('library.index'), { ...filters, ...params }, { preserveState: true, replace: true });
    }, [filters]);

    const handleBookSearch = (e) => {
        e.preventDefault();
        search({ book_search: bookSearch });
    };
    const handleMemberSearch = (e) => {
        e.preventDefault();
        search({ member_search: memberSearch });
    };
    const handleLoanStatusChange = (s) => {
        setLoanStatus(s);
        search({ loan_status: s });
    };

    const handleDeleteBook = (book) => {
        if (!window.confirm(`Remove "${book.title}" from the library?`)) return;
        router.delete(route('library.books.destroy', book.id));
    };

    const booksList   = books?.data ?? [];
    const membersList = members?.data ?? [];
    const loansList   = loans?.data ?? [];

    const TAB_ITEMS = [
        { key: 'books',   label: 'Books',   count: stats?.total_books },
        { key: 'loans',   label: 'Loans',   count: stats?.active_loans },
        { key: 'members', label: 'Members', count: stats?.total_members },
        { key: 'revenue', label: 'Revenue', count: null },
    ];

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <MainLayout
            activeKey="library"
            pageTitle="Library"
            user={user}
            onLogout={handleLogout}
        >
            <Head title="Library Management" />

            <div className="min-h-screen bg-slate-50">
                {/* ── Header ── */}
                <div className="card mb-4 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <BookMarked className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Library</h1>
                                <p className="text-xs text-slate-400">Manage books, members & lending</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" /> Add Member
                            </button>
                            <button
                                onClick={() => setShowAddBook(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Book
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
                        <StatCard icon={BookOpen} label="Total Books" value={stats?.total_books ?? 0} color="indigo" />
                        <StatCard icon={CheckCircle} label="Available" value={stats?.available_books ?? 0} color="emerald" />
                        <StatCard icon={Clock} label="Active Loans" value={stats?.active_loans ?? 0} color="violet" />
                        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdue_loans ?? 0} color="red" />
                        <StatCard icon={Users} label="Members" value={stats?.total_members ?? 0} color="amber" />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-5 border-b border-slate-100">
                        {TAB_ITEMS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors relative
                                    ${tab === t.key
                                        ? 'text-indigo-600'
                                        : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t.label}
                                {t.count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                        ${tab === t.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {t.count}
                                    </span>
                                )}
                                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* ══════════════════════════ BOOKS TAB ══════════════════════════ */}
                    {tab === 'books' && (
                        <>
                            <div className="flex gap-3 mb-5">
                                <form onSubmit={handleBookSearch} className="flex-1 flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={bookSearch}
                                            onChange={e => setBookSearch(e.target.value)}
                                            placeholder="Search by title, author, ISBN..."
                                            className="form-input pl-9"
                                        />
                                    </div>
                                    <button type="submit" className="btn-secondary">
                                        Search
                                    </button>
                                    {bookSearch && (
                                        <button type="button" onClick={() => { setBookSearch(''); search({ book_search: '' }); }}
                                            className="btn-secondary px-3">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </form>
                            </div>

                            {booksList.length === 0 ? (
                                <div className="text-center py-20">
                                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No books found</p>
                                    <p className="text-slate-300 text-sm mt-1">Add your first book to get started</p>
                                    <button onClick={() => setShowAddBook(true)}
                                        className="btn-primary mt-4">
                                        Add Book
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {booksList.map(book => (
                                        <BookCard
                                            key={book.id}
                                            book={book}
                                            onLend={setLendBook}
                                            onEdit={setEditBook}
                                            onDelete={handleDeleteBook}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {books?.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: books.last_page }, (_, i) => i + 1).map(p => (
                                        <button key={p}
                                            onClick={() => router.get(route('library.index'), { ...filters, books_page: p }, { preserveState: true })}
                                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                                                ${books.current_page === p
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════ LOANS TAB ══════════════════════════ */}
                    {tab === 'loans' && (
                        <>
                            {/* Status filter */}
                            <div className="flex gap-2 mb-5 flex-wrap">
                                {[
                                    { key: 'all', label: 'All Loans' },
                                    { key: 'active', label: 'Active' },
                                    { key: 'overdue', label: 'Overdue', alert: true },
                                    { key: 'returned', label: 'Returned' },
                                    { key: 'lost', label: 'Lost' },
                                    { key: 'damaged', label: 'Damaged' },
                                ].map(({ key, label, alert }) => (
                                    <button key={key}
                                        onClick={() => handleLoanStatusChange(key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                                            ${loanStatus === key
                                                ? alert
                                                    ? 'bg-red-600 text-white shadow-sm'
                                                    : 'bg-indigo-600 text-white shadow-sm'
                                                : alert
                                                    ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                    >
                                        {label}
                                        {key === 'overdue' && stats?.overdue_loans > 0 && (
                                            <span className="ml-1.5 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                {stats.overdue_loans}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {loansList.length === 0 ? (
                                <div className="text-center py-20 card">
                                    <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No loans found</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Book</th>
                                                    <th>Member</th>
                                                    <th>Issued</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                    <th>Issued By</th>
                                                    <th>Charges</th>
                                                    <th />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loansList.map(loan => (
                                                    <LoanRow
                                                        key={loan.id}
                                                        loan={loan}
                                                        onReturn={setReturnLoan}
                                                        onExtend={setExtendLoan}
                                                        onIncident={setIncidentLoan}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {loans?.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {Array.from({ length: loans.last_page }, (_, i) => i + 1).map(p => (
                                        <button key={p}
                                            onClick={() => router.get(route('library.index'), { ...filters, loans_page: p }, { preserveState: true })}
                                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                                                ${loans.current_page === p
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════ MEMBERS TAB ══════════════════════════ */}
                    {tab === 'members' && (
                        <>
                            <div className="flex gap-3 mb-5">
                                <form onSubmit={handleMemberSearch} className="flex-1 flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={memberSearch}
                                            onChange={e => setMemberSearch(e.target.value)}
                                            placeholder="Search by name, member ID, phone..."
                                            className="form-input pl-9"
                                        />
                                    </div>
                                    <button type="submit" className="btn-secondary">
                                        Search
                                    </button>
                                    {memberSearch && (
                                        <button type="button" onClick={() => { setMemberSearch(''); search({ member_search: '' }); }}
                                            className="btn-secondary px-3">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </form>
                                <button onClick={() => setShowAddMember(true)}
                                    className="btn-primary flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Add Member
                                </button>
                            </div>

                            {membersList.length === 0 ? (
                                <div className="text-center py-20 card">
                                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No members found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {membersList.map(member => (
                                        <div key={member.id}
                                            className="card hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                                                        <p className="text-xs text-indigo-600 font-semibold">{member.member_id}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                                    ${member.status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'}`}>
                                                    {member.status === 'active' ? 'Active' : 'Suspended'}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                {member.email && (
                                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                                )}
                                                {member.phone && (
                                                    <p className="text-xs text-slate-500">{member.phone}</p>
                                                )}
                                                <p className="text-xs text-slate-400">
                                                    Member since {fmtDate(member.joined_at)}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                                <div className={`flex items-center gap-1.5 text-xs font-semibold
                                                    ${member.active_loans_count > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {member.active_loans_count > 0
                                                        ? `${member.active_loans_count} active loan${member.active_loans_count > 1 ? 's' : ''}`
                                                        : 'No active loans'}
                                                </div>
                                                <button
                                                    onClick={() => setEditMember(member)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {members?.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: members.last_page }, (_, i) => i + 1).map(p => (
                                        <button key={p}
                                            onClick={() => router.get(route('library.index'), { ...filters, members_page: p }, { preserveState: true })}
                                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors
                                                ${members.current_page === p
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══════════════════════════ REVENUE TAB ══════════════════════════ */}
                    {tab === 'revenue' && (
                        <div className="space-y-6">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="card p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Earned</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{fmt((revenue?.lending_total ?? 0) + (revenue?.late_fines_total ?? 0) + (revenue?.lost_fees_total ?? 0) + (revenue?.damage_fees_total ?? 0))}</p>
                                    <p className="text-xs text-slate-400 mt-1">Lending + fines + fees</p>
                                </div>
                                <div className="card p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lending Income</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{fmt(revenue?.lending_total ?? 0)}</p>
                                    <p className="text-xs text-slate-400 mt-1">{revenue?.lending_count ?? 0} completed loans</p>
                                </div>
                                <div className="card p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Late Fines</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{fmt(revenue?.late_fines_total ?? 0)}</p>
                                    <p className="text-xs text-slate-400 mt-1">{revenue?.late_fines_count ?? 0} late returns</p>
                                </div>
                                <div className="card p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                                            <Banknote className="w-4 h-4 text-violet-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deposits Held</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-800">{fmt(revenue?.deposits_held ?? 0)}</p>
                                    <p className="text-xs text-slate-400 mt-1">Refundable on return</p>
                                </div>
                            </div>

                            {/* Pending alerts */}
                            {((revenue?.pending_fines ?? 0) > 0 || (revenue?.pending_lending ?? 0) > 0) && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-amber-800">Uncollected income from active loans</p>
                                        {(revenue?.pending_lending ?? 0) > 0 && (
                                            <p className="text-xs text-amber-700">~<span className="font-bold">{fmt(revenue.pending_lending)}</span> in lending fees from {stats?.active_loans} active loan(s)</p>
                                        )}
                                        {(revenue?.pending_fines ?? 0) > 0 && (
                                            <p className="text-xs text-amber-700">~<span className="font-bold">{fmt(revenue.pending_fines)}</span> in overdue fines from {stats?.overdue_loans} overdue loan(s)</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Monthly Breakdown */}
                                <div className="card p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                                        <h3 className="font-bold text-slate-800 text-sm">Monthly Earnings (Last 6 months)</h3>
                                    </div>
                                    {(revenue?.monthly?.length ?? 0) === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-6">No earnings recorded yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {revenue.monthly.map((m) => {
                                                const total = parseFloat(m.lending ?? 0) + parseFloat(m.fines ?? 0) + parseFloat(m.incident_fees ?? 0);
                                                const maxTotal = Math.max(...revenue.monthly.map(x => parseFloat(x.lending ?? 0) + parseFloat(x.fines ?? 0) + parseFloat(x.incident_fees ?? 0)), 1);
                                                const pct = Math.round((total / maxTotal) * 100);
                                                const label = new Date(m.month + '-01').toLocaleDateString('en-LK', { month: 'short', year: 'numeric' });
                                                return (
                                                    <div key={m.month}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-medium text-slate-600">{label}</span>
                                                            <span className="font-bold text-slate-800">{fmt(total)}</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <div className="flex gap-3 text-[10px] text-slate-400 mt-0.5">
                                                            <span className="text-indigo-500">Lending: {fmt(m.lending ?? 0)}</span>
                                                            <span>Fines: {fmt(m.fines ?? 0)}</span>
                                                            <span>Incidents: {fmt(m.incident_fees ?? 0)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Top Earning Books */}
                                <div className="card p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <h3 className="font-bold text-slate-800 text-sm">Top Earning Books</h3>
                                    </div>
                                    {(revenue?.top_books?.length ?? 0) === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-6">No earnings recorded yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {revenue.top_books.map((b, i) => (
                                                <div key={b.library_book_id} className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                                                        ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-slate-700 truncate">{b.book?.title ?? '—'}</p>
                                                        <p className="text-[10px] text-slate-400">{b.total_loans} loans · {fmt(b.lending_earned ?? 0)} lending</p>
                                                    </div>
                                                    <div className="text-xs font-bold text-emerald-600 flex-shrink-0">{fmt(parseFloat(b.lending_earned ?? 0) + parseFloat(b.fines_earned ?? 0))}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Full Breakdown Table */}
                            <div className="card p-5">
                                <h3 className="font-bold text-slate-800 text-sm mb-4">Full Earnings Breakdown</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                                            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Count</th>
                                            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr>
                                            <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400" /><span className="text-slate-700">Lending fees (daily rate × days)</span></div></td>
                                            <td className="py-3 text-right text-slate-500">{revenue?.lending_count ?? 0}</td>
                                            <td className="py-3 text-right font-semibold text-indigo-700">{fmt(revenue?.lending_total ?? 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-slate-700">Late return fines</span></div></td>
                                            <td className="py-3 text-right text-slate-500">{revenue?.late_fines_count ?? 0}</td>
                                            <td className="py-3 text-right font-semibold text-slate-800">{fmt(revenue?.late_fines_total ?? 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-slate-700">Lost book fees</span></div></td>
                                            <td className="py-3 text-right text-slate-500">{revenue?.lost_fees_count ?? 0}</td>
                                            <td className="py-3 text-right font-semibold text-slate-800">{fmt(revenue?.lost_fees_total ?? 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-slate-700">Damage fees</span></div></td>
                                            <td className="py-3 text-right text-slate-500">{revenue?.damage_fees_count ?? 0}</td>
                                            <td className="py-3 text-right font-semibold text-slate-800">{fmt(revenue?.damage_fees_total ?? 0)}</td>
                                        </tr>
                                        <tr className="bg-emerald-50 font-bold">
                                            <td className="py-3 px-2 rounded-l-lg"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-emerald-800">Grand Total Earned</span></div></td>
                                            <td className="py-3 text-right text-slate-500">{revenue?.lending_count ?? 0}</td>
                                            <td className="py-3 px-2 text-right text-emerald-700 text-base rounded-r-lg">{fmt((revenue?.lending_total ?? 0) + (revenue?.late_fines_total ?? 0) + (revenue?.lost_fees_total ?? 0) + (revenue?.damage_fees_total ?? 0))}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-400" /><span className="text-slate-500">Deposits held (refundable, not income)</span></div></td>
                                            <td className="py-3 text-right text-slate-400">{stats?.active_loans ?? 0}</td>
                                            <td className="py-3 text-right font-semibold text-violet-600">{fmt(revenue?.deposits_held ?? 0)}</td>
                                        </tr>
                                        {(revenue?.pending_lending ?? 0) > 0 && (
                                            <tr>
                                                <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-300" /><span className="text-indigo-500">Pending lending fees (active loans)</span></div></td>
                                                <td className="py-3 text-right text-slate-400">{stats?.active_loans ?? 0}</td>
                                                <td className="py-3 text-right font-semibold text-indigo-500">~{fmt(revenue?.pending_lending)}</td>
                                            </tr>
                                        )}
                                        {(revenue?.pending_fines ?? 0) > 0 && (
                                            <tr>
                                                <td className="py-3"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-amber-600">Pending overdue fines (uncollected)</span></div></td>
                                                <td className="py-3 text-right text-slate-400">{stats?.overdue_loans ?? 0}</td>
                                                <td className="py-3 text-right font-semibold text-amber-600">~{fmt(revenue?.pending_fines)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════ MODALS ════════════ */}
            {showAddBook && <BookFormModal onClose={() => setShowAddBook(false)} />}
            {editBook    && <BookFormModal book={editBook} onClose={() => setEditBook(null)} />}
            {lendBook    && <IssueLoanModal book={lendBook} members={members} onClose={() => setLendBook(null)} />}
            {showAddMember && <MemberFormModal onClose={() => setShowAddMember(false)} />}
            {editMember  && <MemberFormModal member={editMember} onClose={() => setEditMember(null)} />}
            {returnLoan  && <ReturnModal loan={returnLoan} onClose={() => setReturnLoan(null)} />}
            {extendLoan  && <ExtendModal loan={extendLoan} onClose={() => setExtendLoan(null)} />}
            {incidentLoan && <IncidentModal loan={incidentLoan} onClose={() => setIncidentLoan(null)} />}
        </MainLayout>
    );
}