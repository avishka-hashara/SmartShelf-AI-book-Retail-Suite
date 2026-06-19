@extends('reports.pdf.layouts.report-pdf')

@section('content')
    <div class="executive-summary">
        <div class="summary-title">Employee Performance Summary</div>
        <div class="summary-item">• Active Employees: {{ number_format($kpis['total_employees']) }}</div>
        <div class="summary-item">• Total Orders Processed: {{ number_format($kpis['total_orders']) }}</div>
        <div class="summary-item">• Total Revenue Generated: LKR {{ number_format($kpis['total_revenue'], 2) }}</div>
        <div class="summary-item">• Average Order Value: LKR {{ number_format($kpis['avg_order_value'], 2) }}</div>
    </div>

    <h3 style="font-size: 14px; margin-bottom: 10px;">Employee Performance Breakdown</h3>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th class="text-right">Orders</th>
                <th class="text-right">Total Sales (LKR)</th>
                <th class="text-right">Avg Order Value (LKR)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tableData as $index => $row)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $row['employee_id'] }}</td>
                <td>{{ $row['name'] }}</td>
                <td class="text-right">{{ number_format($row['transactions']) }}</td>
                <td class="text-right">{{ number_format($row['total_sales'], 2) }}</td>
                <td class="text-right">{{ number_format($row['aov'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; background: #f1f5f9; border-top: 2px solid #e2e8f0;">
                <td colspan="3">Total</td>
                <td class="text-right">{{ number_format($kpis['total_orders']) }}</td>
                <td class="text-right">{{ number_format($kpis['total_revenue'], 2) }}</td>
                <td class="text-right">{{ number_format($kpis['avg_order_value'], 2) }}</td>
            </tr>
        </tfoot>
    </table>
@endsection
