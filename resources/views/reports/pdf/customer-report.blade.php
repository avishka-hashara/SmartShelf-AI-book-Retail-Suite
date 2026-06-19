@extends('reports.pdf.layouts.report-pdf')

@section('content')
    <div class="executive-summary">
        <div class="summary-title">Customer & Loyalty Summary</div>
        <div class="summary-item">• Total Registered Members: {{ number_format($kpis['total_members']) }}</div>
        <div class="summary-item">• Total Loyalty Points Issued: {{ number_format($kpis['points_issued']) }}</div>
        <div class="summary-item">• Total Loyalty Points Redeemed: {{ number_format($kpis['points_redeemed']) }}</div>
    </div>

    <h3 style="font-size: 14px; margin-bottom: 10px;">Top Customers by Spend</h3>
    <table>
        <thead>
            <tr>
                <th>ID/Code</th>
                <th>Customer Name</th>
                <th class="text-right">Visits</th>
                <th class="text-right">Avg Order Value</th>
                <th class="text-right">Total Spend</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tableData as $row)
            <tr>
                <td>{{ $row['code'] }}</td>
                <td>{{ $row['name'] }}</td>
                <td class="text-right">{{ number_format($row['visits']) }}</td>
                <td class="text-right">LKR {{ number_format($row['avg_order'], 2) }}</td>
                <td class="text-right">LKR {{ number_format($row['total_spend'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
@endsection
