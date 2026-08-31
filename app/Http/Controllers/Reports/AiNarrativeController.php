<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\AI\OpenRouterService;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AiNarrativeController extends Controller
{
    public function __construct(private OpenRouterService $ai) {}

    public function generate(Request $request): \Illuminate\Http\JsonResponse
    {
        $section  = $request->input('section', 'overview');
        $from     = $request->input('date_from', Carbon::today()->toDateString());
        $to       = $request->input('date_to', Carbon::today()->toDateString());

        $systemPrompt = 'You are a smart retail analytics assistant for a bookshop POS system in Sri Lanka. '
            . 'Write exactly 2–3 fluent, concise sentences analysing the data. '
            . 'Use LKR for currency. Be specific with numbers. Do not use markdown, bullet points, or headers. '
            . 'Highlight the most important insight and one actionable recommendation.';

        $userPrompt = match ($section) {
            'sales'     => $this->buildSalesPrompt($from, $to),
            'inventory' => $this->buildInventoryPrompt($from, $to),
            'customers' => $this->buildCustomerPrompt($from, $to),
            default     => $this->buildOverviewPrompt($from, $to),
        };

        $narrative = $this->ai->chat($systemPrompt, $userPrompt);

        if (empty($narrative)) {
            $narrative = $this->fallbackNarrative($section);
        }

        return response()->json(['narrative' => trim($narrative)]);
    }

    // ── Data builders ──────────────────────────────────────────────────────────

    private function buildOverviewPrompt(string $from, string $to): string
    {
        $sales = Order::where('status', 'Completed')
            ->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->get();

        $totalSales = $sales->sum('total');
        $txCount    = $sales->count();
        $aov        = $txCount > 0 ? round($totalSales / $txCount, 2) : 0;

        $totalCost = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->sum(DB::raw('order_items.qty * products.cost_price'));

        $grossProfit = $totalSales - $totalCost;
        $margin      = $totalSales > 0 ? round(($grossProfit / $totalSales) * 100, 1) : 0;

        $topCat = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.category', DB::raw('SUM(order_items.subtotal) as revenue'))
            ->groupBy('products.category')
            ->orderByDesc('revenue')
            ->first();

        $topProduct = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->select('title', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as revenue'))
            ->groupBy('title')
            ->orderByDesc('revenue')
            ->first();

        $lowStock = Product::where('status', '!=', 'in_stock')->count();

        return "Period: $from to $to. "
            . "Total sales: LKR " . number_format($totalSales, 2) . " across $txCount transactions. "
            . "Gross profit: LKR " . number_format($grossProfit, 2) . " (margin: {$margin}%). "
            . "Average order value: LKR " . number_format($aov, 2) . ". "
            . ($topCat ? "Best category: {$topCat->category} with LKR " . number_format($topCat->revenue, 2) . " revenue. " : '')
            . ($topProduct ? "Top product: {$topProduct->title} — {$topProduct->total_qty} units, LKR " . number_format($topProduct->revenue, 2) . ". " : '')
            . "Low/out-of-stock items: $lowStock. "
            . "Write a 2–3 sentence executive summary for the store owner.";
    }

    private function buildSalesPrompt(string $from, string $to): string
    {
        $sales = Order::where('status', 'Completed')
            ->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->get();

        $totalSales = $sales->sum('total');
        $txCount    = $sales->count();
        $aov        = $txCount > 0 ? round($totalSales / $txCount, 2) : 0;

        $byCategory = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.category', DB::raw('SUM(order_items.subtotal) as revenue'), DB::raw('SUM(order_items.qty) as qty'))
            ->groupBy('products.category')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn($r) => "{$r->category}: LKR " . number_format($r->revenue, 2) . " ({$r->qty} units)")
            ->implode(', ');

        $topProduct = OrderItem::whereIn('order_id', $sales->pluck('id'))
            ->select('title', DB::raw('SUM(qty) as total_qty'), DB::raw('SUM(subtotal) as revenue'))
            ->groupBy('title')
            ->orderByDesc('revenue')
            ->first();

        $paymentSplit = Order::where('status', 'Completed')
            ->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as amount'))
            ->groupBy('payment_method')
            ->get()
            ->map(fn($r) => "{$r->payment_method}: {$r->count} txns (LKR " . number_format($r->amount, 2) . ")")
            ->implode(', ');

        return "Sales period: $from to $to. "
            . "Total revenue: LKR " . number_format($totalSales, 2) . " from $txCount transactions. "
            . "Average order: LKR " . number_format($aov, 2) . ". "
            . "Sales by category: $byCategory. "
            . ($topProduct ? "Best-selling product: {$topProduct->title} — {$topProduct->total_qty} units, LKR " . number_format($topProduct->revenue, 2) . ". " : '')
            . "Payment methods: $paymentSplit. "
            . "Write a 2–3 sentence sales performance analysis.";
    }

    private function buildInventoryPrompt(string $from, string $to): string
    {
        $totalProducts   = Product::count();
        $inStock         = Product::where('status', 'in_stock')->count();
        $lowStock        = Product::where('status', 'low_stock')->count();
        $outOfStock      = Product::where('status', 'out_of_stock')->count();
        $totalCostValue  = Product::sum(DB::raw('stock_level * cost_price'));
        $totalRetailValue = Product::sum(DB::raw('stock_level * price'));

        $topStocked = Product::orderByDesc('stock_level')->first();

        $byCategory = Product::select('category', DB::raw('SUM(stock_level) as total_stock'), DB::raw('SUM(stock_level * price) as retail_value'))
            ->groupBy('category')
            ->orderByDesc('retail_value')
            ->get()
            ->map(fn($r) => "{$r->category}: {$r->total_stock} units (LKR " . number_format($r->retail_value, 2) . ")")
            ->implode(', ');

        return "Inventory snapshot as of $to. "
            . "Total products: $totalProducts — in stock: $inStock, low stock: $lowStock, out of stock: $outOfStock. "
            . "Total cost value: LKR " . number_format($totalCostValue, 2) . ". "
            . "Total retail value: LKR " . number_format($totalRetailValue, 2) . ". "
            . "Stock by category: $byCategory. "
            . ($topStocked ? "Highest stocked item: {$topStocked->name} with {$topStocked->stock_level} units. " : '')
            . "Write a 2–3 sentence inventory health assessment.";
    }

    private function buildCustomerPrompt(string $from, string $to): string
    {
        $totalCustomers = Customer::count();
        $activeCustomers = Order::where('status', 'Completed')
            ->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $topCustomer = Order::where('status', 'Completed')
            ->whereBetween('orders.created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->whereNotNull('orders.customer_id')
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->select('customers.name', DB::raw('COUNT(*) as visits'), DB::raw('SUM(orders.total) as total_spend'))
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total_spend')
            ->first();

        $avgSpend = Order::where('status', 'Completed')
            ->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"])
            ->whereNotNull('customer_id')
            ->avg('total');

        $totalLoyaltyPts = DB::table('customers')->sum('loyalty_points');

        return "Customer period: $from to $to. "
            . "Total customers in database: $totalCustomers. "
            . "Active buyers this period: $activeCustomers. "
            . "Average spend per visit: LKR " . number_format($avgSpend ?? 0, 2) . ". "
            . ($topCustomer ? "Top customer: {$topCustomer->name} with {$topCustomer->visits} visits and LKR " . number_format($topCustomer->total_spend, 2) . " spent. " : '')
            . "Total loyalty points outstanding: " . number_format($totalLoyaltyPts) . ". "
            . "Write a 2–3 sentence customer loyalty and engagement analysis.";
    }

    // ── Fallback ───────────────────────────────────────────────────────────────

    private function fallbackNarrative(string $section): string
    {
        return match ($section) {
            'sales'     => 'AI narrative is temporarily unavailable — check your OpenRouter API key in Settings. Your sales data is displayed in the charts and tables below.',
            'inventory' => 'AI narrative is temporarily unavailable. Review your stock levels in the tables below to identify items needing replenishment.',
            'customers' => 'AI narrative is temporarily unavailable. Customer activity is summarised in the tables below.',
            default     => 'AI narrative is temporarily unavailable — check your OpenRouter API key in Settings. Your key business metrics are shown in the KPI cards above.',
        };
    }
}
