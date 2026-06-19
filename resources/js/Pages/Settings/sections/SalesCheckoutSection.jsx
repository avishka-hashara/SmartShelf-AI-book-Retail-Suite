import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import ToggleSwitch from '../components/ToggleSwitch';
import SaveButton from '../components/SaveButton';

/* ─────────────────────────────────────────────────
   REFUND METHOD OPTIONS
   ───────────────────────────────────────────────── */
const REFUND_METHODS = [
    { value: 'cash',            label: 'Cash' },
    { value: 'same_as_payment', label: 'Same as Original Payment' },
    { value: 'store_credit',    label: 'Store Credit' },
];

/* ─────────────────────────────────────────────────
   SALES & CHECKOUT SECTION
   ───────────────────────────────────────────────── */
const SalesCheckoutSection = ({ settings, onDirtyChange }) => {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        /* Payment Methods */
        pay_cash:                   settings?.pay_cash ?? true,
        pay_card:                   settings?.pay_card ?? true,
        pay_frimi:                  settings?.pay_frimi ?? false,
        pay_ezcash:                 settings?.pay_ezcash ?? false,
        pay_gift_card:              settings?.pay_gift_card ?? false,
        pay_store_credit:           settings?.pay_store_credit ?? false,
        allow_split_payment:        settings?.allow_split_payment ?? false,

        /* Discount Settings */
        allow_cashier_discount:     settings?.allow_cashier_discount ?? false,
        max_cashier_discount:       settings?.max_cashier_discount?.toString() ?? '10',
        only_manager_exceed:        settings?.only_manager_exceed ?? true,
        allow_promo_codes:          settings?.allow_promo_codes ?? false,

        /* Checkout Behaviour */
        ask_customer_name:          settings?.ask_customer_name ?? false,
        require_customer_profile:   settings?.require_customer_profile ?? false,
        allow_manual_entry:         settings?.allow_manual_entry ?? true,
        show_order_summary:         settings?.show_order_summary ?? true,
        allow_hold_sale:            settings?.allow_hold_sale ?? true,

        /* Returns & Refunds */
        allow_returns:              settings?.allow_returns ?? true,
        return_window_days:         settings?.return_window_days?.toString() ?? '7',
        require_return_reason:      settings?.require_return_reason ?? true,
        refund_method:              settings?.refund_method ?? 'same_as_payment',
        only_manager_refund:        settings?.only_manager_refund ?? true,

        /* Receipt Delivery */
        auto_print_receipt:         settings?.auto_print_receipt ?? true,
        send_email_receipt:         settings?.send_email_receipt ?? false,
        send_whatsapp_receipt:      settings?.send_whatsapp_receipt ?? false,

        /* Offline Mode */
        enable_offline:             settings?.enable_offline ?? false,
        max_offline_transactions:   settings?.max_offline_transactions?.toString() ?? '50',
        auto_sync_online:           settings?.auto_sync_online ?? true,
    });

    useEffect(() => { onDirtyChange?.('sales-checkout', isDirty); }, [isDirty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update.section', 'sales'), { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Payment Methods ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Payment Methods</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Choose which payment options are available at checkout</p>
                </div>
                <div className="p-5">
                    <div className="divide-y divide-slate-100">
                        <ToggleSwitch
                            label="Cash"
                            description="Accept cash payments at the register"
                            enabled={data.pay_cash}
                            onChange={(v) => setData('pay_cash', v)}
                        />
                        <ToggleSwitch
                            label="Credit / Debit Card"
                            description="Accept Visa, Mastercard and other card payments"
                            enabled={data.pay_card}
                            onChange={(v) => setData('pay_card', v)}
                        />
                        <ToggleSwitch
                            label="FriMi"
                            description="Accept FriMi digital wallet payments"
                            enabled={data.pay_frimi}
                            onChange={(v) => setData('pay_frimi', v)}
                        />
                        <ToggleSwitch
                            label="eZ Cash"
                            description="Accept Dialog eZ Cash mobile payments"
                            enabled={data.pay_ezcash}
                            onChange={(v) => setData('pay_ezcash', v)}
                        />
                        <ToggleSwitch
                            label="Gift Card"
                            description="Allow customers to pay with store gift cards"
                            enabled={data.pay_gift_card}
                            onChange={(v) => setData('pay_gift_card', v)}
                        />
                        <ToggleSwitch
                            label="Store Credit"
                            description="Allow customers to pay using their store credit balance"
                            enabled={data.pay_store_credit}
                            onChange={(v) => setData('pay_store_credit', v)}
                        />
                    </div>
                    <div className="border-t border-slate-100 mt-1">
                        <ToggleSwitch
                            label="Allow split payments"
                            description="Customers can pay using multiple methods in a single transaction"
                            enabled={data.allow_split_payment}
                            onChange={(v) => setData('allow_split_payment', v)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Discount Settings ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Discount Settings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control who can apply discounts and how much</p>
                </div>
                <div className="p-5 space-y-4">
                    <div className="divide-y divide-slate-100">
                        <ToggleSwitch
                            label="Allow cashier manual discounts"
                            description="Cashiers can apply ad-hoc discounts at the POS"
                            enabled={data.allow_cashier_discount}
                            onChange={(v) => setData('allow_cashier_discount', v)}
                        />
                    </div>

                    {data.allow_cashier_discount && (
                        <div className="pl-0 sm:pl-4 pt-2 border-t border-slate-100 space-y-4">
                            <div className="form-group max-w-xs">
                                <label className="form-label">Maximum Cashier Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className={`form-input ${errors.max_cashier_discount ? 'border-red-400' : ''}`}
                                    placeholder="10"
                                    value={data.max_cashier_discount}
                                    onChange={(e) => setData('max_cashier_discount', e.target.value)}
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Cashiers cannot exceed this percentage without manager override</p>
                                <InputError message={errors.max_cashier_discount} className="mt-1" />
                            </div>

                            <ToggleSwitch
                                label="Only manager can exceed limit"
                                description="Require manager approval for discounts above the maximum"
                                enabled={data.only_manager_exceed}
                                onChange={(v) => setData('only_manager_exceed', v)}
                            />
                        </div>
                    )}

                    <div className="border-t border-slate-100">
                        <ToggleSwitch
                            label="Allow promo / coupon codes"
                            description="Customers can enter promotional codes at checkout"
                            enabled={data.allow_promo_codes}
                            onChange={(v) => setData('allow_promo_codes', v)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Checkout Behaviour ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Checkout Behaviour</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customise what happens during the checkout flow</p>
                </div>
                <div className="p-5">
                    <div className="divide-y divide-slate-100">
                        <ToggleSwitch
                            label="Ask for customer name at checkout"
                            description="Prompt cashier to enter or select a customer before completing the sale"
                            enabled={data.ask_customer_name}
                            onChange={(v) => setData('ask_customer_name', v)}
                        />
                        <ToggleSwitch
                            label="Require customer profile"
                            description="A customer profile must be linked before the sale can be completed"
                            enabled={data.require_customer_profile}
                            onChange={(v) => setData('require_customer_profile', v)}
                        />
                        <ToggleSwitch
                            label="Allow manual product entry"
                            description="Cashiers can type in a product name or price without scanning"
                            enabled={data.allow_manual_entry}
                            onChange={(v) => setData('allow_manual_entry', v)}
                        />
                        <ToggleSwitch
                            label="Show order summary before confirming"
                            description="Display a review screen with all items before processing payment"
                            enabled={data.show_order_summary}
                            onChange={(v) => setData('show_order_summary', v)}
                        />
                        <ToggleSwitch
                            label="Allow hold / park sale"
                            description="Cashiers can save an in-progress sale and resume it later"
                            enabled={data.allow_hold_sale}
                            onChange={(v) => setData('allow_hold_sale', v)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Returns & Refunds ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Returns & Refunds</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure your store's return and refund policies</p>
                </div>
                <div className="p-5 space-y-4">
                    <ToggleSwitch
                        label="Allow returns"
                        description="Enable the return workflow in the POS"
                        enabled={data.allow_returns}
                        onChange={(v) => setData('allow_returns', v)}
                    />

                    {data.allow_returns && (
                        <div className="pt-2 border-t border-slate-100 space-y-4">
                            <div className="form-group max-w-xs">
                                <label className="form-label">Return Window (days)</label>
                                <select
                                    className={`form-input ${errors.return_window_days ? 'border-red-400' : ''}`}
                                    value={data.return_window_days}
                                    onChange={(e) => setData('return_window_days', e.target.value)}
                                >
                                    <option value="7">7 days</option>
                                    <option value="14">14 days</option>
                                    <option value="30">30 days</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">Customers can return items within this period</p>
                                <InputError message={errors.return_window_days} className="mt-1" />
                            </div>

                            <ToggleSwitch
                                label="Require return reason"
                                description="Cashier must select a reason when processing a return"
                                enabled={data.require_return_reason}
                                onChange={(v) => setData('require_return_reason', v)}
                            />

                            <div className="form-group max-w-sm">
                                <label className="form-label">Default Refund Method</label>
                                <select
                                    className={`form-input ${errors.refund_method ? 'border-red-400' : ''}`}
                                    value={data.refund_method}
                                    onChange={(e) => setData('refund_method', e.target.value)}
                                >
                                    {REFUND_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.refund_method} className="mt-1" />
                            </div>

                            <ToggleSwitch
                                label="Only manager can process refunds"
                                description="Require manager privileges to approve any refund"
                                enabled={data.only_manager_refund}
                                onChange={(v) => setData('only_manager_refund', v)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Receipt Delivery ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Receipt Delivery</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Choose how receipts are sent to customers after checkout</p>
                </div>
                <div className="p-5">
                    <div className="divide-y divide-slate-100">
                        <ToggleSwitch
                            label="Auto-print receipt"
                            description="Automatically print a receipt after every completed sale"
                            enabled={data.auto_print_receipt}
                            onChange={(v) => setData('auto_print_receipt', v)}
                        />
                        <ToggleSwitch
                            label="Send email receipt"
                            description="Email a digital receipt to the customer (if email is on file)"
                            enabled={data.send_email_receipt}
                            onChange={(v) => setData('send_email_receipt', v)}
                        />
                        <ToggleSwitch
                            label="Send WhatsApp receipt"
                            description="Send a receipt via WhatsApp (if phone number is on file)"
                            enabled={data.send_whatsapp_receipt}
                            onChange={(v) => setData('send_whatsapp_receipt', v)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Offline Mode ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Offline Mode</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Keep the POS running when your internet goes down</p>
                </div>
                <div className="p-5 space-y-4">
                    <ToggleSwitch
                        label="Enable offline mode"
                        description="Allow the POS terminal to accept sales without an internet connection"
                        enabled={data.enable_offline}
                        onChange={(v) => setData('enable_offline', v)}
                    />

                    {data.enable_offline && (
                        <div className="pt-2 border-t border-slate-100 space-y-4">
                            <div className="form-group max-w-xs">
                                <label className="form-label">Maximum Offline Transactions</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    step="1"
                                    className={`form-input ${errors.max_offline_transactions ? 'border-red-400' : ''}`}
                                    placeholder="50"
                                    value={data.max_offline_transactions}
                                    onChange={(e) => setData('max_offline_transactions', e.target.value)}
                                />
                                <p className="text-[11px] text-slate-400 mt-1">POS will stop accepting sales after this limit until synced</p>
                                <InputError message={errors.max_offline_transactions} className="mt-1" />
                            </div>

                            <ToggleSwitch
                                label="Auto-sync when back online"
                                description="Automatically upload all offline transactions once connectivity is restored"
                                enabled={data.auto_sync_online}
                                onChange={(v) => setData('auto_sync_online', v)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <SaveButton processing={processing} label="Save Sales & Checkout Settings" />
        </form>
    );
};

export default SalesCheckoutSection;
