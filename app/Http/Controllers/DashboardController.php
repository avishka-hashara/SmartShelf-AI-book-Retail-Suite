<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\LibraryLoan;
use App\Models\LibraryMember;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Resolve [currentStart, currentEnd, previousStart, previousEnd] for a
     * dashboard range key. Each period is a full calendar bucket (day/week/
     * month) so "current" and "previous" are directly comparable.
     */
    private function periodBounds(string $range): array
    {
        $now = Carbon::now();

        return match ($range) {
            'Week' => [
                $now->copy()->startOfWeek(), $now->copy()->endOfWeek(),
                $now->copy()->subWeek()->startOfWeek(), $now->copy()->subWeek()->endOfWeek(),
            ],
            'Month' => [
                $now->copy()->startOfMonth(), $now->copy()->endOfMonth(),
                $now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth(),
            ],
            default => [
                $now->copy()->startOfDay(), $now->copy()->endOfDay(),
                $now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay(),
            ],
        };
    }

    /**
     * Sales/orders KPI figures for a given range (Today/Week/Month), with a
     * percentage change against the equivalent previous period.
     */
    private function salesAndOrderStats(string $range): array
    {
        [$start, $end, $prevStart, $prevEnd] = $this->periodBounds($range);

        $sales = Order::whereBetween('created_at', [$start, $end])
            ->whereIn('status', ['Completed', 'Pending'])
            ->sum('total');

        $transactions = Order::whereBetween('created_at', [$start, $end])
            ->whereIn('status', ['Completed', 'Pending'])
            ->count();

        $prevSales = Order::whereBetween('created_at', [$prevStart, $prevEnd])
            ->whereIn('status', ['Completed', 'Pending'])
            ->sum('total');

        $salesChange = $prevSales > 0
            ? round((($sales - $prevSales) / $prevSales) * 100)
            : ($sales > 0 ? 100 : 0);

        $orders = Order::whereBetween('created_at', [$start, $end])->count();
        $pendingOrders = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'Pending')
            ->count();

        $prevOrders = Order::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $ordersChange = $prevOrders > 0
            ? round((($orders - $prevOrders) / $prevOrders) * 100)
            : ($orders > 0 ? 100 : 0);

        return [
            'sales'         => $sales,
            'transactions'  => $transactions,
            'salesChange'   => $salesChange,
            'orders'        => $orders,
            'pendingOrders' => $pendingOrders,
            'ordersChange'  => $ordersChange,
        ];
    }

    /**
     * JSON endpoint backing the Today/Week/Month segmented control on the
     * dashboard — only the time-scoped sales & orders figures change here;
     * stock levels and active borrowers are current-state snapshots.
     */
    public function stats(Request $request)
    {
        $range = in_array($request->query('range'), ['Week', 'Month'], true)
            ? $request->query('range')
            : 'Today';

        $period = $this->salesAndOrderStats($range);

        $totalStock = Product::sum('stock_level');
        $lowStockCount = Product::whereIn('status', ['low_stock', 'out_of_stock'])->count();

        $activeBorrowers = LibraryLoan::active()
            ->distinct('library_member_id')
            ->count('library_member_id');

        $overdueLoans = LibraryLoan::where('status', 'active')
            ->where('due_date', '<', Carbon::today())
            ->count();

        return response()->json([
            'range'            => $range,
            'todaySales'       => $period['sales'],
            'todayTransactions' => $period['transactions'],
            'salesChange'      => $period['salesChange'],
            'todayOrders'      => $period['orders'],
            'pendingOrders'    => $period['pendingOrders'],
            'ordersChange'     => $period['ordersChange'],
            'totalStock'       => $totalStock,
            'lowStockCount'    => $lowStockCount,
            'activeBorrowers'  => $activeBorrowers,
            'overdueLoans'     => $overdueLoans,
        ]);
    }

    public function index()
    {
        $today    = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $yesterday  = Carbon::yesterday();
        $lastMonth  = Carbon::now()->subMonth();

        $todayStats = $this->salesAndOrderStats('Today');
        $todaySales = $todayStats['sales'];
        $todayTransactions = $todayStats['transactions'];
        $salesChange = $todayStats['salesChange'];
        $todayOrders = $todayStats['orders'];
        $pendingOrders = $todayStats['pendingOrders'];
        $ordersChange = $todayStats['ordersChange'];

        // ── Products in Stock ──
        $totalStock = Product::sum('stock_level');
        $lowStockCount = Product::where('status', 'low_stock')
            ->orWhere('status', 'out_of_stock')
            ->count();

        // ── Active Borrowers (Library) ──
        $activeBorrowers = LibraryLoan::active()
            ->distinct('library_member_id')
            ->count('library_member_id');

        $overdueLoans = LibraryLoan::where('status', 'active')
            ->where('due_date', '<', $today)
            ->count();

        // Update any active loans that are actually overdue
        LibraryLoan::where('status', 'active')
            ->where('due_date', '<', $today)
            ->update(['status' => 'overdue']);

        // ── Recent Sales (last 10) ──
        $recentSales = Order::with('items')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (Order $o) => [
                'id'       => $o->order_number ?? 'ORD-' . str_pad($o->id, 4, '0', STR_PAD_LEFT),
                'customer' => $o->customer_name ?? $o->customer?->name ?? 'Walk-in Customer',
                'items'    => $o->items->count(),
                'total'    => (float) $o->total,
                'status'   => ucfirst($o->status),
                'time'     => $o->created_at->setTimezone('Asia/Colombo')->format('g:i A'),
            ]);

        // ── Low Stock Products (top 10) ──
        $lowStockProducts = Product::needsAttention()
            ->take(10)
            ->get()
            ->map(fn (Product $p) => [
                'product'   => $p->name,
                'stock'     => $p->stock_level,
                'threshold' => $p->low_stock_threshold,
            ]);

        // ── Active Library Loans ──
        $activeLibraryLoans = LibraryLoan::with(['member', 'book'])
            ->active()
            ->orderBy('due_date')
            ->take(10)
            ->get()
            ->map(fn (LibraryLoan $l) => [
                'member'  => $l->member->name ?? 'Unknown',
                'product' => $l->book->title ?? 'Unknown',
                'due'     => $l->due_date->format('Y-m-d'),
                'status'  => $l->due_date->isPast() ? 'Overdue' : 'Active',
            ]);

        // ── Monthly Summary ──
        $monthlyRevenue = Order::where('created_at', '>=', $monthStart)
            ->whereIn('status', ['Completed', 'Pending'])
            ->sum('total');

        $monthlyProductsSold = OrderItem::whereHas('order', function ($q) use ($monthStart) {
            $q->where('created_at', '>=', $monthStart)
              ->whereIn('status', ['Completed', 'Pending']);
        })->sum('qty');

        $totalLibraryMembers = LibraryMember::where('status', 'active')->count();

        // ── Previous month for comparison ──
        $lastMonthRevenue = Order::whereBetween('created_at', [
            $lastMonth->copy()->startOfMonth(),
            $lastMonth->copy()->endOfMonth(),
        ])->whereIn('status', ['Completed', 'Pending'])->sum('total');

        return Inertia::render('Dashboard/Dashboard', [
            'stats' => [
                'todaySales'       => $todaySales,
                'todayTransactions' => $todayTransactions,
                'salesChange'      => $salesChange,
                'todayOrders'      => $todayOrders,
                'pendingOrders'    => $pendingOrders,
                'ordersChange'     => $ordersChange,
                'totalStock'       => $totalStock,
                'lowStockCount'    => $lowStockCount,
                'activeBorrowers'  => $activeBorrowers,
                'overdueLoans'     => $overdueLoans,
            ],
            'recentSales'       => $recentSales,
            'lowStockProducts'  => $lowStockProducts,
            'activeLoans'       => $activeLibraryLoans,
            'summary' => [
                'monthlyRevenue'      => $monthlyRevenue,
                'lastMonthRevenue'    => $lastMonthRevenue,
                'monthlyProductsSold' => $monthlyProductsSold,
                'totalLibraryMembers' => $totalLibraryMembers,
            ],
        ]);
    }
}
