import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CheckOutModal({ isOpen, onClose, session, onSuccess }) {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!session) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.post(`/api/reading/sessions/${session.id}/check-out`, {
                payment_method: paymentMethod
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to checkout.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="modal-box w-full max-w-lg transform p-8 text-left align-middle">

                                <div className="absolute top-4 right-4">
                                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    Confirm Checkout
                                </Dialog.Title>

                                <div className="mt-8">
                                    {error && (
                                        <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 text-sm px-4 py-3 rounded-xl">
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {/* Summary Card */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6">
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/60">
                                            <div>
                                                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Customer</p>
                                                <p className="text-base font-medium text-slate-900">{session.customer_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">Seat</p>
                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-xs rounded uppercase tracking-wider">
                                                    {session.seat_number}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-0.5">Check-in Time</p>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {new Date(session.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 mb-0.5">Time Elapsed</p>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {Math.floor(session.minutes_elapsed / 60)} hr {session.minutes_elapsed % 60} min
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost breakdown */}
                                    <div className="mb-8 pl-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                            <p className="text-sm text-slate-600">
                                                Rounded to nearest 0.5 hour: <span className="font-semibold text-slate-800">{Number(session.billed_units ?? 0).toFixed(1)} hrs</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            <p className="text-sm text-slate-600">
                                                Rate: Rs. {Number(session.hourly_rate).toLocaleString()} per hour
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end bg-indigo-50 text-indigo-900 p-4 rounded-xl border border-indigo-100">
                                            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-700/80">Total Due</span>
                                            <span className="text-3xl font-black">Rs. {Number(session.running_total).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-8">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Payment Method</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('cash')}
                                                    className={`py-3 px-4 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Cash
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={`py-3 px-4 rounded-xl border-2 font-medium flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                                                    Card
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            )}
                                            {submitting ? 'Processing...' : 'Complete Checkout'}
                                        </button>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}