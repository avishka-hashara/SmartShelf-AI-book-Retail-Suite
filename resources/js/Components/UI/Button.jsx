import React from 'react';

/**
 * Button - Fully reusable button with variants, sizes, icon and loading support.
 *
 * @param {string}    variant   - 'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'ghost'|'ghost-primary'
 * @param {string}    size      - 'xs'|'sm'|'md'|'lg'|'xl'
 * @param {boolean}   loading   - Shows spinner and disables button
 * @param {boolean}   disabled  - Disables button
 * @param {boolean}   iconOnly  - Square icon-only mode
 * @param {ReactNode} icon      - Leading icon element
 * @param {ReactNode} children  - Button label
 * @param {string}    className - Additional classes
 * @param {function}  onClick   - Click handler
 * @returns {JSX.Element}
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    iconOnly = false,
    icon,
    children,
    className = '',
    onClick,
    type = 'button',
    ...rest
}) => {
    /* Map variant → CSS class from app.css */
    const variantMap = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-info',
        ghost: 'btn-ghost',
        'ghost-primary': 'btn-ghost-primary',
    };

    /* Map size → CSS class from app.css */
    const sizeMap = {
        xs: 'btn-xs',
        sm: 'btn-sm',
        md: '',        /* default in .btn */
        lg: 'btn-lg',
        xl: 'btn-xl',
    };

    const baseClass = iconOnly ? 'btn-icon' : variantMap[variant] ?? 'btn-primary';

    const classes = [
        baseClass,
        sizeMap[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...rest}
        >
            {/* Loading spinner */}
            {loading && (
                <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            )}

            {/* Leading icon (hidden while loading) */}
            {!loading && icon && <span className="flex-shrink-0">{icon}</span>}

            {/* Label */}
            {children && <span>{children}</span>}
        </button>
    );
};

export default Button;
