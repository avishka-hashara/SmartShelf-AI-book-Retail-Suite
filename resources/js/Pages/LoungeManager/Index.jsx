import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ActiveSessionsBoard from './Components/ActiveSessionsBoard';
import DailySummaryCard from './Components/DailySummaryCard';
import CheckInModal from './Components/CheckInModal';
import CheckOutModal from './Components/CheckOutModal';
import LoungeSettingsModal from './Components/LoungeSettingsModal';
import axios from 'axios';

export default function LoungeManager({ auth }) {
    const [activeKey, setActiveKey] = useState('lounge');
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedSessionToCheckout, setSelectedSessionToCheckout] = useState(null);
    const [dailySummary, setDailySummary] = useState({
        total_sessions: 0,
        total_revenue: 0,
        average_duration_minutes: 0
    });

    // Refresh Daily Summary Trigger
    const fetchSummary = async () => {
        try {
            const res = await axios.get('/api/reading/sessions/summary/today');
            setDailySummary(res.data);
        } catch (e) {
            console.error('Failed to fetch daily summary', e);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Callbacks
    const handleCheckInSuccess = () => {
        setIsCheckInOpen(false);
        // Emitting an event or forcing reload of board isn't strictly necessary 
        // if board polls every 60s, but we will pass a refresh prop later.
        window.dispatchEvent(new Event('refresh-sessions'));
    };

    const handleCheckoutClick = (session) => {
        setSelectedSessionToCheckout(session);
        setIsCheckOutOpen(true);
    };

    const handleCheckOutSuccess = () => {
        setIsCheckOutOpen(false);
        setSelectedSessionToCheckout(null);
        window.dispatchEvent(new Event('refresh-sessions'));
        fetchSummary(); // reload summary after checkout
    };

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Lounge Manager"
            user={auth?.user ?? { name: 'Admin User', email: 'admin@pos.com' }}
            onLogout={handleLogout}
        >
            <Head title="Reading Lounge Manager" />

            <div className="page-header flex justify-between items-end border-b border-slate-200 pb-4 mb-6">
                <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1" aria-label="Breadcrumb">
                        <span>Lumina Books POS</span>
                        <span>/</span>
                        <span className="text-slate-600 font-medium">Reading Lounge</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reading Lounge Manager</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage active reading sessions and lounge occupancy.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center sm:items-stretch gap-6">
                <DailySummaryCard summary={dailySummary} />

                <div className="flex flex-wrap items-center self-center sm:self-auto sm:ml-auto gap-3 mt-4 sm:mt-0">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="btn-white py-3 px-5 shadow-sm border border-slate-200 rounded-xl font-medium tracking-wide flex items-center gap-2 hover:bg-slate-50 transition-colors text-slate-700"
                    >
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Layout Settings
                    </button>
                    <button
                        onClick={() => setIsCheckInOpen(true)}
                        className="btn-primary py-3 px-6 shadow-md shadow-indigo-500/20 rounded-xl font-medium tracking-wide flex items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Check-In
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <ActiveSessionsBoard onCheckout={handleCheckoutClick} />
            </div>

            {/* Modals */}
            <CheckInModal
                isOpen={isCheckInOpen}
                onClose={() => setIsCheckInOpen(false)}
                onSuccess={handleCheckInSuccess}
                cashierName={auth?.user?.name || 'Admin'}
            />

            <CheckOutModal
                isOpen={isCheckOutOpen}
                onClose={() => setIsCheckOutOpen(false)}
                session={selectedSessionToCheckout}
                onSuccess={handleCheckOutSuccess}
            />

            <LoungeSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

        </MainLayout>
    );
}
