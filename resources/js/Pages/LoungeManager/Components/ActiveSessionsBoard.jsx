import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LiveTimer from './LiveTimer';
import CancelSessionModal from './CancelSessionModal';

export default function ActiveSessionsBoard({ onCheckout }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionToCancel, setSessionToCancel] = useState(null);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await axios.get('/api/reading/sessions/active');
            setSessions(res.data.data); // json resource wrapper
        } catch (error) {
            console.error('Failed to fetch active sessions', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();

        // Poll every 60 seconds
        const intervalId = setInterval(fetchSessions, 60000);

        // Listen for manual trigger from other components
        const handleRefresh = () => fetchSessions();
        window.addEventListener('refresh-sessions', handleRefresh);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('refresh-sessions', handleRefresh);
        };
    }, [fetchSessions]);

    const handleCancelClick = (session) => {
        setSessionToCancel(session);
    };

    const handleCancelSuccess = () => {
        setSessionToCancel(null);
        window.dispatchEvent(new Event('refresh-sessions'));
    };

    // Color logic
    // green = under 1 hour, orange = 1-2 hours, red = over 2 hours
    const getCardColorClasses = (minutesElapsed) => {
        if (minutesElapsed >= 120) {
            return {
                borderTop: 'border-rose-500',
                textPrimary: 'text-rose-600',
                bgBadge: 'bg-rose-100 text-rose-700',
                dot: 'bg-rose-500'
            };
        } else if (minutesElapsed >= 60) {
            return {
                borderTop: 'border-amber-500',
                textPrimary: 'text-amber-600',
                bgBadge: 'bg-amber-100 text-amber-700',
                dot: 'bg-amber-500'
            };
        }
        return {
            borderTop: 'border-emerald-500',
            textPrimary: 'text-emerald-600',
            bgBadge: 'bg-emerald-100 text-emerald-700',
            dot: 'bg-emerald-500'
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 card">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mb-3"></div>
                    <span className="text-slate-400 text-sm font-medium tracking-wide">Loading Active Sessions</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center mb-6">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Active Sessions</h2>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">All Seats</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sessions.length === 0 ? (
                    <div className="col-span-1 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <p className="font-semibold text-slate-700">Assign Seat</p>
                        <p className="text-sm text-slate-500 mt-1">Check-in a new customer</p>
                    </div>
                ) : null}

                {sessions.map((session) => {
                    const colors = getCardColorClasses(session.minutes_elapsed);

                    return (
                        <div key={session.id} className={`card overflow-hidden flex flex-col relative before:absolute before:inset-x-0 before:top-0 before:h-1 before:${colors.borderTop} before:w-full hover:-translate-y-1 duration-200 group`}>

                            <div className="p-5 pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded flex items-center gap-1.5 ${colors.bgBadge}`}>
                                        {session.seat_number}
                                        {session.minutes_elapsed >= 180 && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                            </span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => handleCancelClick(session)}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:outline-none"
                                        title="Cancel Session"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 truncate" title={session.customer_name}>
                                    {session.customer_name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Check-in: {new Date(session.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            <div className="px-5 py-6 flex-1 flex flex-col items-center justify-center border-y border-dashed border-slate-100 bg-slate-50/50">
                                <span className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${session.minutes_elapsed >= 120 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {session.minutes_elapsed >= 120 ? 'LONG SESSION' : 'TIME ELAPSED'}
                                </span>
                                <div className={`text-4xl font-light tracking-tight ${session.minutes_elapsed >= 120 ? 'text-rose-600 font-medium' : session.minutes_elapsed >= 60 ? 'text-amber-600' : 'text-slate-800'}`}>
                                    <LiveTimer checkInAt={session.check_in_at} />
                                </div>
                            </div>

                            <div className="p-5 pt-4 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-none">Running Cost</p>
                                    <p className="text-lg font-bold text-slate-900 mt-1 leading-none">
                                        Rs. {Number(session.running_total).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onCheckout(session)}
                                    className="btn-secondary text-sm px-4 py-2"
                                >
                                    Checkout
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>

            <CancelSessionModal
                isOpen={!!sessionToCancel}
                onClose={() => setSessionToCancel(null)}
                session={sessionToCancel}
                onSuccess={handleCancelSuccess}
            />
        </div>
    );
}
