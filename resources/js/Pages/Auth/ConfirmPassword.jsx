import { Head, useForm } from '@inertiajs/react';
import { Lock, Eye, EyeOff, BookOpen, ShieldCheck } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:bg-none dark:bg-[#0B1229] flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Confirm Password" />

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

                {/* Shield badge */}
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                        <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Secure Area</h2>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        Please confirm your password to continue.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
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
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="form-input pl-9 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {processing ? 'Confirming...' : 'Confirm'}
                    </button>
                </form>
            </div>
        </div>
    );
}
