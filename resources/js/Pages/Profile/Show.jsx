import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { auth } = usePage().props;
    const user = auth.user;

    const initials = user.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'AU';

    return (
        <MainLayout
            user={user}
            activeKey="profile"
            pageTitle="My Profile"
        >
            <Head title="My Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="card p-8">
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-indigo-100 shadow-sm bg-gray-50 flex items-center justify-center">
                                    {user.avatar ? (
                                        <img
                                            src={
                                                user.avatar.startsWith('http') || user.avatar.startsWith('/')
                                                    ? user.avatar
                                                    : `/storage/${user.avatar}`
                                            }
                                            alt={user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Details Section */}
                            <div className="flex-1 text-center sm:text-left space-y-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {user.name}
                                    </h2>
                                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                                        {user.email}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div className="card p-4">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</p>
                                        <p className="text-base text-slate-800 dark:text-gray-200 capitalize">
                                            {user.role || 'User'}
                                        </p>
                                    </div>
                                    <div className="card p-4">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-base text-slate-800 dark:text-gray-200 capitalize">
                                            {user.status || 'Active'}
                                        </p>
                                    </div>
                                    {user.phone && (
                                        <div className="card p-4">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                            <p className="text-base text-slate-800 dark:text-gray-200">
                                                {user.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6">
                                    <Link
                                        href={route('profile.edit')}
                                        className="btn-primary inline-flex items-center"
                                    >
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
