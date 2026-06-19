import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal - Accessible portal-based modal dialog.
 *
 * @param {boolean}   isOpen     - Controls visibility
 * @param {function}  onClose    - Called when closed
 * @param {string}    title      - Modal heading
 * @param {string}    size       - 'sm'|'md'|'lg'|'xl'|'full'
 * @param {ReactNode} footer     - Footer content (buttons etc.)
 * @param {ReactNode} children   - Body content
 * @returns {JSX.Element|null}
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    footer,
    children,
}) => {
    /* Lock body scroll while open */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* Escape key closes modal */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeMap = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]',
    };

    return createPortal(
        <div
            className="modal-backdrop"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div className={`modal-box w-full ${sizeMap[size] ?? 'max-w-lg'}`}>
                {/* Header */}
                {title && (
                    <div className="modal-header">
                        <h2 className="modal-title">{title}</h2>
                        <button
                            onClick={onClose}
                            className="btn-icon text-slate-400 hover:text-slate-600"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="modal-body">{children}</div>

                {/* Footer */}
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
