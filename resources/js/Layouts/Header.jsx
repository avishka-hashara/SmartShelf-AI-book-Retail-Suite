import React, { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import Dropdown from '../Components/UI/Dropdown';

/* ─────────────────────────────────────────────────
   ICONS
   ───────────────────────────────────────────────── */
const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const MenuIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ProfileIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const ShoppingCartIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-9-9v9m4-9v9" />
    </svg>
);

/* ─────────────────────────────────────────────────
   NOTIFICATION PANEL (mini dropdown list)
   ───────────────────────────────────────────────── */
const NOTIF_TYPE_STYLE = {
    low_stock:                'bg-amber-500',
    out_of_stock:              'bg-red-500',
    refund:                    'bg-blue-500',
    purchase_order_received:   'bg-emerald-500',
};

/** Relative time string from a server timestamp, using the local clock as-is (no timezone conversion). */
const timeAgo = (isoString) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

const NotificationPanel = ({ notifications, onMarkAllRead, onClear }) => (
    <div className="dropdown-menu right-0 mt-2 w-80" style={{ minWidth: '320px' }}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">Notifications</span>
            <button className="text-xs text-indigo-600 hover:underline dark:text-blue-300" onClick={onMarkAllRead}>Mark all read</button>
        </div>
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {notifications.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">No notifications</div>
            )}
            {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${NOTIF_TYPE_STYLE[n.type] ?? 'bg-slate-400'} ${n.read_at ? 'opacity-40' : ''}`} />
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-100">{n.title}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(n.created_at)}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="border-t border-slate-100 px-4 py-2.5 text-center dark:border-slate-800">
            <button className="text-xs text-indigo-600 hover:underline dark:text-blue-300" onClick={onClear}>Clear</button>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────
   LIVE CLOCK COMPONENT
   ───────────────────────────────────────────────── */
const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const dateStr = date.toLocaleDateString('en-US', options);
        const timeStr = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        return `${dateStr} - ${timeStr}`;
    };

    return (
        <span className="text-xs text-slate-400">{formatTime(time)}</span>
    );
};

/* ─────────────────────────────────────────────────
   HEADER COMPONENT
   ───────────────────────────────────────────────── */

/**
 * Header - Top navigation bar with search, notifications and user profile.
 *
 * @param {function} onMenuToggle    - Toggle mobile sidebar
 * @param {object}   user            - { name, email, avatar } — current user
 * @param {function} onLogout        - Logout handler
 * @param {string}   pageTitle       - Current page title displayed in mobile view
 * @returns {JSX.Element}
 */
const Header = ({
    onMenuToggle,
    user = { name: 'Admin User', email: 'admin@productshop.com', avatar: null },
    onLogout,
    pageTitle = 'Dashboard',
    store,
}) => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const fetchNotifications = useCallback(() => {
        axios.get('/notifications')
            .then(({ data }) => {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            })
            .catch(() => {});
    }, []);

    /* Poll for new notifications in real time */
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAllRead = useCallback(() => {
        axios.post('/notifications/mark-read').then(() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
            setUnreadCount(0);
        }).catch(() => {});
    }, []);

    const handleClear = useCallback(() => {
        axios.delete('/notifications').then(() => {
            setNotifications([]);
            setUnreadCount(0);
        }).catch(() => {});
    }, []);

    /* Close notification panel on outside click; mark as viewed when opened */
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleNotifPanel = () => {
        setNotifOpen((wasOpen) => {
            const next = !wasOpen;
            if (next) {
                fetchNotifications();
                if (unreadCount > 0) handleMarkAllRead();
            }
            return next;
        });
    };

    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'AU';

    return (
        <header className="topbar" id="topbar">
            {/* Mobile hamburger */}
            <button
                className="btn-icon text-slate-500 hover:text-slate-700 lg:hidden"
                onClick={onMenuToggle}
                aria-label="Toggle navigation"
                id="mobile-menu-toggle"
            >
                <MenuIcon />
            </button>

            {/* Page title + live clock */}
            <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-slate-800 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>{pageTitle}</h1>
                <Clock />
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-2 ml-auto">

                {/* POS Terminal Quick Navigation */}
                <button
                    className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border-2 font-semibold text-sm transition-colors"
                    style={{ borderColor: '#f47b20', color: '#994700' }}
                    onClick={() => router.visit('/pos')}
                    aria-label="Open POS Terminal"
                    id="pos-terminal-button"
                >
                    <ShoppingCartIcon />
                    <span>Open POS</span>
                </button>

                {/* Mobile POS button (icon only) */}
                <button
                    className="sm:hidden btn-icon rounded-full border-2 transition-colors"
                    style={{ borderColor: '#f47b20', color: '#994700' }}
                    onClick={() => router.visit('/pos')}
                    aria-label="Open POS Terminal"
                >
                    <ShoppingCartIcon />
                </button>



                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        className="btn-icon relative text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                        onClick={toggleNotifPanel}
                        aria-label={`Notifications (${unreadCount} unread)`}
                        id="notification-bell"
                    >
                        <BellIcon />
                        {unreadCount > 0 && (
                            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>
                    {notifOpen && (
                        <NotificationPanel
                            notifications={notifications}
                            onMarkAllRead={handleMarkAllRead}
                            onClear={handleClear}
                        />
                    )}
                </div>

                {/* Divider */}
                <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

                {/* User profile dropdown */}
                <Dropdown
                    align="right"
                    trigger={
                        <button
                            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                            id="user-profile-trigger"
                            aria-label="User menu"
                        >
                            {/* Avatar */}
                            {user.avatar ? (
                                <img
                                    src={
                                        user.avatar.startsWith('http') || user.avatar.startsWith('/')
                                            ? user.avatar
                                            : `/storage/${user.avatar}`
                                    }
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                        // Fallback to initials avatar on broken image
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            {/* Initials fallback — shown if no avatar or image fails to load */}
                            {(!user.avatar) && (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#4849da' }}>
                                    {initials}
                                </div>
                            )}
                            {user.avatar && (
                                <div className="w-8 h-8 rounded-full items-center justify-center text-white text-xs font-bold flex-shrink-0 hidden" style={{ backgroundColor: '#4849da' }}>
                                    {initials}
                                </div>
                            )}
                            {/* Name — hidden on small screens */}
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-semibold leading-tight text-slate-700 dark:text-slate-100">{user.name}</p>
                                <p className="text-[11px] leading-tight text-slate-400 dark:text-slate-500">{user.email}</p>
                            </div>
                            <span className="hidden text-slate-400 dark:text-slate-500 sm:block"><ChevronDownIcon /></span>
                        </button>
                    }
                >
                    {/* Profile info header */}
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
                    </div>

                    <Dropdown.Item icon={<UserIcon />} onClick={() => router.visit(route('profile.show'))}>My Profile</Dropdown.Item>
                    {user?.role !== 'cashier' && (
                        <Dropdown.Item icon={<ProfileIcon />} onClick={() => router.visit(route('settings'))}>Settings</Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item icon={<LogoutIcon />} danger onClick={() => onLogout?.()}>
                        Sign Out
                    </Dropdown.Item>
                </Dropdown>
            </div>
        </header>
    );
};

export default Header;
