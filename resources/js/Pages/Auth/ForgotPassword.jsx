import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, BookOpen } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import InputError from '@/Components/InputError';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:bg-none dark:bg-[#0B1229] flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Forgot Password" />

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
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Forgot Password?</h2>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        No problem. Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {/* Status message */}
                {status && (
                    <div className="mb-5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-3 rounded-lg text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
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
                                placeholder="jane@example.com"
                                value={data.email}
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="form-input pl-9"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {processing ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 text-center">
                    <Link href={route('login')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
