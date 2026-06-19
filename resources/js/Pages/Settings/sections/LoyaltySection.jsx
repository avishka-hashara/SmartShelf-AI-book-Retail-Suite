import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import ToggleSwitch from '../components/ToggleSwitch';
import SaveButton from '../components/SaveButton';

/* ─────────────────────────────────────────────────
   CUSTOMERS & LOYALTY SECTION
   ───────────────────────────────────────────────── */
const LoyaltySection = ({ settings, onDirtyChange }) => {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        enable_loyalty:          settings?.enable_loyalty ?? true,
        loyalty_points_per_100:  settings?.loyalty_points_per_100?.toString() ?? '1',
        loyalty_min_redeem:      settings?.loyalty_min_redeem?.toString() ?? '100',
        student_discount:        settings?.student_discount?.toString() ?? '0',
        enable_wishlist:         settings?.enable_wishlist ?? false,
    });

    useEffect(() => { onDirtyChange?.('customers-loyalty', isDirty); }, [isDirty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update.section', 'loyalty'), { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Loyalty Programme ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Loyalty Programme</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Reward repeat customers with points</p>
                </div>
                <div className="p-5 space-y-4">

                    <ToggleSwitch
                        label="Enable loyalty programme"
                        description="Customers earn points on every purchase"
                        enabled={data.enable_loyalty}
                        onChange={(v) => setData('enable_loyalty', v)}
                    />

                    {data.enable_loyalty && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">

                            <div className="form-group">
                                <label className="form-label">Points earned per 100 LKR spent</label>
                                <input type="number" min="0" step="1" className={`form-input ${errors.loyalty_points_per_100 ? 'border-red-400' : ''}`} placeholder="1" value={data.loyalty_points_per_100} onChange={(e) => setData('loyalty_points_per_100', e.target.value)} />
                                <p className="text-[11px] text-slate-400 mt-1">e.g. 1 point = every Rs. 100 spent</p>
                                <InputError message={errors.loyalty_points_per_100} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Minimum points to redeem</label>
                                <input type="number" min="0" step="1" className={`form-input ${errors.loyalty_min_redeem ? 'border-red-400' : ''}`} placeholder="100" value={data.loyalty_min_redeem} onChange={(e) => setData('loyalty_min_redeem', e.target.value)} />
                                <p className="text-[11px] text-slate-400 mt-1">Customers need at least this many points to use them</p>
                                <InputError message={errors.loyalty_min_redeem} className="mt-1" />
                            </div>

                        </div>
                    )}

                </div>
            </div>

            {/* ── Discounts ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Special Discounts</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Auto-applied discounts for certain customer groups</p>
                </div>
                <div className="p-5">
                    <div className="form-group max-w-xs">
                        <label className="form-label">Student / Teacher Discount (%)</label>
                        <input type="number" min="0" max="100" step="0.5" className={`form-input ${errors.student_discount ? 'border-red-400' : ''}`} placeholder="0" value={data.student_discount} onChange={(e) => setData('student_discount', e.target.value)} />
                        <p className="text-[11px] text-slate-400 mt-1">Applied when a customer is tagged as Student or Teacher</p>
                        <InputError message={errors.student_discount} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* ── Features ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Customer Features</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Extra features available to customers</p>
                </div>
                <div className="p-5">
                    <ToggleSwitch
                        label="Enable wishlist / hold feature"
                        description="Allow customers to save items for later or put them on hold"
                        enabled={data.enable_wishlist}
                        onChange={(v) => setData('enable_wishlist', v)}
                    />
                </div>
            </div>

            <SaveButton processing={processing} label="Save Loyalty Settings" />
        </form>
    );
};

export default LoyaltySection;
