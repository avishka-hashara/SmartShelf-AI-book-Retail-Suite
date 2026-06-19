import { Head, useForm } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass = "form-input pl-9 pr-10";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:bg-none dark:bg-[#0B1229] flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Reset Password" />

            <div className="fixed right-5 top-5 z-20">
                <ThemeToggle compact />
            </div>

            {/* Card */}
            <div className="card w-full max-w-sm px-10 py-10">

                {/* Brand */}
                <div className="flex flex-col items-center mb-7">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Bookshop Portal</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">POS System</p>
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Enter your new password below.</p>
                </div>

                <form onSubmit={submit} className="space-y-5">

                    {/* Email (read-only) */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={data.email}
                                readOnly
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                className="form-input pl-9 cursor-default"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            New Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={data.password}
                                autoFocus
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className={inputClass}
                            />
                            <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="password_confirmation" className="form-label">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </span>
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={data.password_confirmation}
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                className={inputClass}
                            />
                            <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {processing ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
