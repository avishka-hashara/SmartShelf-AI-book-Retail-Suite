// resources/js/Pages/Settings/Settings.jsx

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { XCircle, CheckCircle } from 'lucide-react';
import SettingsSidebar, { SECTIONS } from './components/SettingsSidebar';

/* ── Lazy-loaded section components ── */
const StoreProfileSection   = lazy(() => import('./sections/StoreProfileSection'));
const TaxComplianceSection  = lazy(() => import('./sections/TaxComplianceSection'));
const ReceiptSection        = lazy(() => import('./sections/ReceiptSection'));
const LoyaltySection        = lazy(() => import('./sections/LoyaltySection'));
const SalesCheckoutSection  = lazy(() => import('./sections/SalesCheckoutSection'));
const UsersAccessSection    = lazy(() => import('./sections/UsersAccessSection'));

/* ─────────────────────────────────────────────────
   BREADCRUMB
   ───────────────────────────────────────────────── */
const Breadcrumb = ({ items }) => (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1" aria-label="Breadcrumb">
        {items.map((item, i) => (
            <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span className={i === items.length - 1 ? 'text-slate-600 font-medium' : ''}>
                    {item}
                </span>
            </React.Fragment>
        ))}
    </nav>
);

/* ─────────────────────────────────────────────────
   SECTION LOADING FALLBACK
   ───────────────────────────────────────────────── */
const SectionLoader = () => (
    <div className="card">
        <div className="p-8 flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-slate-500 font-medium">Loading…</span>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   PLACEHOLDER SECTION CONTENT
   ───────────────────────────────────────────────── */
const SectionPlaceholder = ({ section }) => (
    <div className="card">
        <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                {SECTIONS.find(s => s.key === section)?.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-700">
                {SECTIONS.find(s => s.key === section)?.label}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm">
                This section is under construction. Settings content will appear here soon.
            </p>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   SETTINGS PAGE
   ───────────────────────────────────────────────── */
export default function Settings({ auth, settings, users, rolePermissions }) {
    const [activeKey, setActiveKey]       = useState('settings');
    const [activeSection, setActiveSection] = useState('store-profile');
    const [toast, setToast]               = useState(null);
    const [dirtySections, setDirtySections] = useState(new Set());
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    /* Track dirty state from child section forms */
    const handleDirtyChange = useCallback((sectionKey, isDirty) => {
        setDirtySections(prev => {
            const next = new Set(prev);
            isDirty ? next.add(sectionKey) : next.delete(sectionKey);
            return next;
        });
    }, []);

    /* Inertia flash messages → toast */
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'danger');
        }
    }, [flash?.success, flash?.error]);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* ── Render active section content ── */
    const renderSectionContent = () => {
        switch (activeSection) {
            case 'store-profile':
                return <StoreProfileSection settings={settings} showToast={showToast} onDirtyChange={handleDirtyChange} />;
            case 'tax':
                return <TaxComplianceSection settings={settings} onDirtyChange={handleDirtyChange} />;
            case 'receipt':
                return <ReceiptSection settings={settings} onDirtyChange={handleDirtyChange} />;
            case 'customers-loyalty':
                return <LoyaltySection settings={settings} onDirtyChange={handleDirtyChange} />;
            case 'sales-checkout':
                return <SalesCheckoutSection settings={settings} onDirtyChange={handleDirtyChange} />;
            case 'users':
                return <UsersAccessSection users={users} rolePermissions={rolePermissions} />;
            default:
                return <SectionPlaceholder section={activeSection} />;
        }
    };

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Settings"
            user={auth?.user ?? { name: 'Admin User', email: 'admin@luminabooks.com' }}
            onLogout={() => router.post('/logout')}
        >
            <Head title="Settings" />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up
                    ${toast.type === 'danger' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <span>{toast.type === 'danger' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</span>
                    {toast.msg}
                </div>
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <Breadcrumb items={['Lumina Books POS', 'Settings']} />
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse-soft" />
                        Manage your store configuration and preferences
                    </p>
                </div>
            </div>

            {/* ── Two-column layout: Sidebar + Content ── */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left — Section navigation */}
                <SettingsSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    dirtySections={dirtySections}
                    mobileNavOpen={mobileNavOpen}
                    setMobileNavOpen={setMobileNavOpen}
                />

                {/* Right — Active section content */}
                <div className="flex-1 min-w-0">
                    <Suspense fallback={<SectionLoader />}>
                        {renderSectionContent()}
                    </Suspense>
                </div>

            </div>
        </MainLayout>
    );
}
