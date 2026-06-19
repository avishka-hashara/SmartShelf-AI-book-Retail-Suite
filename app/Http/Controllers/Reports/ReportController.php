<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\OrderReturn;
use App\Models\EmployeeShift;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/ReportsPage');
    }

    public function overview(Request $request)
    {
        $from = $request->input('date_from', Carbon::today()->toDateString());
        $to = $request->input('date_to', Carbon::today()->toDateString());

        $startDate = Carbon::parse($from);
        $endDate = Carbon::parse($to);
        $diffDays = $startDate->diffInDays($endDate) + 1;

        $prevFrom = $startDate->copy()->subDays($diffDays)->toDateString();
        $prevTo = $startDate->copy()->subDays(1)->toDateString();

        // Current Period
        $sales = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->get();
        
        $totalSales = $sales->sum('total');
        $totalCost = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->sum(DB::raw('order_items.qty * products.cost_price'));
            
        $grossProfit = $totalSales - $totalCost;
        $margin = $totalSales > 0 ? ($grossProfit / $totalSales) * 100 : 0;
        
        $transactionsCount = $sales->count();
        $aov = $transactionsCount > 0 ? $totalSales / $transactionsCount : 0;
        $customersCount = $sales->pluck('customer_id')->unique()->count();

        // Previous Period
        $prevSales = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$prevFrom . ' 00:00:00', $prevTo . ' 23:59:59'])
            ->get();
            
        $prevTotalSales = $prevSales->sum('total');
        $prevTotalCost = OrderItem::whereIn('order_id', $prevSales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->sum(DB::raw('order_items.qty * products.cost_price'));
            
        $prevGrossProfit = $prevTotalSales - $prevTotalCost;
        $prevMargin = $prevTotalSales > 0 ? ($prevGrossProfit / $prevTotalSales) * 100 : 0;
        $prevTransactionsCount = $prevSales->count();
        $prevAov = $prevTransactionsCount > 0 ? $prevTotalSales / $prevTransactionsCount : 0;

        // Calculate changes
        $calcChange = fn($current, $prev) => $prev > 0 ? (($current - $prev) / $prev) * 100 : ($current > 0 ? 100 : 0);

        // Top 5 Products
        $topProducts = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->select('title', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('title')
            ->orderBy('total_qty', 'desc')
            ->limit(5)
            ->get();

        // Sales by Category
        $salesByCategory = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.category', DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('products.category')
            ->get();

        // Sales trend (Daily)
        $trend = Order::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total) as revenue'))
            ->groupBy('date')
            ->get();
            
        // Top Employee
        $topEmployee = Order::whereBetween('orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->where('orders.status', 'Completed')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->select(DB::raw("COALESCE(users.name, 'Unassigned') as name"), DB::raw('COUNT(*) as transactions'), DB::raw('SUM(orders.total) as total_sales'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_sales', 'desc')
            ->first();

        return response()->json([
            'kpis' => [
                'total_sales' => $totalSales,
                'sales_change' => $calcChange($totalSales, $prevTotalSales),
                'gross_profit' => $grossProfit,
                'profit_change' => $calcChange($grossProfit, $prevGrossProfit),
                'margin' => $margin,
                'margin_change' => $margin - $prevMargin, // Absolute point change for margin
                'aov' => $aov,
                'aov_change' => $calcChange($aov, $prevAov),
                'transactions' => $transactionsCount,
                'transactions_change' => $calcChange($transactionsCount, $prevTransactionsCount),
                'customers' => $customersCount,
            ],
            'charts' => [
                'top_products' => $topProducts,
                'sales_by_category' => $salesByCategory,
                'trend' => $trend,
            ],
            'low_stock_count' => Product::where('status', '!=', 'in_stock')->count(),
            'top_employee' => $topEmployee
        ]);
    }
}
