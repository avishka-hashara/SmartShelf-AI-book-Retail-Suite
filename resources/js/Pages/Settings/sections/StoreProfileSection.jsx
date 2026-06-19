import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { Store } from 'lucide-react';

/* ─────────────────────────────────────────────────
   CURRENCY & TIMEZONE OPTIONS
   ───────────────────────────────────────────────── */
const CURRENCIES = [
    { value: 'LKR', label: 'LKR — Sri Lankan Rupee' },
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'INR', label: 'INR — Indian Rupee' },
    { value: 'AUD', label: 'AUD — Australian Dollar' },
    { value: 'CAD', label: 'CAD — Canadian Dollar' },
    { value: 'SGD', label: 'SGD — Singapore Dollar' },
    { value: 'AED', label: 'AED — UAE Dirham' },
    { value: 'JPY', label: 'JPY — Japanese Yen' },
];

const TIMEZONES = [
    { value: 'Asia/Colombo',    label: 'Asia/Colombo (GMT+5:30)' },
    { value: 'Asia/Kolkata',    label: 'Asia/Kolkata (GMT+5:30)' },
    { value: 'Asia/Dubai',      label: 'Asia/Dubai (GMT+4)' },
    { value: 'Asia/Singapore',  label: 'Asia/Singapore (GMT+8)' },
    { value: 'Asia/Tokyo',      label: 'Asia/Tokyo (GMT+9)' },
    { value: 'Europe/London',   label: 'Europe/London (GMT+0)' },
    { value: 'Europe/Berlin',   label: 'Europe/Berlin (GMT+1)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'America/Chicago', label: 'America/Chicago (GMT-6)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+11)' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (GMT+13)' },
];

/* ─────────────────────────────────────────────────
   STORE PROFILE SECTION
   ───────────────────────────────────────────────── */
