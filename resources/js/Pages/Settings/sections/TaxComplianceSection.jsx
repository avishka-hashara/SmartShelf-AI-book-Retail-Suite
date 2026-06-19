import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import ToggleSwitch from '../components/ToggleSwitch';
import SaveButton from '../components/SaveButton';
import { DollarSign, ClipboardList } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

/* ─────────────────────────────────────────────────
   ROUNDING RULES
   ───────────────────────────────────────────────── */
const ROUNDING_RULES = [
    { value: '1',  label: 'No rounding (nearest 1 Rs.)' },
    { value: '5',  label: 'Round to nearest 5 Rs.' },
    { value: '10', label: 'Round to nearest 10 Rs.' },
];

/* ─────────────────────────────────────────────────
   TAX & COMPLIANCE SECTION
   ───────────────────────────────────────────────── */
const TaxComplianceSection = ({ settings, onDirtyChange }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors, isDirty } = useForm({
        tax_mode:              settings?.tax_mode ?? 'inclusive',
        default_tax_rate:      settings?.default_tax_rate?.toString() ?? '0',
        books_tax_rate:        settings?.books_tax_rate?.toString() ?? '0',
        stationery_tax_rate:   settings?.stationery_tax_rate?.toString() ?? '8',
        rounding_rule:         settings?.rounding_rule ?? '1',
        receipt_show_tin:      settings?.receipt_show_tin ?? true,
    });

    useEffect(() => { onDirtyChange?.('tax', isDirty); }, [isDirty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleConfirmedSubmit = () => {
        setShowConfirm(false);
        post(route('settings.update.section', 'tax'), { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Confirmation dialog for tax changes */}
            <ConfirmDialog
                open={showConfirm}
                title="Apply Tax Changes?"
                message="Changing tax settings will affect all future transactions and receipt calculations. Existing orders will not be affected. Are you sure you want to proceed?"
                confirmLabel="Yes, Save Tax Settings"
                cancelLabel="Cancel"
                onConfirm={handleConfirmedSubmit}
                onCancel={() => setShowConfirm(false)}
            />

            {/* ── Tax Mode ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Tax Mode</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Choose how prices are displayed and calculated</p>
                </div>
                <div className="p-5">
                    <div className="flex gap-3">
                        {['inclusive', 'exclusive'].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setData('tax_mode', mode)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold text-center transition-all
                                    ${data.tax_mode === mode
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                            >
                                {mode === 'inclusive'
                                    ? <><DollarSign className="w-4 h-4 inline -mt-0.5 mr-1" />Tax Inclusive</>
                                    : <><ClipboardList className="w-4 h-4 inline -mt-0.5 mr-1" />Tax Exclusive</>}
                                <p className="text-[11px] font-normal mt-1 text-slate-400">
                                    {mode === 'inclusive'
                                        ? 'Prices shown already include tax'
                                        : 'Tax is added on top of displayed price'}
                                </p>
                            </button>
                        ))}
                    </div>
                    <InputError message={errors.tax_mode} className="mt-1" />
                </div>
            </div>

            {/* ── Tax Rates ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Tax Rates</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure rates per product category</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        <div className="form-group">
                            <label className="form-label">Default Tax Rate (%)</label>
                            <input type="number" min="0" max="100" step="0.01" className={`form-input ${errors.default_tax_rate ? 'border-red-400' : ''}`} placeholder="0" value={data.default_tax_rate} onChange={(e) => setData('default_tax_rate', e.target.value)} />
                            <InputError message={errors.default_tax_rate} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Books / Educational (%)</label>
                            <input type="number" min="0" max="100" step="0.01" className={`form-input ${errors.books_tax_rate ? 'border-red-400' : ''}`} placeholder="0" value={data.books_tax_rate} onChange={(e) => setData('books_tax_rate', e.target.value)} />
                            <p className="text-[11px] text-slate-400 mt-1">0% by default in Sri Lanka</p>
                            <InputError message={errors.books_tax_rate} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Stationery / Gifts (%)</label>
                            <input type="number" min="0" max="100" step="0.01" className={`form-input ${errors.stationery_tax_rate ? 'border-red-400' : ''}`} placeholder="8" value={data.stationery_tax_rate} onChange={(e) => setData('stationery_tax_rate', e.target.value)} />
                            <InputError message={errors.stationery_tax_rate} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Rounding & Display ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Rounding & Display</h3>
                    <p className="text-xs text-slate-400 mt-0.5">How totals are rounded and what appears on receipts</p>
                </div>
                <div className="p-5 space-y-4">

                    <div className="form-group max-w-sm">
                        <label className="form-label">Rounding Rule</label>
                        <select className={`form-input ${errors.rounding_rule ? 'border-red-400' : ''}`} value={data.rounding_rule} onChange={(e) => setData('rounding_rule', e.target.value)}>
                            {ROUNDING_RULES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <InputError message={errors.rounding_rule} className="mt-1" />
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                        <ToggleSwitch
                            label="Show TIN on receipt"
                            description="Print your Tax Identification Number on every receipt"
                            enabled={data.receipt_show_tin}
                            onChange={(v) => setData('receipt_show_tin', v)}
                        />
                        <InputError message={errors.receipt_show_tin} className="mt-1" />
                    </div>

                </div>
            </div>

            <SaveButton processing={processing} label="Save Tax Settings" />
        </form>
    );
};

export default TaxComplianceSection;
