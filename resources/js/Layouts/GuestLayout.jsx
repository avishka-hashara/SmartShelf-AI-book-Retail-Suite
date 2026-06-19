import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-100 pt-6 dark:bg-slate-950 sm:justify-center sm:pt-0">
            <div className="fixed right-5 top-5 z-20">
                <ThemeToggle compact />
            </div>
            <div>
                <Link href="/">
                    {/* Assuming ApplicationLogo might need some styling class */}
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <ApplicationLogo className="h-12 w-12 fill-current text-indigo-600 dark:text-indigo-400" />
                    </div>
                </Link>
            </div>

            <div className="mt-2 w-full sm:max-w-md card overflow-hidden">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