const StoreProfileSection = ({ settings, showToast, onDirtyChange }) => {
    const fileRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(
        settings?.logo_path ? `/storage/${settings.logo_path}` : null
    );

    const { data, setData, post, processing, errors, isDirty } = useForm({
        shop_name:           settings?.shop_name ?? '',
        tagline:             settings?.tagline ?? '',
        business_reg_number: settings?.business_reg_number ?? '',
        tax_id:              settings?.tax_id ?? '',
        address_line1:       settings?.address_line1 ?? '',
        address_line2:       settings?.address_line2 ?? '',
        city:                settings?.city ?? '',
        postal_code:         settings?.postal_code ?? '',
        phone:               settings?.phone ?? '',
        email:               settings?.email ?? '',
        website:             settings?.website ?? '',
        facebook:            settings?.facebook ?? '',
        instagram:           settings?.instagram ?? '',
        whatsapp:            settings?.whatsapp ?? '',
        brand_color:         settings?.brand_color ?? '#4F46E5',
        currency:            settings?.currency ?? 'LKR',
        timezone:            settings?.timezone ?? 'Asia/Colombo',
        logo:                null,
    });

    useEffect(() => { onDirtyChange?.('store-profile', isDirty); }, [isDirty]);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoPreview(URL.createObjectURL(file));
        setData('logo', file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update.section', 'profile'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Logo Upload ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Store Branding</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upload your store logo and set your brand colour</p>
                </div>
                <div className="p-5 space-y-5">

                    {/* Logo */}
                    <div>
                        <label className="form-label mb-1.5 block">Store Logo</label>
                        <div
                            className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                            onClick={() => fileRef.current?.click()}
                        >
                            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoChange} />
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-contain border border-slate-200 bg-white flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                                    <Store className="w-7 h-7 text-indigo-400" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-slate-600">{logoPreview ? 'Click to change logo' : 'Click to upload logo'}</p>
                                <p className="text-xs text-slate-400">PNG, JPG, WEBP or SVG — up to 5 MB</p>
                            </div>
                            {logoPreview && (
                                <button
                                    type="button"
                                    className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium"
                                    onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setData('logo', null); }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <InputError message={errors.logo} className="mt-1" />
                    </div>

                    {/* Brand Color */}
                    <div className="form-group max-w-xs">
                        <label className="form-label">Brand Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={data.brand_color}
                                onChange={(e) => setData('brand_color', e.target.value)}
                                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                            />
                            <input
                                type="text"
                                className="form-input flex-1"
                                value={data.brand_color}
                                onChange={(e) => setData('brand_color', e.target.value)}
                                placeholder="#4F46E5"
                            />
                        </div>
                        <InputError message={errors.brand_color} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* ── Shop Details ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Shop Details</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Basic information about your bookshop</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Shop Name */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Shop Name <span className="text-red-500">*</span></label>
                            <input className={`form-input ${errors.shop_name ? 'border-red-400' : ''}`} placeholder="e.g. Lumina Books" value={data.shop_name} onChange={(e) => setData('shop_name', e.target.value)} />
                            <InputError message={errors.shop_name} className="mt-1" />
                        </div>

                        {/* Tagline */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Tagline</label>
                            <input className={`form-input ${errors.tagline ? 'border-red-400' : ''}`} placeholder="e.g. Your favourite neighbourhood bookshop" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} />
                            <InputError message={errors.tagline} className="mt-1" />
                        </div>

                        {/* Business Reg Number */}
                        <div className="form-group">
                            <label className="form-label">Business Registration Number</label>
                            <input className={`form-input ${errors.business_reg_number ? 'border-red-400' : ''}`} placeholder="e.g. PV00012345" value={data.business_reg_number} onChange={(e) => setData('business_reg_number', e.target.value)} />
                            <InputError message={errors.business_reg_number} className="mt-1" />
                        </div>

                        {/* Tax ID */}
                        <div className="form-group">
                            <label className="form-label">Tax ID / VAT / TIN</label>
                            <input className={`form-input ${errors.tax_id ? 'border-red-400' : ''}`} placeholder="e.g. 123456789-7000" value={data.tax_id} onChange={(e) => setData('tax_id', e.target.value)} />
                            <InputError message={errors.tax_id} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Address ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Address</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Store physical address for receipts and invoices</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Address Line 1 */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Address Line 1</label>
                            <input className={`form-input ${errors.address_line1 ? 'border-red-400' : ''}`} placeholder="Street address" value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} />
                            <InputError message={errors.address_line1} className="mt-1" />
                        </div>

                        {/* Address Line 2 */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Address Line 2</label>
                            <input className={`form-input ${errors.address_line2 ? 'border-red-400' : ''}`} placeholder="Apartment, suite, floor…" value={data.address_line2} onChange={(e) => setData('address_line2', e.target.value)} />
                            <InputError message={errors.address_line2} className="mt-1" />
                        </div>

                        {/* City */}
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input className={`form-input ${errors.city ? 'border-red-400' : ''}`} placeholder="e.g. Colombo" value={data.city} onChange={(e) => setData('city', e.target.value)} />
                            <InputError message={errors.city} className="mt-1" />
                        </div>

                        {/* Postal Code */}
                        <div className="form-group">
                            <label className="form-label">Postal Code</label>
                            <input className={`form-input ${errors.postal_code ? 'border-red-400' : ''}`} placeholder="e.g. 00700" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                            <InputError message={errors.postal_code} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Contact ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Contact Information</h3>
                    <p className="text-xs text-slate-400 mt-0.5">How customers can reach you</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Phone */}
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className={`form-input ${errors.phone ? 'border-red-400' : ''}`} placeholder="e.g. +94 11 234 5678" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`} placeholder="e.g. hello@luminabooks.com" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Website */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">Website URL</label>
                            <input className={`form-input ${errors.website ? 'border-red-400' : ''}`} placeholder="e.g. https://luminabooks.com" value={data.website} onChange={(e) => setData('website', e.target.value)} />
                            <InputError message={errors.website} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Social Media ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Social Media</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Links shown on receipts and customer-facing pages</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Facebook */}
                        <div className="form-group">
                            <label className="form-label">Facebook</label>
                            <input className={`form-input ${errors.facebook ? 'border-red-400' : ''}`} placeholder="e.g. https://facebook.com/luminabooks" value={data.facebook} onChange={(e) => setData('facebook', e.target.value)} />
                            <InputError message={errors.facebook} className="mt-1" />
                        </div>

                        {/* Instagram */}
                        <div className="form-group">
                            <label className="form-label">Instagram</label>
                            <input className={`form-input ${errors.instagram ? 'border-red-400' : ''}`} placeholder="e.g. https://instagram.com/luminabooks" value={data.instagram} onChange={(e) => setData('instagram', e.target.value)} />
                            <InputError message={errors.instagram} className="mt-1" />
                        </div>

                        {/* WhatsApp */}
                        <div className="form-group sm:col-span-2">
                            <label className="form-label">WhatsApp</label>
                            <input className={`form-input ${errors.whatsapp ? 'border-red-400' : ''}`} placeholder="e.g. +94 77 123 4567" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                            <InputError message={errors.whatsapp} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Regional ── */}
            <div className="card">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800">Regional Settings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Currency and timezone defaults for the POS</p>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Currency */}
                        <div className="form-group">
                            <label className="form-label">Currency</label>
                            <select className={`form-input ${errors.currency ? 'border-red-400' : ''}`} value={data.currency} onChange={(e) => setData('currency', e.target.value)}>
                                {CURRENCIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.currency} className="mt-1" />
                        </div>

                        {/* Timezone */}
                        <div className="form-group">
                            <label className="form-label">Timezone</label>
                            <select className={`form-input ${errors.timezone ? 'border-red-400' : ''}`} value={data.timezone} onChange={(e) => setData('timezone', e.target.value)}>
                                {TIMEZONES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.timezone} className="mt-1" />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Submit ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={processing}>
                    {processing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Save Store Profile
                        </>
                    )}
                </button>
            </div>

        </form>
    );
};

export default StoreProfileSection;
