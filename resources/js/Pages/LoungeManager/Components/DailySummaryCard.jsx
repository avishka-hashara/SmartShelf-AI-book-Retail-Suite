import React from 'react';

export default function DailySummaryCard({ summary }) {
    return (
        <div className="flex-1 flex flex-row items-center justify-between min-w-0">
            {/* Today's Sessions */}
            <div className="flex flex-col border-r border-slate-200 pr-6 sm:pr-8">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">
                    Today's Sessions
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        {summary?.total_sessions || 0}
                    </span>
                    {/* Mock green arrow, user didn't ask us to calculate the real percentage yet */}
                    <span className="text-sm font-medium text-emerald-500 flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                        </svg>
                        12%
                    </span>
                </div>
            </div>

            {/* Average Duration */}
            <div className="flex flex-col border-r border-slate-200 px-6 sm:px-8">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">
                    Avg Duration
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        {summary?.average_duration_minutes || 0}
                    </span>
                    <span className="text-base font-medium text-slate-500">
                        min
                    </span>
                </div>
            </div>

            {/* Lounge Revenue */}
            <div className="flex flex-col pl-6 sm:pl-8">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">
                    Lounge Revenue
                </span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        Rs. {Number(summary?.total_revenue || 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
