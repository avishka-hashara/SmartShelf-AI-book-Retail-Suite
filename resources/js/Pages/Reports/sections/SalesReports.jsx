import React, { useState } from 'react';
import ReportChart from '../components/ReportChart';
import ReportTable from '../components/ReportTable';
import { useReportData } from '../hooks/useReportData';
import { useCurrency } from '@/hooks/useCurrency';
import { BarChart3, PieChart, Tag, Package, CreditCard, ChevronDown } from 'lucide-react';

const SalesReports = ({ filters }) => {
    const [activeSubTab, setActiveSubTab] = useState('period');

    const subTabs = [
        { id: 'period', label: 'By Period', icon: BarChart3 },
        { id: 'category', label: 'By Category', icon: PieChart },
        { id: 'product', label: 'By Product', icon: Package },
        { id: 'payment', label: 'By Payment', icon: CreditCard },
        { id: 'discounts', label: 'Discounts', icon: Tag },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Sub-navigation */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fade-up">
                {activeSubTab === 'period' && <SalesByPeriod filters={filters} />}
                {activeSubTab === 'category' && <SalesByCategory filters={filters} />}
                {activeSubTab === 'product' && <SalesByProduct filters={filters} />}
                {activeSubTab === 'payment' && <SalesByPayment filters={filters} />}
            </div>
        </div>
    );
};

const SalesByPeriod = ({ filters }) => {
    const { data, loading } = useReportData('/api/reports/sales/by-period', filters);
    const { formatCurrency } = useCurrency();

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <ReportChart
                    type="bar"
                    title="Revenue over Time"
                    data={data}
                    xKey="period"
                    yKeys={[{ name: 'revenue', label: 'Revenue (LKR)' }]}
                />
            </div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Sales Data Table</h3>
                </div>
                <ReportTable
                    columns={[
                        { key: 'period', label: 'Date' },
                        { key: 'transactions', label: 'Transactions', align: 'right' },
                        { key: 'revenue', label: 'Gross Sales', align: 'right', render: (val) => formatCurrency(val) },
                        { key: 'profit', label: 'Gross Profit', align: 'right', render: (val) => formatCurrency(val || 0) }
                    ]}
                    data={data ?? []}
                    totals={true}
                />
            </div>
        </div>
    );
};

const SalesByCategory = ({ filters }) => {
    const { data, loading } = useReportData('/api/reports/sales/by-category', filters);
    const chartData = data?.map(d => ({ name: d.category, value: parseFloat(d.revenue) })) ?? [];
    const { formatCurrency } = useCurrency();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 flex items-center justify-center">
                <ReportChart type="pie" title="Revenue Share by Category" data={chartData} xKey="value" />
            </div>
            <div className="card">
                <div className="card-header"><h3 className="card-title">Category Breakdown</h3></div>
                <ReportTable
                    columns={[
                        { key: 'category', label: 'Category' },
                        { key: 'qty', label: 'Qty Sold', align: 'right' },
                        { key: 'revenue', label: 'Revenue', align: 'right', render: (val) => formatCurrency(val) }
                    ]}
                    data={data ?? []}
                />
            </div>
        </div>
    );
};

const SalesByProduct = ({ filters }) => {
    const { data, loading } = useReportData('/api/reports/sales/by-product', filters);
    const { formatCurrency } = useCurrency();

    return (
        <div className="card">
            <div className="card-header"><h3 className="card-title">Product Sales Leaderboard</h3></div>
            <ReportTable
                columns={[
                    { key: 'product_id', label: 'ID' },
                    { key: 'title', label: 'Product Name' },
                    { key: 'qty_sold', label: 'Qty Sold', align: 'right' },
                    { key: 'revenue', label: 'Total Revenue', align: 'right', render: (val) => formatCurrency(val) }
                ]}
                data={data?.data ?? []}
            />
        </div>
    );
};

const SalesByPayment = ({ filters }) => {
    const { data, loading } = useReportData('/api/reports/sales/by-payment-method', filters);
    const { formatCurrency } = useCurrency();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
                <ReportChart type="pie" title="Payment Method Split" data={data?.map(d => ({ name: d.payment_method, value: parseFloat(d.amount) }))} xKey="value" />
            </div>
            <div className="card">
                <div className="card-header"><h3 className="card-title">Payment Details</h3></div>
                <ReportTable
                    columns={[
                        { key: 'payment_method', label: 'Method' },
                        { key: 'count', label: 'Transactions', align: 'right' },
                        { key: 'amount', label: 'Total Amount', align: 'right', render: (val) => formatCurrency(val) }
                    ]}
                    data={data ?? []}
                />
            </div>
        </div>
    );
}

export default SalesReports;
