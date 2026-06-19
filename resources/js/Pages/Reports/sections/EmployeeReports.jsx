import React from 'react';
import KPICard from '../components/KPICard';
import ReportChart from '../components/ReportChart';
import ReportTable from '../components/ReportTable';
import { useReportData } from '../hooks/useReportData';
import { useCurrency } from '@/hooks/useCurrency';

const EmployeeReports = ({ filters }) => {
    const { formatCurrency } = useCurrency();
    const { data, loading } = useReportData('/api/reports/employees/performance', filters);

    // Derive KPIs from the data
    const totalEmployees = data?.length ?? 0;
    const totalOrders = data?.reduce((sum, e) => sum + Number(e.transactions), 0) ?? 0;
    const totalSales = data?.reduce((sum, e) => sum + parseFloat(e.total_sales), 0) ?? 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Data is already ordered by total_sales desc from the backend
    const chartData = data?.map(e => ({
        name: e.name.split(' ')[0],
        value: parseFloat(e.total_sales)
    })) ?? [];

    return (
        <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Active Employees"
                    value={totalEmployees}
                    loading={loading}
                    isCurrency={false}
                />
                <KPICard
                    title="Total Orders"
                    value={totalOrders}
                    loading={loading}
                    isCurrency={false}
                />
                <KPICard
                    title="Total Sales"
                    value={totalSales}
                    loading={loading}
                />
                <KPICard
                    title="Avg Order Value"
                    value={avgOrderValue}
                    loading={loading}
                />
            </div>

            {/* Table + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <div className="card-header">
                        <h3 className="card-title">Staff Sales Performance</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Ranked by total sales (highest first)</p>
                    </div>
                    <ReportTable
                        columns={[
                            {
                                key: 'rank', label: '#', render: (_, row) => {
                                    const idx = (data ?? []).indexOf(row) + 1;
                                    return (
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx <= 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx}
                                        </span>
                                    );
                                }
                            },
                            { key: 'employee_id', label: 'Employee ID' },
                            { key: 'name', label: 'Employee Name' },
                            { key: 'transactions', label: 'Orders', align: 'right' },
                            {
                                key: 'total_sales', label: 'Total Sales', align: 'right',
                                render: v => formatCurrency(v),
                                total: formatCurrency(totalSales)
                            },
                            {
                                key: 'aov', label: 'Avg Order', align: 'right',
                                render: v => formatCurrency(v)
                            }
                        ]}
                        data={data ?? []}
                        totals={true}
                    />
                </div>

                <div className="space-y-6">
                    <div className="card p-6">
                        <ReportChart
                            type="bar"
                            title="Sales by Employee"
                            data={chartData}
                            xKey="name"
                            yKeys={[{ name: 'value', label: 'Sales (LKR)' }]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeReports;
