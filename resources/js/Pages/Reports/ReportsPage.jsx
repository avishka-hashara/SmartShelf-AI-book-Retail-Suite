import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import GlobalFilters from './components/GlobalFilters';
import OverviewDashboard from './sections/OverviewDashboard';
import SalesReports from './sections/SalesReports';
import InventoryReports from './sections/InventoryReports';
import CustomerReports from './sections/CustomerReports';
import EmployeeReports from './sections/EmployeeReports';
import {
    LayoutDashboard, BarChart3, Package, Users,
    UserCircle, Download
} from 'lucide-react';

const ReportsPage = ({ auth }) => {
    const [activeKey, setActiveKey] = useState('reports');
    const [activeSection, setActiveSection] = useState('overview');
    const [filters, setFilters] = useState({
        period: 'month',
        date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
        branch: 'all',
        category: 'all',
    });

    React.useEffect(() => {
        if (filters.period === 'custom') return;

        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (filters.period) {
            case 'today':
                from = today;
                to = today;
                break;
            case 'yesterday':
                from = new Date(today);
                from.setDate(today.getDate() - 1);
                to = new Date(from);
                break;
            case 'week':
                from = new Date(today);
                from.setDate(today.getDate() - today.getDay());
                to = today;
                break;
            case 'month':
                from = new Date(today.getFullYear(), today.getMonth(), 1);
                to = today;
                break;
            case 'quarter':
                const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
                from = new Date(today.getFullYear(), quarterMonth, 1);
                to = today;
                break;
            case 'year':
                from = new Date(today.getFullYear(), 0, 1);
                to = today;
                break;
        }

        setFilters(prev => ({
            ...prev,
            date_from: from.toISOString().split('T')[0],
            date_to: to.toISOString().split('T')[0]
        }));
    }, [filters.period]);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const sections = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sales', label: 'Sales Reports', icon: BarChart3 },
        { id: 'inventory', label: 'Inventory & Stock', icon: Package },
        { id: 'customers', label: 'Customers & Loyalty', icon: Users },
        { id: 'employees', label: 'Employee Performance', icon: UserCircle },
    ];

    const handleApplyFilters = () => {
        // useReportData hooks will automatically refetch when filters change
        console.log('Filters applied:', filters);
    };

    const handleExport = (format) => {
        const queryParams = new URLSearchParams({
            ...filters,
            section: activeSection
        }).toString();

        const url = `/api/reports/export/${format}?${queryParams}`;
        window.open(url, '_blank');
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Reports & Analytics"
            user={auth?.user ?? { name: 'Admin User', email: 'admin@productshop.com' }}
            onLogout={handleLogout}
        >
            <Head title="Reports & Analytics" />

            <div className="flex h-[calc(100vh-140px)] overflow-hidden -m-4">
                {/* Reports Sidebar */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col pt-4">
                    <div className="px-4 mb-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Report Categories</h2>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <section.icon size={18} />
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                    <GlobalFilters
                        filters={filters}
                        setFilters={setFilters}
                        onApply={handleApplyFilters}
                        onExport={handleExport}
                    />

                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    {sections.find(s => s.id === activeSection)?.label}
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    Showing data from {filters.date_from} to {filters.date_to}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 animate-pulse-soft">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Live Data
                                </span>
                            </div>
                        </div>

                        <div key={activeSection} className="animate-fade-up">
                            {activeSection === 'overview' && <OverviewDashboard filters={filters} />}
                            {activeSection === 'sales' && <SalesReports filters={filters} />}
                            {activeSection === 'inventory' && <InventoryReports filters={filters} />}
                            {activeSection === 'customers' && <CustomerReports filters={filters} />}
                            {activeSection === 'employees' && <EmployeeReports filters={filters} />}
                        </div>

                        {/* Footer Spacer */}
                        <div className="h-12"></div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
};

export default ReportsPage;
