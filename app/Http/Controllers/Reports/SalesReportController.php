<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesReportController extends Controller
{
    public function byPeriod(Request $request)
    {
        $from = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', Carbon::now()->toDateString());
        $granularity = $request->input('granularity', 'daily');

        $periodExpr = match ($granularity) {
            'weekly' => 'DATE_FORMAT(created_at, "%Y-%u")',
            'monthly' => 'DATE_FORMAT(created_at, "%Y-%m")',
            default => 'DATE(created_at)',
        };

        $query = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select(DB::raw("$periodExpr as period"), DB::raw('COUNT(*) as transactions'), DB::raw('SUM(total) as revenue'))
            ->groupBy('period')
            ->get()
            ->keyBy('period');

        $costPeriodExpr = match ($granularity) {
            'weekly' => 'DATE_FORMAT(orders.created_at, "%Y-%u")',
            'monthly' => 'DATE_FORMAT(orders.created_at, "%Y-%m")',
            default => 'DATE(orders.created_at)',
        };

        $costs = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'Completed')
            ->whereBetween('orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select(DB::raw("$costPeriodExpr as period"), DB::raw('SUM(order_items.qty * products.cost_price) as cost'))
            ->groupBy('period')
            ->get()
            ->keyBy('period');

        $data = $query->map(function ($row) use ($costs) {
            $cost = (float) ($costs[$row->period]->cost ?? 0);
            $row->profit = (float) $row->revenue - $cost;
            return $row;
        })->values();

        return response()->json($data);
    }

    public function byCategory(Request $request)
    {
        $from = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', Carbon::now()->toDateString());

        $data = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'Completed')
            ->whereBetween('orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('products.category', DB::raw('SUM(order_items.qty) as qty'), DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('products.category')
            ->get();

        return response()->json($data);
    }

    public function byProduct(Request $request)
    {
        $from = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', Carbon::now()->toDateString());

        $data = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'Completed')
            ->whereBetween('orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('order_items.product_id', 'order_items.title', DB::raw('SUM(order_items.qty) as qty_sold'), DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('order_items.product_id', 'order_items.title')
            ->orderBy('revenue', 'desc')
            ->paginate(50);

        return response()->json($data);
    }

    public function byPaymentMethod(Request $request)
    {
        $from = $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('date_to', Carbon::now()->toDateString());

        $data = Order::where('status', 'Completed')
            ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as amount'))
            ->groupBy('payment_method')
            ->get();

        return response()->json($data);
    }
}
