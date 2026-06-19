import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import InteractiveSeatMap from './InteractiveSeatMap';

export default function CheckInModal({ isOpen, onClose, onSuccess, cashierName }) {
    const [formData, setFormData] = useState({
        customer_name: '',
        seat_number: '',
        served_by: cashierName,
        hourly_rate: 350,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeSessions, setActiveSessions] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [layout, setLayout] = useState([]);
    const [hourlyRate, setHourlyRate] = useState(350);

    useEffect(() => {
        if (isOpen) {
            setLoadingSessions(true);
            axios.get('/api/reading/sessions/active')
                .then(res => setActiveSessions(res.data.data || []))
                .catch(err => {
                    console.error("Could not fetch active sessions", err);
                })
                .finally(() => setLoadingSessions(false));

            axios.get('/api/reading/settings/layout')
                .then(res => {
                    setLayout(res.data.layout || []);
                    const rate = res.data.hourly_rate ?? 350;
                    setHourlyRate(rate);
                    setFormData(prev => ({ ...prev, hourly_rate: rate }));
                })
                .catch(err => console.error("Could not fetch lounge layout", err));

            // Default to showing map
            setShowMap(true);
        } else {
            setFormData({ customer_name: '', seat_number: '', served_by: cashierName, hourly_rate: hourlyRate });
            setError('');
            setShowMap(false);
        }
    }, [isOpen, cashierName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.post('/api/reading/sessions/check-in', formData);
            setFormData({ customer_name: '', seat_number: '', served_by: cashierName, hourly_rate: hourlyRate });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check-in.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectSeat = (seatId) => {
        setFormData({ ...formData, seat_number: seatId });
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
                            <Dialog.Panel className={`modal-box w-full ${showMap ? 'max-w-5xl' : 'max-w-xl'} transform p-6 sm:p-8 text-left align-middle`}>

                                <div className="absolute top-4 right-4 z-10">
                                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                    </div>
                                    New Check-In
                                </Dialog.Title>

                                <div className="mt-8">
                                    {error && (
                                        <div className="mb-4 bg-rose-50 text-rose-600 border border-rose-100 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="h-full">
                                        <div className={`flex flex-col ${showMap ? 'lg:flex-row' : ''} gap-8 h-full`}>

                                            {/* LEFT SIDE: MAP */}
                                            {showMap && (
                                                <div className="w-full lg:w-[60%] flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Select Seat via Map</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowMap(!showMap)}
                                                            className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                                            Hide Map & Use Text
                                                        </button>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-center min-h-[400px]">
                                                        {loadingSessions ? (
                                                            <div className="flex justify-center items-center h-full bg-slate-50/50 rounded-2xl border border-slate-200 mt-4">
                                                                <div className="animate-pulse flex flex-col items-center">
                                                                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin mb-3"></div>
                                                                    <span className="text-slate-400 text-xs font-medium tracking-wide">Loading Layout...</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <InteractiveSeatMap
                                                                layout={layout}
                                                                activeSessions={activeSessions}
                                                                selectedSeat={formData.seat_number}
                                                                onSelectSeat={handleSelectSeat}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* RIGHT SIDE: FORM */}
                                            <div className={`w-full ${showMap ? 'lg:w-[40%] flex flex-col justify-between' : ''}`}>

                                                <div className="space-y-6">
                                                    {/* Seat Number Input (if not showing map) */}
                                                    {!showMap ? (
                                                        <div className="animate-in fade-in zoom-in-95 duration-300">
                                                            <label className="text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                                                                <span>Seat Number <span className="text-rose-500">*</span></span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowMap(!showMap)}
                                                                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                                                    Select via Map
                                                                </button>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-input w-full uppercase py-3"
                                                                placeholder="e.g. T1-A"
                                                                required
                                                                autoFocus
                                                                value={formData.seat_number}
                                                                onChange={e => setFormData({ ...formData, seat_number: e.target.value })}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider">
                                                                Seat Details <span className="text-rose-500">*</span>
                                                            </label>
                                                            {formData.seat_number ? (
                                                                <div className="text-center bg-indigo-50 rounded-xl py-6 border border-indigo-100/50 shadow-sm transition-all duration-300">
                                                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Selected Seat</span>
                                                                    <div className="text-3xl font-bold text-indigo-700 mt-1">
                                                                        {formData.seat_number}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center bg-slate-50 rounded-xl py-8 border border-slate-100 shadow-sm transition-all duration-300">
                                                                    <div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-500">Please select a seat from the map</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Customer Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                                                        <input
                                                            type="text"
                                                            className="form-input w-full"
                                                            placeholder="Guest"
                                                            value={formData.customer_name}
                                                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">Session Rate</p>
                                                                <p className="text-xs text-slate-500">Billed per 30 mins · editable per session</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white border border-emerald-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 rounded-lg px-3 py-2 transition-all">
                                                            <span className="text-sm font-bold text-slate-500 flex-shrink-0">Rs.</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="0.01"
                                                                required
                                                                value={formData.hourly_rate}
                                                                onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                                                                className="flex-1 text-right text-lg font-bold text-emerald-700 bg-transparent focus:outline-none min-w-0"
                                                            />
                                                            <span className="text-sm font-semibold text-slate-400 flex-shrink-0">/hr</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`${showMap ? 'mt-auto pt-8' : 'mt-8 pt-6'} border-t border-slate-100`}>
                                                    <button
                                                        type="submit"
                                                        disabled={submitting || !formData.seat_number}
                                                        className={`btn-primary w-full py-4 text-base font-semibold shadow-md rounded-xl transition-all ${(submitting || !formData.seat_number) ? 'opacity-50 cursor-not-allowed grayscale-[30%]' : 'hover:-translate-y-0.5 shadow-indigo-500/30'}`}
                                                    >
                                                        {submitting ? 'Checking in...' : 'Start Session'}
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
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