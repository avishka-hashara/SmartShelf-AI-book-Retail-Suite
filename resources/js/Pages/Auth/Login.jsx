import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, BookOpen, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="relative min-h-screen bg-[#060504] flex items-center justify-center px-4 overflow-hidden">
            <Head title="Sign In — BookFlow POS" />

            {/* ── Bookshelf background ── */}
            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(4px) brightness(0.15) saturate(0.6)',
                    transform: 'scale(1.06)',
                }}
            />

            {/* ── Amber vignette ── */}
            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden
                style={{
                    background: 'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.1) 0%, rgba(6,5,4,0.6) 60%, rgba(6,5,4,0.92) 100%)',
                }}
            />

            {/* ── Card ── */}
            <div className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <Link href={route('welcome')} className="flex items-center gap-2.5 group">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                boxShadow: '0 6px 20px rgba(245,158,11,0.3)',
                            }}
                        >
                            <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-base font-bold tracking-tight text-white/80 group-hover:text-white transition-colors duration-200">
                            BookFlow POS
                        </span>
                    </Link>
                </div>

                {/* Form card */}
                <div
                    className="rounded-2xl border border-white/8 px-8 py-9"
                    style={{ background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(24px)' }}
                >
                    {/* Heading */}
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-black tracking-tight text-white">Welcome back</h1>
                        <p className="mt-1.5 text-sm text-white/35">Sign in to your BookFlow dashboard</p>
                    </div>

                    {status && (
                        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-amber-500/40 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/25"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1.5 text-xs text-red-400" />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs font-semibold text-white/40 uppercase tracking-widest">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs font-medium text-amber-400/70 hover:text-amber-400 transition-colors duration-200"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-white/8 bg-white/5 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-amber-500/40 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/25"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors duration-200 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1.5 text-xs text-red-400" />
                        </div>

                        {/* Remember + secure */}
                        <div className="flex items-center justify-between pt-1">
                            <label htmlFor="remember" className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-xs text-white/35">Keep me signed in</span>
                            </label>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Secure access</span>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="group w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 mt-2 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#060504]"
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
                            }}
                        >
                            <span>{processing ? 'Signing in…' : 'Sign in'}</span>
                            {!processing && (
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                            )}
                        </button>
                    </form>
                </div>

                {/* Back link */}
                <p className="mt-6 text-center text-[11px] text-white/20">
                    <Link href={route('welcome')} className="hover:text-white/40 transition-colors duration-200">
                        ← Back to BookFlow POS
                    </Link>
                </p>
            </div>
        </div>
    );
}
