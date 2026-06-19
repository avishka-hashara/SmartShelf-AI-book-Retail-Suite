import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, User, Store, Eye, EyeOff, BookOpen } from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useState } from 'react';
import InputError from '@/Components/InputError';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'manager',
        password: '',
        password_confirmation: '',
        terms: false,
        store_id: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0B1229] flex items-center justify-center p-4 transition-colors duration-300">
            <Head title="Create Account" />

            <div className="fixed right-5 top-5 z-20">
                <ThemeToggle compact />
            </div>

            {/* Card */}
            <div className="card w-full max-w-3xl overflow-hidden flex">

                {/* ── Left panel ── */}
                <div className="w-5/12 bg-indigo-700 dark:bg-indigo-900 text-white flex flex-col p-9 relative transition-colors duration-300">

                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-tight">Lumina Books</p>
                            <p className="text-white/60 text-[10px] tracking-widest uppercase">POS System</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="mt-auto mb-auto py-12">
                        <h1 className="text-2xl font-bold leading-snug mb-4">
                            Manage your bookstore with clarity and ease.
                        </h1>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Join thousands of independent booksellers streamlining their inventory, sales, and customer relationships with Lumina.
                        </p>
                    </div>

                    {/* Trusted by */}
                    <div className="flex items-center gap-3 mt-auto">
                        <div className="flex -space-x-2">
                            {['Aria', 'Beth', 'Cara'].map((name, i) => (
                                <img
                                    key={i}
                                    src={`https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=32`}
                                    alt={name}
                                    className="w-8 h-8 rounded-full ring-2 ring-indigo-700 dark:ring-indigo-900 object-cover transition-colors duration-300"
                                />
                            ))}
                        </div>
                        <p className="text-sm text-white/80">Trusted by 500+ bookstores</p>
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="w-7/12 bg-white dark:bg-[#111827] p-10 flex flex-col justify-center transition-colors duration-300">

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create an Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Set up your store profile and start selling in minutes.</p>

                    <form onSubmit={submit} className="space-y-5">

                        {/* Row: Full Name + Store ID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    </span>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Jane Doe"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        className="form-input pl-9"
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="store_id" className="form-label">
                                    Store ID
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Store className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    </span>
                                    <input
                                        id="store_id"
                                        name="store_id"
                                        type="text"
                                        placeholder="LUM-8832"
                                        value={data.store_id}
                                        onChange={(e) => setData('store_id', e.target.value)}
                                        className="form-input pl-9"
                                    />
                                </div>
                                <InputError message={errors.store_id} className="mt-1" />
                            </div>
                        </div>

                        {/* Email */}
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
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="form-input pl-9"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Password */}
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
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                            password_confirmation: e.target.value,
                                        }))
                                    }
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
                            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Must be at least 8 characters with 1 number.</p>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-center gap-2.5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                required
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                I agree to the{' '}
                                <a href="#" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300">
                                    Privacy Policy
                                </a>
                                .
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full"
                        >
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="mt-5 text-sm text-center text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link href={route('login')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                            Sign in here
                        </Link>
                    </p>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-6">
                        <a href="#" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                            Help Center
                        </a>
                        <a href="#" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                            System Status
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
