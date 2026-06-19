import React, { useState } from "react";
import { usePage } from "@inertiajs/react";

/* ─────────────────────────────────────────────────
   SIDEBAR ICONS (inline SVG — no external dep needed)
   ───────────────────────────────────────────────── */
const Icons = {
    Dashboard: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
                strokeLinecap="round"
            />
            <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
                strokeLinecap="round"
            />
            <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
                strokeLinecap="round"
            />
            <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
                strokeLinecap="round"
            />
        </svg>
    ),
    Sales: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-9-9v9m4-9v9"
            />
        </svg>
    ),
    Inventory: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
        </svg>
    ),
    Customers: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    ),
    Library: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.008v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.008v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.008v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
        </svg>
    ),
    Lounge: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118l-14.752.1c-1.128.008-2.051-.9-2.051-2.02A2.083 2.083 0 013.6 16.5m16.65-2.35v-1.74a4.114 4.114 0 00-3.664-4.086l-2.09-.23c-2.396-.264-4.832-.264-7.228 0l-2.09.23A4.114 4.114 0 001.575 12.41v1.74" />
        </svg>
    ),
    Finance: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    Staff: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    ),
    Settings: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    ),
    Reports: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
        </svg>
    ),
    Bell: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
        </svg>
    ),
    ChevronDown: ({ open }) => (
        <svg
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
            />
        </svg>
    ),
    CollapseLeft: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
        </svg>
    ),
    CollapseRight: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
        </svg>
    ),
    Suppliers: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V9.75M19.5 18.75h-1.5m-12 0V9.75a1.5 1.5 0 011.5-1.5h6.75a1.5 1.5 0 011.5 1.5v9m0 0h-9m0 0H3.75m15.75-9h-3v-3l3 3z" />
        </svg>
    ),
    PurchaseOrders: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-13.5h-9.75a1.125 1.125 0 00-1.125 1.125v15.75c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V8.25m-9-4.5h4.5m4.5 0V8.25h-4.5V3.75z" />
        </svg>
    ),
    Promotions: () => (
        <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
        </svg>
    ),
};

/* ─────────────────────────────────────────────────
   NAVIGATION TREE
   ───────────────────────────────────────────────── */
const NAV_GROUPS = [
    {
        label: "Main",
        items: [
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <Icons.Dashboard />,
                href: "/dashboard",
            },
            {
                key: "pos",
                label: "POS Terminal",
                icon: <Icons.Sales />, // Uses the cart icon
                href: "/pos",
            },
            {
                key: "sales",
                label: "Sales & Orders",
                icon: <Icons.Reports />, // Uses the chart icon for historical data
                href: "/sales",
            },
        ],
    },
    {
        label: "Management",
        items: [
            {
                key: "products",
                label: "Products",
                icon: <Icons.Inventory />,
                href: "/products",
            },
            {
                key: "promotions",
                label: "Promotions",
                icon: <Icons.Promotions />,
                href: "/promotions",
            },
            {
                key: "suppliers",
                label: "Suppliers",
                icon: <Icons.Suppliers />,
                href: "/suppliers",
            },
            {
                key: "purchase-orders",
                label: "Purchase Orders",
                icon: <Icons.PurchaseOrders />,
                href: "/purchase-orders",
            },
            {
                key: "customers",
                label: "Customers",
                icon: <Icons.Customers />,
                href: "/customers",
            },
            {
                key: "library",
                label: "Library",
                icon: <Icons.Library />,
                href: "/library",
                hidden: true, // Hidden for this client — do not remove
            },
            {
                key: 'lounge',
                label: 'Lounge Manager',
                icon: <Icons.Lounge />,
                href: '/lounge',
                hidden: true, // Hidden for this client — do not remove
            },
            {
                key: "staff",
                label: "Staff Management",
                icon: <Icons.Staff />,
                href: "/staff",
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                key: "reports",
                label: "Analytics",
                icon: <Icons.Reports />,
                href: "/reports",
            },
            {
                key: "settings",
                label: "Settings",
                icon: <Icons.Settings />,
                href: "/settings",
            },
        ],
    },
];

/* ─────────────────────────────────────────────────
   PERMISSION MAP — which permission(s) each nav item needs
   ───────────────────────────────────────────────── */
const PERMISSION_MAP = {
    dashboard: 'view_dashboard',
    pos:       'access_pos',
    sales:     'view_sales',
    products:  'view_products',
    suppliers: 'view_suppliers',
    'purchase-orders': 'view_purchase_orders',
    customers: 'view_customers',
    lounge:    'access_lounge',
    staff:     'view_employees',
    reports:   'view_reports',
    settings:  'view_settings',
    // library has no permission — visible to all
};

const ROLE_BADGES = {
    admin:          { label: 'Admin',          color: 'bg-red-500/20 text-red-300' },
    manager:        { label: 'Manager',        color: 'bg-indigo-500/20 text-indigo-300' },
    cashier:        { label: 'Cashier',        color: 'bg-emerald-500/20 text-emerald-300' },
    lounge_manager: { label: 'Lounge Mgr',     color: 'bg-amber-500/20 text-amber-300' },
    inventory:      { label: 'Inventory',      color: 'bg-sky-500/20 text-sky-300' },
};

/* ─────────────────────────────────────────────────
   SIDEBAR SUB-ITEM
   ───────────────────────────────────────────────── */
