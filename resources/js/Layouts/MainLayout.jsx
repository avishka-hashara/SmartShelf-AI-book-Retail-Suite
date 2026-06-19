import React, { useState, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * MainLayout - Root layout combining Sidebar + Header.
 * Wrap every authenticated POS page with this component.
 *
 * @param {string}    activeKey   - Active sidebar nav key
 * @param {function}  onNavigate  - Called with (key, href) on nav click
 * @param {string}    pageTitle   - Title shown in mobile top bar
 * @param {object}    user        - Current authenticated user
 * @param {function}  onLogout    - Logout callback
 * @param {ReactNode} children    - Page content
 * @returns {JSX.Element}
 */
// Module-level variable to persist state across Inertia navigations without full page reload
let persistentSidebarCollapsed = false;

const MainLayout = ({
    activeKey = 'dashboard',
    onNavigate,
    pageTitle = 'Dashboard',
    user,
    onLogout,
    children,
}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(persistentSidebarCollapsed);

    // Default navigation: if no onNavigate prop is provided by the page,
    // fall back to router.visit so sidebar clicks always work.
    const handleNavigate = useCallback((key, href) => {
        if (onNavigate) {
            onNavigate(key, href);
        } else {
            router.visit(href);
        }
    }, [onNavigate]);

    // Update persistent state whenever it changes
    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            persistentSidebarCollapsed = next;
            return next;
        });
    };

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="pos-layout">

            {/* ── Sidebar ── */}
            <Sidebar
                activeKey={activeKey}
                onNavigate={handleNavigate}
                collapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                store={usePage().props.store}
            />

            {/* ── Main Content Area ── */}
            <div className="pos-main min-w-0">

                {/* Header */}
                <Header
                    onMenuToggle={() => setMobileOpen(true)}
                    user={user}
                    onLogout={onLogout}
                    pageTitle={pageTitle}
                    store={usePage().props.store}
                />

                {/* Scrollable page body */}
                <main className="pos-content" id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;