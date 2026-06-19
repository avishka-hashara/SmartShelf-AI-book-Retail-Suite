import React from 'react';

/* ─────────────────────────────────────────────────
   SECTION ICONS
   ───────────────────────────────────────────────── */
const SectionIcons = {
    StoreProfile: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
        </svg>
    ),
    Tax: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Receipt: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    Products: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    ),
    Sales: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    ),
    Loyalty: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    Notifications: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    Security: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
};

/* ─────────────────────────────────────────────────
   SETTINGS SECTIONS CONFIG
   ───────────────────────────────────────────────── */
export const SECTIONS = [
    { key: 'store-profile',     label: 'Store Profile',          icon: <SectionIcons.StoreProfile /> },
    { key: 'receipt',           label: 'Receipt Settings',       icon: <SectionIcons.Receipt /> },
    { key: 'users',             label: 'Users & Access Control', icon: <SectionIcons.Users /> },
    { key: 'customers-loyalty', label: 'Customers & Loyalty',    icon: <SectionIcons.Loyalty /> },
];

/* ─────────────────────────────────────────────────
   SETTINGS SIDEBAR NAVIGATION
   ───────────────────────────────────────────────── */
const SettingsSidebar = ({ activeSection, setActiveSection, dirtySections, mobileNavOpen, setMobileNavOpen }) => (
    <div className="w-full lg:w-64 flex-shrink-0">

        {/* ── MOBILE: Dropdown selector (below md) ── */}
        <div className="block md:hidden">
            <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="card w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700"
            >
                <span className="flex items-center gap-2">
                    {SECTIONS.find(s => s.key === activeSection)?.icon}
                    {SECTIONS.find(s => s.key === activeSection)?.label}
                    {dirtySections.has(activeSection) && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Unsaved changes" />
                    )}
                </span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {mobileNavOpen && (
                <div className="card mt-1 p-1.5 divide-y divide-slate-100 shadow-xl animate-fade-up">
                    {SECTIONS.map((section) => {
                        const isActive = activeSection === section.key;
                        const isDirty  = dirtySections.has(section.key);
                        return (
                            <button
                                key={section.key}
                                onClick={() => { setActiveSection(section.key); setMobileNavOpen(false); }}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {section.icon}
                                </span>
                                <span className="flex-1 truncate">{section.label}</span>
                                {isDirty && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        {/* ── TABLET: Horizontal scrollable tabs (md–lg) ── */}
        <div className="hidden md:block lg:hidden">
            <div className="card p-2">
                <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                    {SECTIONS.map((section) => {
                        const isActive = activeSection === section.key;
                        const isDirty  = dirtySections.has(section.key);
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {section.icon}
                                </span>
                                <span className="truncate">{section.label}</span>
                                {isDirty && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" title="Unsaved changes" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>

        {/* ── DESKTOP: Sticky sidebar (lg+) ── */}
        <div className="hidden lg:block">
            <div className="card p-2 lg:sticky lg:top-4">
                <nav className="flex flex-col gap-1">
                    {SECTIONS.map((section) => {
                        const isActive = activeSection === section.key;
                        const isDirty  = dirtySections.has(section.key);
                        return (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-150
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {section.icon}
                                </span>
                                <span className="truncate flex-1">{section.label}</span>
                                {isDirty && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" title="Unsaved changes" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>

    </div>
);

export default SettingsSidebar;