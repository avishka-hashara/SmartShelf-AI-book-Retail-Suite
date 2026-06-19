import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const KPICard = ({ title, value, change, isCurrency = true, prefix = 'LKR', loading = false }) => {
    if (loading) {
        return (
            <div className="stat-card animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-20 bg-slate-200 rounded"></div>
            </div>
        );
    }

    const { formatCurrency } = useCurrency();
    const isPositive = change > 0;
    const isNegative = change < 0;
    const formattedValue = isCurrency
        ? formatCurrency(value)
        : new Intl.NumberFormat().format(value);

    return (
        <div className="stat-card animate-fade-up">
            <div className="flex-1">
                <p className="stat-card-label">{title}</p>
                <p className="stat-card-value">{formattedValue}</p>

                {change !== undefined && (
                    <div className={`flex items-center gap-1 mt-1 font-semibold text-xs ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'
                        }`}>
                        {isPositive && <TrendingUp size={14} />}
                        {isNegative && <TrendingDown size={14} />}
                        {change === 0 && <Minus size={14} />}
                        {Math.abs(change).toFixed(1)}% vs last period
                    </div>
                )}
            </div>

            {/* Sparkline placeholder - in a real app, use a tiny Recharts LineChart here */}
            <div className="w-16 h-10 opacity-20">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                    <path
                        d="M0 30 Q 20 10 40 25 T 80 5 T 100 20"
                        fill="none"
                        stroke={isPositive ? '#10b981' : '#ef4444'}
                        strokeWidth="3"
                    />
                </svg>
            </div>
        </div>
    );
};

export default KPICard;
