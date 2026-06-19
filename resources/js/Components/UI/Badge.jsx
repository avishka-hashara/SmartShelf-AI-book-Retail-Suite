import React from 'react';

/**
 * Badge - Status pill/badge for labels, statuses, counts.
 *
 * @param {string}    variant  - 'primary'|'success'|'warning'|'danger'|'info'|'gray'
 * @param {boolean}   dot      - Show a colored dot prefix
 * @param {string}    className
 * @param {ReactNode} children
 * @returns {JSX.Element}
 */
const Badge = ({
    variant = 'gray',
    dot = false,
    className = '',
    children,
}) => {
    const variantMap = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        info: 'badge-info',
        gray: 'badge-gray',
    };

    const cls = [
        variantMap[variant] ?? 'badge-gray',
        dot ? 'badge-dot' : '',
        className,
    ].filter(Boolean).join(' ');

    return <span className={cls}>{children}</span>;
};

/**
 * Helper – map a status string to a Badge variant.
 *
 * @param {string} status
 * @returns {string} variant
 */
export const statusVariant = (status) => {
    const map = {
        completed: 'success',
        paid: 'success',
        active: 'success',
        pending: 'warning',
        processing: 'info',
        returned: 'primary',
        refunded: 'primary',
        cancelled: 'danger',
        overdue: 'danger',
        inactive: 'gray',
    };
    return map[status?.toLowerCase()] ?? 'gray';
};

export default Badge;
