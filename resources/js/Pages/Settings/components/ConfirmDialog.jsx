import React from 'react';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            {/* dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-up">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    <p className="text-sm text-slate-600">{message}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
                    <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
