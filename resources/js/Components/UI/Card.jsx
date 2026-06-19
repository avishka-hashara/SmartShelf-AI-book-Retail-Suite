import React from 'react';

/**
 * Card - Generic content container with optional header and footer.
 *
 * @param {string}    title      - Card header title text
 * @param {ReactNode} action     - Element displayed in the top-right of the header
 * @param {ReactNode} footer     - Footer content
 * @param {boolean}   noPadding  - Removes padding from body (useful for tables)
 * @param {string}    className  - Additional root classes
 * @param {ReactNode} children   - Card body content
 * @returns {JSX.Element}
 */
const Card = ({
    title,
    action,
    footer,
    noPadding = false,
    className = '',
    children,
}) => {
    return (
        <div className={`card ${className}`}>
            {/* Header – rendered only when title or action provided */}
            {(title || action) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {action && <div className="flex items-center gap-2">{action}</div>}
                </div>
            )}

            {/* Body */}
            <div className={noPadding ? '' : 'card-body'}>
                {children}
            </div>

            {/* Footer */}
            {footer && <div className="card-footer">{footer}</div>}
        </div>
    );
};

export default Card;