const SubItem = ({ item, activeKey, onClick, collapsed }) => {
    const isActive = activeKey === item.key;
    return (
        <div
            className={`sidebar-submenu-item ${isActive ? "active" : ""}`}
            onClick={() => onClick(item.key, item.href)}
            title={collapsed ? item.label : undefined}
        >
            <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                    background: isActive ? "#f47b20" : "rgba(236,241,255,0.35)",
                }}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   SIDEBAR MENU ITEM (with optional collapsible sub-menu)
   ───────────────────────────────────────────────── */
const NavItem = ({
    item,
    activeKey,
    expandedKey,
    onNavigate,
    onToggle,
    collapsed,
}) => {
    const hasChildren = item.children?.length > 0;
    const isExpanded = expandedKey === item.key;
    const isActive =
        activeKey === item.key ||
        item.children?.some((c) => c.key === activeKey);

    return (
        <div>
            <div
                className={`sidebar-item ${isActive && !hasChildren ? "active" : ""}`}
                onClick={() => {
                    if (hasChildren) {
                        onToggle(item.key);
                    } else {
                        onNavigate(item.key, item.href);
                    }
                }}
                title={collapsed ? item.label : undefined}
            >
                <span className="sidebar-item-icon">{item.icon}</span>

                {!collapsed && (
                    <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {hasChildren && <Icons.ChevronDown open={isExpanded} />}
                    </>
                )}
            </div>

            {/* Sub-menu */}
            {hasChildren && isExpanded && !collapsed && (
                <div className="sidebar-submenu mt-1 mb-1">
                    {item.children.map((child) => (
                        <SubItem
                            key={child.key}
                            item={child}
                            activeKey={activeKey}
                            onClick={onNavigate}
                            collapsed={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   SIDEBAR COMPONENT
   ───────────────────────────────────────────────── */

/**
 * Sidebar - Full POS navigation sidebar.
 *
 * @param {string}   activeKey    - Key of the currently active menu item
 * @param {function} onNavigate   - Called with (key, href) when item clicked
 * @param {boolean}  collapsed    - Controlled collapsed state
 * @param {function} onToggleCollapse - Toggle sidebar width
 * @param {boolean}  mobileOpen   - Whether the mobile overlay is open
 * @param {function} onMobileClose
 * @returns {JSX.Element}
 */
const Sidebar = ({
    activeKey = "dashboard",
    onNavigate,
    collapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onMobileClose,
    store,
}) => {
    const [expandedKey, setExpandedKey] = useState(null);
    const { permissions = [], userRole } = usePage().props;

    const isAdmin = userRole === 'admin';

    // Filter nav items based on permissions
    const filteredGroups = NAV_GROUPS.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (item.hidden) return false;  // Explicitly hidden items
            const requiredPerm = PERMISSION_MAP[item.key];
            if (!requiredPerm) return true; // No permission required = always visible
            if (isAdmin) return true;       // Admin sees everything
            return permissions.includes(requiredPerm);
        }),
    })).filter(group => group.items.length > 0);

    const roleBadge = ROLE_BADGES[userRole];

    const handleToggle = (key) => {
        setExpandedKey((prev) => (prev === key ? null : key));
    };

    const handleNavigate = (key, href) => {
        onNavigate?.(key, href);
        onMobileClose?.();
    };

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`sidebar z-50
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static top-0 left-0
        `}
                aria-label="Main navigation"
            >
                {/* Logo */}
                <div className="sidebar-logo flex-shrink-0">
                    {store?.logo_path ? (
                        <img
                            src={`/storage/${store.logo_path}`}
                            alt={store.shop_name || 'Store'}
                            className="w-9 h-9 rounded-lg object-contain flex-shrink-0 bg-white"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    {/* Fallback icon — shown when no logo or image fails */}
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                            backgroundColor: store?.brand_color || '#f47b20',
                            display: store?.logo_path ? 'none' : 'flex',
                        }}
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                            />
                        </svg>
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="sidebar-logo-text">{store?.shop_name || 'Pulse POS'}</p>
                            <p className="sidebar-logo-sub">Admin Terminal</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin">
                    {filteredGroups.map((group) => (
                        <div key={group.label} className="sidebar-section">
                            <span className="sidebar-section-label">
                                <span
                                    className={`transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}
                                >
                                    {group.label}
                                </span>
                            </span>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <NavItem
                                        key={item.key}
                                        item={item}
                                        activeKey={activeKey}
                                        expandedKey={expandedKey}
                                        onNavigate={handleNavigate}
                                        onToggle={handleToggle}
                                        collapsed={collapsed}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Role badge */}
                {roleBadge && !collapsed && (
                    <div className="flex-shrink-0 px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${roleBadge.color}`}>
                            {roleBadge.label}
                        </span>
                    </div>
                )}

                {/* Collapse toggle (desktop only) */}
                <div className="flex-shrink-0 p-3 border-t border-white/10">
                    <button
                        className="sidebar-item w-full justify-center"
                        onClick={onToggleCollapse}
                        title={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                    >
                        {collapsed ? (
                            <Icons.CollapseRight />
                        ) : (
                            <Icons.CollapseLeft />
                        )}
                        {!collapsed && (
                            <span className="text-xs">Collapse</span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
