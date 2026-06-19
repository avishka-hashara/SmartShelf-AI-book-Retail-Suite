import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, MailCheck } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:bg-none dark:bg-[#0B1229] flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Email Verification" />

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
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Lumina Books</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 tracking-wide mt-0.5">POS System</p>
                </div>

                {/* Mail badge */}
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
                        <MailCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                {/* Heading */}
                <div className="text-center mb-5">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Check your email</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Thanks for signing up! Before getting started, please verify your email address by clicking the link we just sent you.
                    </p>
                </div>

                {/* Resent status */}
                {status === 'verification-link-sent' && (
                    <div className="mb-5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-3 rounded-lg text-center">
                        A new verification link has been sent to your email address.
                    </div>
                )}

                {/* Actions */}
                <form onSubmit={submit} className="space-y-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn-primary w-full"
                    >
                        {processing ? 'Sending...' : 'Resend Verification Email'}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-center block"
                    >
                        Log Out
                    </Link>
                </form>
            </div>
        </div>
    );
}
