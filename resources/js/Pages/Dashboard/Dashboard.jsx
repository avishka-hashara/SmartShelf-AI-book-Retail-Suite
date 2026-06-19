import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import MainLayout from "@/Layouts/MainLayout";
import StatCard from "@/Components/Dashboard/StatCard";
import RecentSales from "@/Components/Dashboard/RecentSales";
import LowStockAlert from "@/Components/Dashboard/LowStockAlert";
import QuickActions from "@/Components/Dashboard/QuickActions";
import ReportChart from "@/Pages/Reports/components/ReportChart";
import Badge, { statusVariant } from "@/Components/UI/Badge";
import { useCurrency } from "@/hooks/useCurrency";
import {
    DollarSign,
    ShoppingCart,
    Package,
    BookOpen,
    TrendingUp,
    GraduationCap,
    MoreHorizontal,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────── */
const fmt = (n) => Number(n ?? 0).toLocaleString();
const changeStr = (v) => (v > 0 ? `+${v}%` : v < 0 ? `${v}%` : "0%");

/* ─────────────────────────────────────────────────
   TIME-RANGE SEGMENTED CONTROL
   ───────────────────────────────────────────────── */
const RANGE_OPTIONS = ["Today", "Week", "Month"];

const SegmentedControl = ({ value, onChange }) => (
    <div className="segmented">
        {RANGE_OPTIONS.map((opt) => (
            <span
                key={opt}
                className={`segmented-item ${value === opt ? "active" : ""}`}
                onClick={() => onChange(opt)}
            >
                {opt}
            </span>
        ))}
    </div>
);

/* ─────────────────────────────────────────────────
   DASHBOARD PAGE
   ───────────────────────────────────────────────── */

/**
 * Dashboard - Main product shop POS dashboard page.
 * Receives optional props from Inertia controller.
 *
 * @param {object} auth - Laravel Inertia auth prop { user }
 * @returns {JSX.Element}
 */
export default function Dashboard({
    auth,
    stats = {},
    recentSales = [],
    lowStockProducts = [],
    activeLoans = [],
    summary = {},
}) {
    const [activeKey, setActiveKey] = useState("dashboard");
    const [range, setRange] = useState("Today");
    const [liveStats, setLiveStats] = useState(stats);
    const [statsLoading, setStatsLoading] = useState(false);
    const [trend, setTrend] = useState([]);
    const [trendLoading, setTrendLoading] = useState(true);
    const { formatCurrency } = useCurrency();

    // ── KPI cards — refetch sales/orders figures whenever the range toggles ──
    useEffect(() => {
        setStatsLoading(true);
        axios
            .get("/dashboard/stats", { params: { range } })
            .then((res) => setLiveStats(res.data))
            .catch(() => {})
            .finally(() => setStatsLoading(false));
    }, [range]);

    // ── Sales Trend chart — real data from the same Sales Reports endpoint ──
    useEffect(() => {
        const toDate = (d) => d.toISOString().split("T")[0];
        const today = new Date();
        let from = new Date();

        if (range === "Today") {
            from.setDate(today.getDate() - 6); // show the trailing week for context
        } else if (range === "Week") {
            from.setDate(today.getDate() - today.getDay());
        } else {
            from = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        const fromStr = toDate(from);
        const toStr = toDate(today);

        setTrendLoading(true);
        axios
            .get("/api/reports/sales/by-period", {
                params: { date_from: fromStr, date_to: toStr, granularity: "daily" },
            })
            .then((res) => {
                // The endpoint only returns days that had sales — zero-fill the
                // rest so the line reflects every day in range, not just hits.
                const byDate = {};
                (res.data ?? []).forEach((row) => { byDate[row.period] = row; });

                const series = [];
                const cursor = new Date(fromStr + "T00:00:00");
                const end = new Date(toStr + "T00:00:00");
                while (cursor <= end) {
                    const key = cursor.toISOString().split("T")[0];
                    const row = byDate[key];
                    series.push({
                        period: key,
                        label: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        revenue: Number(row?.revenue ?? 0),
                        transactions: Number(row?.transactions ?? 0),
                    });
                    cursor.setDate(cursor.getDate() + 1);
                }
                setTrend(series);
            })
            .catch(() => setTrend([]))
            .finally(() => setTrendLoading(false));
    }, [range]);

    const handleNavigate = (key, href) => {
        setActiveKey(key);
        if (href) router.visit(href);
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    const rangeLabel = { Today: "Today's", Week: "This Week's", Month: "This Month's" }[range];
    const periodWord = { Today: "vs yesterday", Week: "vs last week", Month: "vs last month" }[range];

    const STATS = [
        {
            title: `${rangeLabel} Sales`,
            value: formatCurrency(liveStats.todaySales),
            change: changeStr(liveStats.salesChange),
            changeLabel: periodWord,
            icon: <DollarSign className="w-5 h-5 text-white" />,
            tone: "orange",
            subtitle: `${fmt(liveStats.todayTransactions)} transactions`,
        },
        {
            title: `${rangeLabel} Orders`,
            value: fmt(liveStats.todayOrders),
            change: changeStr(liveStats.ordersChange),
            changeLabel: periodWord,
            icon: <ShoppingCart className="w-5 h-5 text-white" />,
            tone: "pink",
            subtitle: `${fmt(liveStats.pendingOrders)} pending`,
        },
        {
            title: "Products in Stock",
            value: fmt(liveStats.totalStock),
            change: liveStats.lowStockCount > 0 ? `-${liveStats.lowStockCount}` : "0",
            icon: <Package className="w-5 h-5 text-white" />,
            tone: "indigo",
            subtitle: `${fmt(liveStats.lowStockCount)} low-stock alerts`,
        },
        {
            title: "Active Borrowers",
            value: fmt(liveStats.activeBorrowers),
            change: liveStats.overdueLoans > 0 ? `-${liveStats.overdueLoans}` : "0",
            icon: <BookOpen className="w-5 h-5 text-white" />,
            tone: "teal",
            subtitle: `${fmt(liveStats.overdueLoans)} overdue`,
        },
    ];

    return (
        <MainLayout
            activeKey={activeKey}
            onNavigate={handleNavigate}
            pageTitle="Dashboard"
            user={
                auth?.user ?? {
                    name: "Admin User",
                    email: "admin@productshop.com",
                }
            }
            onLogout={handleLogout}
        >
            <Head title="Dashboard" />

            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title text-3xl">Dashboard Overview</h1>
                    <p className="page-subtitle">
                        Welcome back — here's what's happening today.
                    </p>
                </div>

                <SegmentedControl value={range} onChange={setRange} />
            </div>

            {/* ── KPI Stat Cards ── */}
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 transition-opacity ${statsLoading ? 'opacity-60' : ''}`}
            >
                {STATS.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* ── Quick Actions + Sales Trend ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div>
                    <QuickActions onAction={handleNavigate} />
                </div>
                <div className="lg:col-span-2 card">
                    <div className="card-header">
                        <h3 className="card-title normal-case text-base text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
                            Sales Trend
                        </h3>
                        <button className="btn-icon text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="card-body">
                        {trendLoading ? (
                            <div className="chart-placeholder">
                                <div className="chart-placeholder-box">
                                    <span className="text-sm font-semibold text-slate-500">
                                        Loading sales trend...
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <ReportChart
                                type="scatter"
                                data={trend}
                                xKey="label"
                                yKeys={[{ name: "revenue", label: "Revenue (LKR)" }]}
                                colors={["#f47b20"]}
                                height={280}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Sales + Low Stock (2-column grid) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Recent sales — takes 2/3 width */}
                <div className="lg:col-span-2">
                    <RecentSales sales={recentSales} />
                </div>

                {/* Low stock alerts — takes 1/3 width */}
                <div>
                    <LowStockAlert items={lowStockProducts} />
                </div>
            </div>

            {/* ── Active Library Loans ── */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="card-title">Active Library Loans</h3>
                    <a
                        href="/library/borrowed"
                        className="btn-ghost-primary btn-xs"
                    >
                        View All
                    </a>
                </div>
                <div className="table-wrapper rounded-none border-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Product</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeLoans.length > 0 ? (
                                activeLoans.map((loan, i) => (
                                    <tr key={i}>
                                        <td className="font-medium text-slate-700">
                                            {loan.member}
                                        </td>
                                        <td className="text-slate-600">
                                            {loan.product}
                                        </td>
                                        <td className="text-slate-500 text-xs">
                                            {loan.due}
                                        </td>
                                        <td>
                                            <Badge
                                                variant={statusVariant(
                                                    loan.status,
                                                )}
                                                dot
                                            >
                                                {loan.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center text-slate-400 py-8"
                                    >
                                        No active loans found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Summary Footer Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                {/* Total Revenue */}
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            Monthly Revenue
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                            {formatCurrency(summary.monthlyRevenue)}
                        </p>
                    </div>
                </div>

                {/* Products Sold */}
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            Products Sold (Month)
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                            {fmt(summary.monthlyProductsSold)}
                        </p>
                    </div>
                </div>

                {/* Library Members */}
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            Library Members
                        </p>
                        <p className="text-lg font-bold text-slate-800">
                            {fmt(summary.totalLibraryMembers)}
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
