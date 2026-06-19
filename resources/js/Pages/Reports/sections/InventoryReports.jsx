import React from 'react';
import ReportChart from '../components/ReportChart';
import ReportTable from '../components/ReportTable';
import { useReportData } from '../hooks/useReportData';
import KPICard from '../components/KPICard';
import { Package, AlertCircle, BarChart2 } from 'lucide-react';

const MOVEMENT_BADGE = {
    purchase: 'badge-success',
    sale: 'badge-info',
    return: 'badge-info',
    adjustment: 'badge-warning',
    waste: 'badge-danger',
    correction: 'badge-warning',
};

const InventoryReports = ({ filters }) => {
    const { data: stockData, loading: stockLoading } = useReportData('/api/reports/inventory/stock-levels', filters);
    const { data: valuationData, loading: valuationLoading } = useReportData('/api/reports/inventory/valuation', filters);
    const { data: movementsData, loading: movementsLoading } = useReportData('/api/reports/inventory/stock-movements', filters);
    const { data: poData, loading: poLoading } = useReportData('/api/reports/purchase-orders/summary', filters);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Total Categories"
                    value={valuationData?.by_category?.length ?? 0}
                    loading={valuationLoading}
                    isCurrency={false}
                />
                <KPICard
                    title="Total Cost Value"
                    value={valuationData?.summary?.total_cost_value ?? 0}
                    loading={valuationLoading}
                />
                <KPICard
                    title="Potential Retail Value"
                    value={valuationData?.summary?.total_retail_value ?? 0}
                    loading={valuationLoading}
                />
                <KPICard
                    title="Estimated Profit"
                    value={valuationData?.summary?.potential_profit ?? 0}
                    loading={valuationLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header bg-amber-50/50">
                        <h3 className="card-title flex items-center gap-2 text-amber-700">
                            <AlertCircle size={16} /> Low & Out of Stock Items
                        </h3>
                    </div>
                    <ReportTable
                        columns={[
                            { key: 'name', label: 'Product' },
                            { key: 'stock_level', label: 'Stock', align: 'right' },
                            {
                                key: 'status', label: 'Status', render: (val) => (
                                    <span className={`badge-${val === 'out_of_stock' ? 'danger' : 'warning'} text-[10px]`}>
                                        {val.replace('_', ' ').toUpperCase()}
                                    </span>
                                )
                            }
                        ]}
                        data={stockData?.filter(i => i.status !== 'in_stock') ?? []}
                        maxHeight="400px"
                    />
                </div>

                <div className="card p-6">
                    <ReportChart
                        type="bar"
                        title="Stock Value by Category"
                        data={valuationData?.by_category?.map(c => ({ category: c.category, value: parseFloat(c.retail_value) }))}
                        xKey="category"
                        yKeys={[{ name: 'value', label: 'Retail Value (LKR)' }]}
                    />
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">Full Inventory Snapshot</h3></div>
                <ReportTable
                    columns={[
                        { key: 'sku', label: 'SKU/ISBN' },
                        { key: 'name', label: 'Product Name' },
                        { key: 'category', label: 'Category' },
                        { key: 'unit_price', label: 'Price (LKR)', align: 'right', render: v => new Intl.NumberFormat().format(v) },
                        { key: 'stock_level', label: 'In Stock', align: 'right', total: stockData?.reduce((acc, curr) => acc + curr.stock_level, 0) },
                        {
                            key: 'status', label: 'Status', render: (val) => (
                                <span className={`badge-${val === 'in_stock' ? 'success' : val === 'low_stock' ? 'warning' : 'danger'} text-[10px]`}>
                                    {val.replace('_', ' ').toUpperCase()}
                                </span>
                            )
                        }
                    ]}
                    data={stockData ?? []}
                    totals={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="card-header"><h3 className="card-title">Open Purchase Orders</h3></div>
                    <ReportTable
                        columns={[
                            { key: 'po_number', label: 'PO Number' },
                            { key: 'supplier', label: 'Supplier', render: (_, row) => row.supplier?.name ?? '—' },
                            { key: 'status', label: 'Status', render: v => <span className="badge-info text-[10px]">{v.replace('_', ' ').toUpperCase()}</span> },
                            { key: 'total_cost', label: 'Total Cost (LKR)', align: 'right', render: v => new Intl.NumberFormat().format(v) },
                        ]}
                        data={poData?.open_orders ?? []}
                        maxHeight="320px"
                    />
                </div>

                <div className="card">
                    <div className="card-header"><h3 className="card-title">Spend by Supplier</h3></div>
                    <ReportTable
                        columns={[
                            { key: 'supplier_name', label: 'Supplier' },
                            { key: 'po_count', label: 'POs', align: 'right' },
                            { key: 'total_spend', label: 'Total Spend (LKR)', align: 'right', render: v => new Intl.NumberFormat().format(v) },
                        ]}
                        data={poData?.by_supplier ?? []}
                        maxHeight="320px"
                    />
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="card-title">Stock Movement Ledger</h3></div>
                <ReportTable
                    columns={[
                        { key: 'created_at', label: 'Date', render: v => new Date(v).toLocaleString() },
                        { key: 'product', label: 'Product', render: (_, row) => row.product?.name ?? '—' },
                        { key: 'type', label: 'Type', render: v => <span className={`${MOVEMENT_BADGE[v] ?? 'badge-info'} text-[10px]`}>{v.toUpperCase()}</span> },
                        { key: 'quantity', label: 'Qty', align: 'right', render: v => (v > 0 ? `+${v}` : v) },
                        { key: 'reason', label: 'Reason' },
                        { key: 'user', label: 'By', render: (_, row) => row.user?.name ?? 'System' },
                    ]}
                    data={movementsData?.data ?? []}
                    maxHeight="400px"
                />
            </div>
        </div>
    );
};

export default InventoryReports;
