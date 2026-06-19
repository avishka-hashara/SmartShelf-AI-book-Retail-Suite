import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';

export default function LoungeSettingsModal({ isOpen, onClose }) {
    const [layout, setLayout] = useState([]);
    const [hourlyRate, setHourlyRate] = useState(350);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLayout();
        } else {
            setError('');
            setSuccessMsg('');
        }
    }, [isOpen]);

    const fetchLayout = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/reading/settings/layout');
            setLayout(res.data.layout || []);
            setHourlyRate(res.data.hourly_rate ?? 350);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch current layout.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await axios.post('/api/reading/settings/layout', { layout, hourly_rate: hourlyRate });
            setSuccessMsg(res.data.message || 'Layout saved securely.');
            // Trigger refresh so other components update their layout natively
            window.dispatchEvent(new Event('refresh-sessions'));
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save layout.');
        } finally {
            setSaving(false);
        }
    };

    const addTable = () => {
        const newId = `T${layout.length + 1}`;
        setLayout([...layout, { id: newId, label: `Table ${layout.length + 1}`, seats: 4 }]);
    };

    const updateTable = (index, field, value) => {
        const newLayout = [...layout];
        if (field === 'seats') {
            value = parseInt(value) || 1;
            if (value > 20) value = 20; // safety limit
        }
        newLayout[index][field] = value;
        setLayout(newLayout);
    };

    const deleteTable = (index) => {
        const newLayout = layout.filter((_, i) => i !== index);
        setLayout(newLayout);
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all border border-slate-100">

                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={onClose} disabled={saving} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none disabled:opacity-50">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    Lounge Layout Configuration
                                </Dialog.Title>
                                <p className="mt-2 text-sm text-slate-500">
                                    Manage tables and seat counts. Modifying tables that are currently occupied will be safely prevented by the system.
                                </p>

                                <div className="mt-8">
                                    {error && (
                                        <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {successMsg && (
                                        <div className="mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm px-4 py-3 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-2">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            <p>{successMsg}</p>
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="py-12 flex justify-center">
                                            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Hourly Rate Setting */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">Standard Hourly Rate</p>
                                                        <p className="text-xs text-slate-500">Applied to all new check-ins. Billed per 30 min block.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-sm font-bold text-slate-600">Rs.</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="100000"
                                                        step="0.01"
                                                        value={hourlyRate}
                                                        onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                                                        className="w-28 bg-white border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 text-right"
                                                    />
                                                    <span className="text-sm font-semibold text-slate-500">/hr</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-4">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Table Layout</p>
                                            {layout.map((table, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                                                    <div className="w-full sm:w-1/4">
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Table ID</label>
                                                        <input
                                                            type="text"
                                                            value={table.id}
                                                            onChange={(e) => updateTable(index, 'id', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase font-bold focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="T1"
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-2/4">
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Display Label</label>
                                                        <input
                                                            type="text"
                                                            value={table.label}
                                                            onChange={(e) => updateTable(index, 'label', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="Table 1"
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-1/4">
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Seat Count</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="20"
                                                            value={table.seats}
                                                            onChange={(e) => updateTable(index, 'seats', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="pt-4 sm:pt-5">
                                                        <button
                                                            onClick={() => deleteTable(index)}
                                                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                                                            title="Remove Table"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addTable}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                Add New Table
                                            </button>
                                            </div>{/* end Table Layout section */}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={saving}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving || loading}
                                        className="btn-primary px-5 py-2.5 shadow-md shadow-indigo-500/20 rounded-xl font-semibold flex items-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:grayscale-[30%] disabled:hover:translate-y-0"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Saving Layout...
                                            </>
                                        ) : 'Save Layout configuration'}
                                    </button>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}