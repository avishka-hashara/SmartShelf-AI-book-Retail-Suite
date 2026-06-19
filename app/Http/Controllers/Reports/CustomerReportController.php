<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerReportController extends Controller
{
    public function topCustomers(Request $request)
    {
        $data = Order::leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
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
            ->limit(20)
            ->get();

        return response()->json($data);
    }

    public function loyaltyStats(Request $request)
    {
        $totalMembers = Customer::count();
        $activeMembers = Customer::where('status', 'active')->count();
        $totalPoints = Customer::sum('loyalty_pts') ?? 0;
        
        // Calculate retention (New vs Returning based on total_purchases or order counts)
        $returningCount = Customer::where('total_purchases', '>', 1)->count();
        $newCount = Customer::where('total_purchases', 1)->count();

        // Calculate percentages
        $totalWithPurchases = $returningCount + $newCount;
        $returningPct = $totalWithPurchases > 0 ? round(($returningCount / $totalWithPurchases) * 100) : 0;
        $newPct = $totalWithPurchases > 0 ? round(($newCount / $totalWithPurchases) * 100) : 0;

        // Calculate Loyalty ROI
        $memberAvgSpend = Order::whereNotNull('customer_id')->where('status', 'Completed')->avg('total') ?? 0;
        $nonMemberAvgSpend = Order::whereNull('customer_id')->where('status', 'Completed')->avg('total') ?? 0;

        $roiMultiplier = $nonMemberAvgSpend > 0 ? ($memberAvgSpend / $nonMemberAvgSpend) : 1;
        $roiPercentage = max(0, ($roiMultiplier - 1) * 100);

        return response()->json([
            'kpis' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'points_issued' => $totalPoints,
                'points_redeemed' => 0, // Needs a redemptions table, defaulting to 0
            ],
            'retention' => [
                ['name' => 'Returning', 'value' => $returningPct],
                ['name' => 'New', 'value' => $newPct],
            ],
            'roi' => [
                'multiplier' => round($roiMultiplier, 1),
                'percentage' => round($roiPercentage)
            ]
        ]);
    }
}
