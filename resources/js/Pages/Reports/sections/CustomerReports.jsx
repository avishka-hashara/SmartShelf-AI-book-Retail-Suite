import React from 'react';
import ReportChart from '../components/ReportChart';
import ReportTable from '../components/ReportTable';
import { useReportData } from '../hooks/useReportData';
import KPICard from '../components/KPICard';
import { useCurrency } from '@/hooks/useCurrency';
import { Users, Star, UserPlus } from 'lucide-react';

const CustomerReports = ({ filters }) => {
    const { formatCurrency } = useCurrency();
    const { data: topData, loading: topLoading } = useReportData('/api/reports/customers/top', filters);
    const { data: loyaltyData, loading: loyaltyLoading } = useReportData('/api/reports/customers/loyalty', filters);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard title="Total Members" value={loyaltyData?.kpis?.total_members ?? 0} isCurrency={false} prefix="" loading={loyaltyLoading} />
                <KPICard title="Active Members" value={loyaltyData?.kpis?.active_members ?? 0} isCurrency={false} prefix="" loading={loyaltyLoading} />
                <KPICard title="Points Issued" value={loyaltyData?.kpis?.points_issued ?? 0} isCurrency={false} prefix="" loading={loyaltyLoading} />
                <KPICard title="Points Redeemed" value={loyaltyData?.kpis?.points_redeemed ?? 0} isCurrency={false} prefix="" loading={loyaltyLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card">
                    <div className="card-header flex justify-between">
                        <h3 className="card-title">Top 20 Customers by Spend</h3>
                    </div>
                    <ReportTable
                        columns={[
                            { key: 'customer_code', label: 'ID/Code' },
                            { key: 'customer_name', label: 'Customer Name' },
                            { key: 'visits', label: 'Visits', align: 'right' },
                            { key: 'total_spend', label: 'Total Spend', align: 'right', render: v => formatCurrency(v) },
                            { key: 'avg_order', label: 'Avg Order', align: 'right', render: v => formatCurrency(v) }
                        ]}
                        data={topData ?? []}
                        maxHeight="500px"
                    />
                </div>

                <div className="space-y-6">
                    <div className="card p-6">
                        <ReportChart
                            type="pie"
                            title="New vs Returning"
                            data={loyaltyData?.retention}
                            xKey="value"
                        />
                    </div>

                    <div className="card p-6 bg-indigo-600 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Star className="text-amber-400 fill-amber-400" />
                            <h4 className="font-bold">Loyalty Program ROI</h4>
                        </div>
                        <p className="text-3xl font-black mb-1">{loyaltyData?.roi?.multiplier ?? 1}x</p>
                        <p className="text-indigo-100 text-sm">
                            {loyaltyData?.roi?.percentage > 0 
                                ? `Customers in the loyalty program spend ${loyaltyData.roi.percentage}% more than non-members on average.`
                                : "Not enough data yet to calculate loyalty ROI."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerReports;
