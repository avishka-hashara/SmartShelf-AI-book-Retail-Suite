import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import SaveButton from '../components/SaveButton';

/* ─────────────────────────────────────────────────
   INLINE TOGGLE — compact, used beside each input row
   ───────────────────────────────────────────────── */
const InlineToggle = ({ enabled, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
        title={label}
    >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
    </button>
);

/* ─────────────────────────────────────────────────
   SOCIAL ROW — icon + platform label + URL input + active toggle
   ───────────────────────────────────────────────── */
const SocialRow = ({ icon, label, placeholder, value, onChange, enabled, onToggle, error }) => (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${enabled ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {enabled ? 'Active on receipt' : 'Hidden on receipt'}
                </span>
                <InlineToggle enabled={enabled} onChange={onToggle} label={`Toggle ${label}`} />
            </div>
        </div>
        <input
            type="text"
            className={`form-input w-full text-sm ${!enabled ? 'opacity-50' : ''} ${error ? 'border-red-400' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
        <InputError message={error} className="mt-1" />
    </div>
);

/* ─────────────────────────────────────────────────
   RECEIPT SETTINGS SECTION
   ───────────────────────────────────────────────── */
const ReceiptSection = ({ settings, onDirtyChange }) => {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        receipt_header:           settings?.receipt_header         ?? '',
        receipt_footer:           settings?.receipt_footer         ?? '',
        invoice_prefix:           settings?.invoice_prefix         ?? 'INV-',
        website:                  settings?.website                ?? '',
        receipt_show_website:     settings?.receipt_show_website   ?? false,
        facebook:                 settings?.facebook               ?? '',
        receipt_show_facebook:    settings?.receipt_show_facebook  ?? false,
        instagram:                settings?.instagram              ?? '',
        receipt_show_instagram:   settings?.receipt_show_instagram ?? false,
        whatsapp:                 settings?.whatsapp               ?? '',
        receipt_show_whatsapp:    settings?.receipt_show_whatsapp  ?? false,
    });

    useEffect(() => { onDirtyChange?.('receipt', isDirty); }, [isDirty]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update.section', 'receipt'), { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Header & Footer ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Header & Footer</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Customise the text printed on every receipt</p>
                </div>
                <div className="p-5 space-y-4">
                    <div className="form-group">
                        <label className="form-label">Receipt Header Text</label>
                        <input
                            className={`form-input ${errors.receipt_header ? 'border-red-400' : ''}`}
                            placeholder="e.g. Thank you for visiting Lumina Books!"
                            value={data.receipt_header}
                            onChange={e => setData('receipt_header', e.target.value)}
                        />
                        <InputError message={errors.receipt_header} className="mt-1" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Receipt Footer Message</label>
                        <textarea
                            rows={3}
                            className={`form-input resize-none ${errors.receipt_footer ? 'border-red-400' : ''}`}
                            placeholder="e.g. Returns accepted within 7 days with receipt."
                            value={data.receipt_footer}
                            onChange={e => setData('receipt_footer', e.target.value)}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Tip: use line breaks for multiple lines on the printed receipt</p>
                        <InputError message={errors.receipt_footer} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* ── Website & Socials ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Website & Social Media</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Enter your links and toggle which ones appear on printed receipts</p>
                </div>
                <div className="p-5">
                    {/* Website */}
                    <SocialRow
                        icon={
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                        }
                        label="Website URL"
                        placeholder="https://www.yourbookshop.com"
                        value={data.website}
                        onChange={v => setData('website', v)}
                        enabled={data.receipt_show_website}
                        onToggle={v => setData('receipt_show_website', v)}
                        error={errors.website}
                    />

                    {/* Facebook */}
                    <SocialRow
                        icon={
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        }
                        label="Facebook"
                        placeholder="https://facebook.com/yourbookshop"
                        value={data.facebook}
                        onChange={v => setData('facebook', v)}
                        enabled={data.receipt_show_facebook}
                        onToggle={v => setData('receipt_show_facebook', v)}
                        error={errors.facebook}
                    />

                    {/* Instagram */}
                    <SocialRow
                        icon={
                            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                            </svg>
                        }
                        label="Instagram"
                        placeholder="@yourbookshop"
                        value={data.instagram}
                        onChange={v => setData('instagram', v)}
                        enabled={data.receipt_show_instagram}
                        onToggle={v => setData('receipt_show_instagram', v)}
                        error={errors.instagram}
                    />

                    {/* WhatsApp */}
                    <SocialRow
                        icon={
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        }
                        label="WhatsApp"
                        placeholder="+94 77 000 0000"
                        value={data.whatsapp}
                        onChange={v => setData('whatsapp', v)}
                        enabled={data.receipt_show_whatsapp}
                        onToggle={v => setData('receipt_show_whatsapp', v)}
                        error={errors.whatsapp}
                    />
                </div>
            </div>

            {/* ── Invoice Numbering ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Invoice Numbering</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Prefix used for sequential invoice numbers</p>
                </div>
                <div className="p-5">
                    <div className="form-group max-w-xs">
                        <label className="form-label">Invoice Number Prefix</label>
                        <input
                            className={`form-input ${errors.invoice_prefix ? 'border-red-400' : ''}`}
                            placeholder="e.g. INV-"
                            value={data.invoice_prefix}
                            onChange={e => setData('invoice_prefix', e.target.value)}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            Invoice numbers will look like: {data.invoice_prefix || 'INV-'}00001
                        </p>
                        <InputError message={errors.invoice_prefix} className="mt-1" />
                    </div>
                </div>
            </div>

            <SaveButton processing={processing} label="Save Receipt Settings" />
        </form>
    );
};

export default ReceiptSection;