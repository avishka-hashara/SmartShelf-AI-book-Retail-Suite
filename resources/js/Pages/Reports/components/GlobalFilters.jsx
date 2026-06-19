import React from 'react';
import { Calendar, FileDown, RefreshCw } from 'lucide-react';

const GlobalFilters = ({ filters, setFilters, onApply, onExport }) => {
    const periodOptions = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'This Quarter', value: 'quarter' },
        { label: 'This Year', value: 'year' },
        { label: 'Custom', value: 'custom' },
    ];

    const categoryOptions = [
        { label: 'All Categories', value: 'all' },
        { label: 'Books', value: 'Books' },
        { label: 'Stationery', value: 'Stationery' },
        { label: 'Art Supplies', value: 'Art Supplies' },
        { label: 'Gifts', value: 'Gifts' },
        { label: 'Used Books', value: 'Used Books' },
    ];

    const [showExport, setShowExport] = React.useState(false);

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex flex-wrap items-center gap-4 shadow-sm">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                <select
                    className="form-select py-1.5 text-xs font-medium w-40"
                    value={filters.period}
                    onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                >
                    {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>

                {filters.period === 'custom' && (
                    <div className="flex items-center gap-2 animate-fade-in text-xs transition-all duration-300">
                        <input type="date" className="form-input py-1.5 px-2 w-32" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
                        <span className="text-slate-400">to</span>
                        <input type="date" className="form-input py-1.5 px-2 w-32" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
                <select
                    className="form-select py-1.5 text-xs font-medium w-40"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
                <button className="btn-primary btn-sm gap-2" onClick={onApply}>
                    <RefreshCw size={16} />
                    Apply
                </button>

                <div className="relative">
                    <button
                        className={`btn-secondary btn-sm gap-2 ${showExport ? 'bg-slate-100 ring-2 ring-slate-200' : ''}`}
                        onClick={() => setShowExport(!showExport)}
                    >
                        <FileDown size={16} />
                        Export
                    </button>
                    {showExport && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)}></div>
                            <div className="dropdown-menu absolute right-0 mt-2 z-50 block">
                                <button className="dropdown-item w-full text-left" onClick={() => { onExport('pdf'); setShowExport(false); }}>PDF Report</button>
                                <button className="dropdown-item w-full text-left" onClick={() => { onExport('csv'); setShowExport(false); }}>CSV Spreadsheet</button>
                                <button className="dropdown-item w-full text-left" onClick={() => { onExport('excel'); setShowExport(false); }}>Excel File</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalFilters;
