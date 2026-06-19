import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';

export default function CancelSessionModal({ isOpen, onClose, session, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleConfirmCancel = async () => {
        if (!session) return;
        setSubmitting(true);
        setError('');

        try {
            await axios.post(`/api/reading/sessions/${session.id}/cancel`);
            onSuccess();
        } catch (err) {
            console.error('Failed to cancel session', err);
            setError(err.response?.data?.message || 'Failed to cancel session.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={!submitting ? onClose : () => { }}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="modal-box w-full max-w-md transform p-8 text-left align-middle">

                                <div className="absolute top-4 right-4">
                                    <button onClick={onClose} disabled={submitting} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none disabled:opacity-50">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center mt-2">
                                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-sm ring-8 ring-rose-50">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>

                                    <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 mb-2">
                                        Cancel Active Session
                                    </Dialog.Title>

                                    <div className="text-slate-500 text-sm mb-8 leading-relaxed">
                                        Are you sure you want to cancel the session for seat <span className="font-bold text-slate-800">{session?.seat_number}</span>? This will free the seat immediately and record <span className="font-semibold text-rose-500">0 revenue</span>. This action cannot be undone.
                                    </div>

                                    {error && (
                                        <div className="w-full mb-6 bg-rose-50 text-rose-600 border border-rose-100 text-sm px-4 py-3 rounded-xl flex items-start gap-2 text-left">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 w-full">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={submitting}
                                            className="btn-secondary flex-1"
                                        >
                                            Keep Session
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmCancel}
                                            disabled={submitting}
                                            className="btn-danger flex-1"
                                        >
                                            {submitting ? 'Canceling...' : 'Yes, Cancel'}
                                        </button>
                                    </div>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
