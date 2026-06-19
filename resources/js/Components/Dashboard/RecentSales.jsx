import React from 'react';
import Badge, { statusVariant } from '../UI/Badge';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * RecentSales - Recent sales transaction table widget.
 *
 * @param {Array}  sales - Array of sale objects:
 *   { id, customer, items, total, status, time? }
 * @returns {JSX.Element}
 */
const RecentSales = ({ sales = [] }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="card h-full flex flex-col">
            {/* Header */}
            <div className="card-header">
                <h3 className="card-title">Recent Sales</h3>
                <button className="btn-ghost-primary btn-xs">View All</button>
            </div>

            {/* Table */}
            <div className="table-wrapper rounded-none border-0 flex-1">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Customer</th>
                            <th className="hidden sm:table-cell">Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="hidden md:table-cell">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td>
                                    <span className="font-mono text-indigo-600 font-semibold text-xs">
                                        {sale.id}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {/* Avatar initial */}
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {sale.customer?.[0] ?? '?'}
                                        </div>
                                        <span className="font-medium text-slate-700 truncate max-w-[100px]">
                                            {sale.customer}
                                        </span>
                                    </div>
                                </td>
                                <td className="hidden sm:table-cell text-slate-500">{sale.items}</td>
                                <td className="font-semibold text-slate-800">{formatCurrency(sale.total)}</td>
                                <td>
                                    <Badge variant={statusVariant(sale.status)} dot>
                                        {sale.status}
                                    </Badge>
                                </td>
                                <td className="hidden md:table-cell text-slate-400 text-xs">
                                    {sale.time ?? '—'}
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-slate-400 py-8">
                                    No recent sales found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentSales;
