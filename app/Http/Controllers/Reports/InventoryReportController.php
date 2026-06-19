<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryReportController extends Controller
{
    public function stockLevels(Request $request)
    {
        $status = $request->input('status');
        $category = $request->input('category');

        $query = Product::query();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $data = $query->select('name', 'sku', 'category', 'stock_level', 'low_stock_threshold', 'status', 'unit_price')
            ->orderBy('stock_level', 'asc')
            ->get();

        return response()->json($data);
    }

    public function valuation(Request $request)
    {
        $category = $request->input('category');
        
        $query = Product::query();
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        $summary = (clone $query)->select(
            DB::raw('COUNT(*) as total_items'),
            DB::raw('SUM(stock_level) as total_stock'),
            DB::raw('SUM(stock_level * cost_price) as total_cost_value'),
            DB::raw('SUM(stock_level * unit_price) as total_retail_value'),
            DB::raw('SUM(stock_level * (unit_price - cost_price)) as potential_profit')
        )->first();

        // Ensure numeric values in case of null
        $summary->total_cost_value = (float)($summary->total_cost_value ?? 0);
        $summary->total_retail_value = (float)($summary->total_retail_value ?? 0);
        $summary->potential_profit = (float)($summary->potential_profit ?? 0);

        $byCategory = Product::select('category', 
            DB::raw('SUM(stock_level * cost_price) as cost_value'),
            DB::raw('SUM(stock_level * unit_price) as retail_value')
        )->groupBy('category')->get();

        return response()->json([
            'summary' => $summary,
            'by_category' => $byCategory
        ]);
    }

    public function stockMovements(Request $request)
    {
        $query = StockMovement::with(['product:id,name,sku', 'user:id,name'])->latest();

        if ($productId = $request->input('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        return response()->json($query->paginate(20));
    }
}
