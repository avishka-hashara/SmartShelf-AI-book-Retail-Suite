import React from 'react';
import KPICard from '../components/KPICard';
import ReportChart from '../components/ReportChart';
import ReportTable from '../components/ReportTable';
import { useReportData } from '../hooks/useReportData';
import { useCurrency } from '@/hooks/useCurrency';
import { AlertTriangle, UserCheck } from 'lucide-react';

const OverviewDashboard = ({ filters }) => {
    const { formatCurrency } = useCurrency();
    const { data, loading, error } = useReportData('/api/reports/overview', filters);

    return (
        <div className="space-y-6">
            {error && (
                <div className="card p-4 flex items-center gap-3 bg-red-50 border-red-200">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error} — figures below may be incomplete.</p>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard title="Total Sales" value={data?.kpis?.total_sales ?? 0} change={data?.kpis?.sales_change} loading={loading} />
                <KPICard title="Gross Profit" value={data?.kpis?.gross_profit ?? 0} change={data?.kpis?.profit_change} loading={loading} />
                <KPICard title="Margin %" value={data?.kpis?.margin ?? 0} isCurrency={false} prefix="" change={data?.kpis?.margin_change} loading={loading} />
                <KPICard title="Avg Order Value" value={data?.kpis?.aov ?? 0} change={data?.kpis?.aov_change} loading={loading} />
                <KPICard title="Transactions" value={data?.kpis?.transactions ?? 0} isCurrency={false} prefix="" change={data?.kpis?.transactions_change} loading={loading} />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6">
                    <ReportChart
                        type="line"
                        title="Sales Trend"
                        data={data?.charts?.trend}
                        xKey="date"
                        yKeys={[{ name: 'revenue', label: 'Revenue (LKR)' }]}
                    />
                </div>
                <div className="card p-6">
                    <ReportChart
                        type="pie"
                        title="Sales by Category"
                        data={data?.charts?.sales_by_category?.map(c => ({ name: c.category, value: parseFloat(c.revenue) }))}
                        xKey="value"
                    />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top 5 Selling Products</h3>
                    </div>
                    <div className="p-0">
                        <ReportTable
                            columns={[
                                { key: 'title', label: 'Product Name' },
                                { key: 'total_qty', label: 'Qty Sold', align: 'right' },
                                { key: 'total_revenue', label: 'Revenue', align: 'right', render: (val) => formatCurrency(val) }
                            ]}
                            data={data?.charts?.top_products ?? []}
                        />
                    </div>
                </div>

                {/* Alerts & Insights */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="card p-4 flex items-center gap-4 bg-amber-50 border-amber-200">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900">Low Stock Alert</h4>
                            <p className="text-sm text-amber-700">{data?.low_stock_count ?? 0} items are below reorder level. Review inventory soon.</p>
                        </div>
                    </div>

                    {data?.top_employee && (
                        <div className="card p-4 flex items-center gap-4 bg-indigo-50 border-indigo-200">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <UserCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900">Top Performing Employee</h4>
                                <p className="text-sm text-indigo-700">{data.top_employee.name} has processed {data.top_employee.transactions} transactions totaling {formatCurrency(data.top_employee.total_sales)}.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewDashboard;
