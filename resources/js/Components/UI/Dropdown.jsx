import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown - Generic dropdown with trigger + menu.
 *
 * @param {ReactNode} trigger     - The element that opens the dropdown
 * @param {ReactNode} children    - Menu items (use <Dropdown.Item>)
 * @param {string}    align       - 'right'|'left' - alignment of the menu
 * @param {string}    className   - Additional classes on the menu
 * @returns {JSX.Element}
 */
const Dropdown = ({ trigger, children, align = 'right', className = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    /* Close when clicking outside */
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Close on Escape */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="relative inline-flex" ref={ref}>
            {/* Trigger wrapper */}
            <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
                {trigger}
            </div>

            {/* Menu */}
            {open && (
                <div
                    className={`dropdown-menu ${align === 'left' ? 'left-0 right-auto' : 'right-0'} ${className}`}
                    role="menu"
                >
                    {/* Inject close prop into items */}
                    {React.Children.map(children, (child) =>
                        child ? React.cloneElement(child, { onClose: () => setOpen(false) }) : null
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Dropdown.Item - A single clickable row in the dropdown.
 *
 * @param {ReactNode} icon      - Leading icon element
 * @param {boolean}   danger    - Red styling for destructive actions
 * @param {function}  onClick
 * @param {function}  onClose   - Injected by parent Dropdown
 * @param {ReactNode} children
 */
Dropdown.Item = ({ icon, danger = false, onClick, onClose, children }) => (
    <div
        className={`dropdown-item ${danger ? 'danger' : ''}`}
        role="menuitem"
        onClick={() => {
            onClick?.();
            onClose?.();
        }}
    >
        {icon && <span className="w-4 h-4 flex-shrink-0 opacity-70">{icon}</span>}
        {children}
    </div>
);

/**
 * Dropdown.Divider - Horizontal separator
 */
Dropdown.Divider = () => <div className="dropdown-divider" />;

export default Dropdown;
