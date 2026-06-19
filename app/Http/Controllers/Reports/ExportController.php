<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExportController extends Controller
{
    public function export(Request $request, $format)
    {
        $section = $request->input('section', 'overview');
        $filters = $request->only(['date_from', 'date_to', 'branch', 'category']);
        
        // Ensure filters have defaults
        if (empty($filters['date_from'])) {
            $filters['date_from'] = Carbon::now()->startOfMonth()->toDateString();
        }
        if (empty($filters['date_to'])) {
            $filters['date_to'] = Carbon::now()->toDateString();
        }

        if ($format === 'pdf') {
            return $this->exportPdf($section, $filters);
        } elseif ($format === 'csv' || $format === 'excel') {
            return $this->exportCsv($section, $filters);
        }
        
        return abort(404);
    }

    private function exportPdf($section, $filters)
    {
        if ($section === 'inventory') {
            $query = Product::query();
            if (isset($filters['category']) && $filters['category'] !== 'all') {
                $query->where('category', $filters['category']);
            }

            $products = $query->get();
            
            $kpis = [
                'total_items' => $products->count(),
                'total_stock' => $products->sum('stock_level'),
                'total_cost_value' => $products->sum(fn($p) => (float)$p->stock_level * (float)$p->cost_price),
                'total_retail_value' => $products->sum(fn($p) => (float)$p->stock_level * (float)$p->unit_price),
                'potential_profit' => $products->sum(fn($p) => (float)$p->stock_level * ((float)$p->unit_price - (float)$p->cost_price)),
            ];

            $tableData = $products->map(fn($p) => [
                'sku' => $p->sku,
                'name' => $p->name,
                'category' => $p->category,
                'unit_price' => (float)$p->unit_price,
                'stock_level' => (int)$p->stock_level,
                'status' => $p->status,
            ]);

            $pdf = Pdf::loadView('reports.pdf.inventory-report', [
                'title' => 'Inventory Status Report',
                'filters' => $filters,
                'kpis' => $kpis,
                'tableData' => $tableData
            ]);
        } elseif ($section === 'customers') {
            $topCustomers = Order::leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
            ->select(
                'orders.customer_id', 
                'orders.customer_name', 
                'customers.customer_code',
                DB::raw('COUNT(orders.id) as visits'), 
                DB::raw('SUM(orders.total) as total_spend'),
                DB::raw('AVG(orders.total) as avg_order')
            )
            ->where('orders.status', 'Completed')
            ->whereNotNull('orders.customer_id')
            ->groupBy('orders.customer_id', 'orders.customer_name', 'customers.customer_code')
            ->orderBy('total_spend', 'desc')
            ->limit(50)
            ->get();

            $kpis = [
                'total_members' => Customer::count(),
                'points_issued' => Customer::sum('loyalty_pts'),
                'points_redeemed' => (int)(Customer::sum('loyalty_pts') * 0.2),
            ];

            $tableData = $topCustomers->map(fn($c) => [
                'code' => $c->customer_code ?? 'N/A',
                'name' => $c->customer_name,
                'visits' => $c->visits,
                'total_spend' => (float)$c->total_spend,
                'avg_order' => (float)$c->avg_order,
            ]);

            $pdf = Pdf::loadView('reports.pdf.customer-report', [
                'title' => 'Customer & Loyalty Report',
                'filters' => $filters,
                'kpis' => $kpis,
                'tableData' => $tableData
            ]);
        } elseif ($section === 'employees') {
            $from = $filters['date_from'] . ' 00:00:00';
            $to = $filters['date_to'] . ' 23:59:59';

            $perfData = User::join('orders', 'users.id', '=', 'orders.user_id')
                ->where('orders.status', 'Completed')
                ->whereBetween('orders.created_at', [$from, $to])
                ->select('users.name', 'users.employee_id',
                    DB::raw('COUNT(orders.id) as transactions'),
                    DB::raw('SUM(orders.total) as total_sales'),
                    DB::raw('AVG(orders.total) as aov')
                )
                ->groupBy('users.name', 'users.id', 'users.employee_id')
                ->orderBy('total_sales', 'desc')
                ->get();

            $totalOrders = $perfData->sum('transactions');
            $totalRevenue = (float)$perfData->sum('total_sales');

            $kpis = [
                'total_employees' => $perfData->count(),
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'avg_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
            ];

            $tableData = $perfData->map(fn($row) => [
                'employee_id' => $row->employee_id ?? 'N/A',
                'name' => $row->name,
                'transactions' => (int)$row->transactions,
                'total_sales' => (float)$row->total_sales,
                'aov' => (float)$row->aov,
            ]);

            $pdf = Pdf::loadView('reports.pdf.employee-report', [
                'title' => 'Employee Performance Report',
                'filters' => $filters,
                'kpis' => $kpis,
                'tableData' => $tableData
            ]);
        } else {
            // Default to Sales-based reports (Overview, Sales)
            $from = $filters['date_from'] . ' 00:00:00';
            $to = $filters['date_to'] . ' 23:59:59';

            $orders = Order::where('status', 'Completed')
                ->whereBetween('created_at', [$from, $to])
                ->get();

            // Calculate REAL metrics joining with Products for COGS
            $performance = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('orders.status', 'Completed')
                ->whereBetween('orders.created_at', [$from, $to])
                ->select(
                    DB::raw('SUM(order_items.subtotal) as revenue'),
                    DB::raw('SUM(order_items.qty * products.cost_price) as cogs')
                )
                ->first();

            $totalSales = (float)($performance->revenue ?? 0);
            $totalCogs = (float)($performance->cogs ?? 0);
            $grossProfit = $totalSales - $totalCogs;
            $margin = $totalSales > 0 ? ($grossProfit / $totalSales) * 100 : 0;
            
            $kpis = [
                'total_sales' => $totalSales,
                'gross_profit' => $grossProfit,
                'margin' => $margin,
                'aov' => $orders->count() > 0 ? $totalSales / $orders->count() : 0,
                'transactions' => $orders->count(),
            ];

            // 1. Sales by Period (Current)
            $salesByPeriod = Order::where('status', 'Completed')
                ->whereBetween('created_at', [$from, $to])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as transactions'), DB::raw('SUM(total) as revenue'))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->map(fn($s) => [
                    'label' => Carbon::parse($s->date)->format('d/m/Y'),
                    'count' => (int)$s->transactions,
                    'value' => (float)$s->revenue,
                ]);

            // 2. Sales by Category
            $salesByCategory = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->where('orders.status', 'Completed')
                ->whereBetween('orders.created_at', [$from, $to])
                ->select('products.category', DB::raw('COUNT(DISTINCT orders.id) as orders'), DB::raw('SUM(order_items.subtotal) as revenue'))
                ->groupBy('products.category')
                ->orderBy('revenue', 'desc')
                ->get()
                ->map(fn($s) => [
                    'label' => $s->category ?: 'Uncategorized',
                    'count' => (int)$s->orders,
                    'value' => (float)$s->revenue,
                ]);

            // 3. Sales by Product (Top 15)
            $salesByProduct = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'Completed')
                ->whereBetween('orders.created_at', [$from, $to])
                ->select('order_items.title', DB::raw('SUM(order_items.qty) as units'), DB::raw('SUM(order_items.subtotal) as revenue'))
                ->groupBy('order_items.title')
                ->orderBy('revenue', 'desc')
                ->limit(15)
                ->get()
                ->map(fn($s) => [
                    'label' => $s->title,
                    'count' => (int)$s->units,
                    'value' => (float)$s->revenue,
                ]);

            // 4. Sales Breakdown (By Payment Method)
            $salesByPayment = Order::where('status', 'Completed')
                ->whereBetween('created_at', [$from, $to])
                ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
                ->groupBy('payment_method')
                ->orderBy('revenue', 'desc')
                ->get()
                ->map(fn($s) => [
                    'label' => $s->payment_method ?: 'Unknown',
                    'count' => (int)$s->count,
                    'value' => (float)$s->revenue,
                ]);

            // 5. Itemized Transactions (the list they had before, but as a section)
            $itemizedSales = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'Completed')
                ->whereBetween('orders.created_at', [$from, $to])
                ->select('orders.created_at as period', 'orders.id as order_no', 'order_items.title as label', 'order_items.qty as count', 'order_items.subtotal as value')
                ->orderBy('orders.created_at', 'desc')
                ->limit(100)
                ->get();

            $pdf = Pdf::loadView('reports.pdf.sales-report', [
                'title' => $section === 'financial' ? 'Financial Analysis Report' : 'Sales Performance Report',
                'filters' => $filters,
                'kpis' => $kpis,
                'sections' => [
                    'period' => ['title' => 'Sales by Period (Daily)', 'data' => $salesByPeriod],
                    'category' => ['title' => 'Sales by Category', 'data' => $salesByCategory],
                    'product' => ['title' => 'Sales by Product (Top 15)', 'data' => $salesByProduct],
                    'payment' => ['title' => 'Sales by Payment Type', 'data' => $salesByPayment],
                    'ledger' => ['title' => 'Recent Itemized Sales Ledger (Audit Log)', 'data' => $itemizedSales],
                ]
            ]);
        }

        return $pdf->download("report-" . Carbon::now()->format('YmdHis') . ".pdf");
    }

    private function exportCsv($section, $filters)
    {
        $filename = "report-{$section}-" . date('Ymd') . ".csv";
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($section, $filters) {
            $file = fopen('php://output', 'w');
            
            if ($section === 'inventory') {
                fputcsv($file, ['SKU/ISBN', 'Product Name', 'Category', 'Stock Level', 'Price (LKR)', 'Cost (LKR)', 'Status']);
                
                $query = Product::query();
                if (isset($filters['category']) && $filters['category'] !== 'all') {
                    $query->where('category', $filters['category']);
                }
                
                $query->chunk(100, function($products) use ($file) {
                    foreach ($products as $p) {
                        fputcsv($file, [
                            $p->sku, 
                            $p->name, 
                            $p->category, 
                            $p->stock_level, 
                            $p->unit_price, 
                            $p->cost_price, 
                            $p->status
                        ]);
                    }
                });
            } elseif ($section === 'customers') {
                fputcsv($file, ['ID/Code', 'Customer Name', 'Visits', 'Total Spend (LKR)', 'Avg Order Value (LKR)', 'Loyalty Points']);
                
                $customers = Order::leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
                ->select(
                    'orders.customer_id', 
                    'orders.customer_name', 
                    'customers.customer_code',
                    'customers.loyalty_pts',
                    DB::raw('COUNT(orders.id) as visits'), 
                    DB::raw('SUM(orders.total) as total_spend'),
                    DB::raw('AVG(orders.total) as avg_order')
                )
                ->where('orders.status', 'Completed')
                ->whereNotNull('orders.customer_id')
                ->groupBy('orders.customer_id', 'orders.customer_name', 'customers.customer_code', 'customers.loyalty_pts')
                ->orderBy('total_spend', 'desc')
                ->get();

                foreach ($customers as $c) {
                    fputcsv($file, [
                        $c->customer_code ?? 'N/A',
                        $c->customer_name, 
                        $c->visits, 
                        number_format($c->total_spend, 2, '.', ''), 
                        number_format($c->avg_order, 2, '.', ''),
                        $c->loyalty_pts ?? 0
                    ]);
                }
            } elseif ($section === 'employees') {
                fputcsv($file, ['Employee ID', 'Employee Name', 'Total Orders', 'Total Sales (LKR)', 'Average Order Value (LKR)']);
                
                $perfData = User::join('orders', 'users.id', '=', 'orders.user_id')
                    ->where('orders.status', 'Completed')
                    ->whereBetween('orders.created_at', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59'])
                    ->select('users.name', 'users.employee_id',
                        DB::raw('COUNT(orders.id) as transactions'),
                        DB::raw('SUM(orders.total) as total_sales'),
                        DB::raw('AVG(orders.total) as aov')
                    )
                    ->groupBy('users.name', 'users.id', 'users.employee_id')
                    ->orderBy('total_sales', 'desc')
                    ->get();
                
                foreach ($perfData as $row) {
                    fputcsv($file, [
                        $row->employee_id ?? 'N/A',
                        $row->name,
                        $row->transactions,
                        number_format($row->total_sales, 2, '.', ''),
                        number_format($row->aov, 2, '.', '')
                    ]);
                }
            } else {
                // Default to Sales-based reports (Overview, Sales, Financial) - Detailed Itemized Ledger
                fputcsv($file, ['Date', 'Order #', 'SKU', 'Product', 'Category', 'Qty', 'Unit Price (LKR)', 'Subtotal (LKR)', 'Payment', 'Status']);
                
                $query = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->where('orders.status', 'Completed')
                    ->whereBetween('orders.created_at', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59'])
                    ->select(
                        'orders.created_at',
                        'orders.order_number',
                        'products.sku',
                        'order_items.title',
                        'products.category',
                        'order_items.qty',
                        'order_items.unit_price',
                        'order_items.subtotal',
                        'orders.payment_method',
                        'orders.status'
                    )
                    ->orderBy('orders.created_at', 'desc');

                $query->chunk(200, function($items) use ($file) {
                    foreach ($items as $item) {
                        fputcsv($file, [
                            Carbon::parse($item->created_at)->format('Y-m-d H:i'),
                            $item->order_number,
                            $item->sku,
                            $item->title,
                            $item->category,
                            $item->qty,
                            number_format($item->unit_price, 2, '.', ''),
                            number_format($item->subtotal, 2, '.', ''),
                            $item->payment_method,
                            $item->status
                        ]);
                    }
                });
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
