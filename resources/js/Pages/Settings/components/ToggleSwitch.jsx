import React from 'react';

const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">{label}</p>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0
                ${enabled ? '' : 'bg-slate-200'}`}
            style={enabled ? { background: 'linear-gradient(135deg, #f47b20 0%, #994700 100%)' } : undefined}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

export default ToggleSwitch;
