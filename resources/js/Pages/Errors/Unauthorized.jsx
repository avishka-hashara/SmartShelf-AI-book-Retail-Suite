import { Head, Link, usePage } from '@inertiajs/react';

export default function Unauthorized() {
    const { role, message } = usePage().props;

    return (
        <>
            <Head title="Access Denied" />

            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="card max-w-md w-full p-8 text-center">
                    {/* Lock Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg
                            className="h-8 w-8 text-red-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                            />
                        </svg>
                    </div>

                    {/* Status Code */}
                    <h1 className="text-6xl font-bold text-gray-800 mb-2">403</h1>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Access Denied
                    </h2>

                    {/* Message */}
                    <p className="text-gray-500 mb-4">
                        {message || 'You do not have permission to access this page.'}
                    </p>

                    {/* Role Badge */}
                    {role && (
                        <p className="text-sm text-gray-400 mb-6">
                            Your current role:{' '}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 capitalize">
                                {role.replace('_', ' ')}
                            </span>
                        </p>
                    )}

                    {/* Go to Dashboard Button */}
                    <Link
                        href="/dashboard"
                        className="btn-primary inline-flex items-center"
                    >
                        <svg
                            className="h-5 w-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
}
