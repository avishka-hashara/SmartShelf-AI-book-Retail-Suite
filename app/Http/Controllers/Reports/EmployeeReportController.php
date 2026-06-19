<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeReportController extends Controller
{
    public function performance(Request $request)
    {
        $from = $request->input('date_from', now()->toDateString());
        $to = $request->input('date_to', now()->toDateString());

        $data = User::join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'Completed')
            ->whereBetween('orders.created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
            ->select('users.name', 'users.employee_id',
                DB::raw('COUNT(orders.id) as transactions'),
                DB::raw('SUM(orders.total) as total_sales'),
                DB::raw('AVG(orders.total) as aov')
            )
            ->groupBy('users.name', 'users.id', 'users.employee_id')
            ->orderBy('total_sales', 'desc')
            ->get();

        return response()->json($data);
    }
}
