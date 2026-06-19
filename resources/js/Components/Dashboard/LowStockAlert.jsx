import React from 'react';
import { PartyPopper } from 'lucide-react';

/**
 * LowStockAlert - Shows products with stock below threshold with a visual stock bar.
 *
 * @param {Array} items - Array of { product, stock, threshold }
 * @returns {JSX.Element}
 */
const LowStockAlert = ({ items = [] }) => {
    const getStockColor = (stock, threshold) => {
        const ratio = stock / threshold;
        if (ratio <= 0.2) return 'bg-red-500';
        if (ratio <= 0.5) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStockLabel = (stock, threshold) => {
        const ratio = stock / threshold;
        if (ratio <= 0.2) return { text: 'Critical', cls: 'badge-danger' };
        if (ratio <= 0.5) return { text: 'Low', cls: 'badge-warning' };
        return { text: 'OK', cls: 'badge-success' };
    };

    return (
        <div className="card h-full flex flex-col">
            {/* Header */}
            <div className="card-header">
                <h3 className="card-title">Low Stock Alerts</h3>
                <a href="/inventory/low-stock" className="btn-ghost-primary btn-xs">Manage Stock</a>
            </div>

            {/* Items list */}
            <div className="card-body flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <p className="text-center text-slate-400 py-6 flex items-center justify-center gap-1.5">All stock levels are healthy <PartyPopper className="w-4 h-4 text-emerald-500" /></p>
                ) : (
                    <ul className="space-y-4">
                        {items.map((item, idx) => {
                            const widthPct = Math.min(100, (item.stock / item.threshold) * 100);
                            const color = getStockColor(item.stock, item.threshold);
                            const label = getStockLabel(item.stock, item.threshold);

                            return (
                                <li key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-slate-700 truncate flex-1">
                                            {item.product}
                                        </p>
                                        <span className={`badge ${label.cls} flex-shrink-0`}>{label.text}</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="stock-bar">
                                        <div
                                            className={`stock-bar-fill ${color}`}
                                            style={{ width: `${widthPct}%` }}
                                            role="progressbar"
                                            aria-valuenow={item.stock}
                                            aria-valuemin={0}
                                            aria-valuemax={item.threshold}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{item.stock} remaining</span>
                                        <span>Min: {item.threshold}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Footer CTA */}
            <div className="card-footer">
                <a href="/pos" className="text-indigo-600 font-medium hover:underline text-xs">
                    + Reorder now
                </a>
            </div>
        </div>
    );
};

export default LowStockAlert;
