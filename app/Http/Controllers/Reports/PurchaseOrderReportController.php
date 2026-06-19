<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderReportController extends Controller
{
    public function summary(Request $request)
    {
        $query = PurchaseOrder::query();

        if ($from = $request->input('from')) {
            $query->whereDate('order_date', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('order_date', '<=', $to);
        }

        $byStatus = (clone $query)->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_cost) as total_cost'))
            ->groupBy('status')
            ->get();

        $bySupplier = (clone $query)->join('suppliers', 'suppliers.id', '=', 'purchase_orders.supplier_id')
            ->select('suppliers.name as supplier_name', DB::raw('COUNT(*) as po_count'), DB::raw('SUM(purchase_orders.total_cost) as total_spend'))
            ->groupBy('suppliers.name')
            ->orderByDesc('total_spend')
            ->get();

        $openOrders = (clone $query)->whereIn('status', ['draft', 'ordered', 'partially_received'])
            ->with('supplier:id,name')
            ->orderBy('expected_date')
            ->get(['id', 'po_number', 'supplier_id', 'status', 'order_date', 'expected_date', 'total_cost']);

        return response()->json([
            'by_status'   => $byStatus,
            'by_supplier' => $bySupplier,
            'open_orders' => $openOrders,
        ]);
    }
}
