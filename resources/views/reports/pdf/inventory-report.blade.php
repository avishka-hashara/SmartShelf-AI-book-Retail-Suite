@extends('reports.pdf.layouts.report-pdf')

@section('content')
    <div class="executive-summary">
        <div class="summary-title">Inventory Summary</div>
        <div class="summary-item">• Total Items in Inventory: {{ number_format($kpis['total_items']) }}</div>
        <div class="summary-item">• Total Stock Quantity: {{ number_format($kpis['total_stock']) }} units</div>
        <div class="summary-item">• Total Valuation (Cost): LKR {{ number_format($kpis['total_cost_value'], 2) }}</div>
        <div class="summary-item">• Total Valuation (Retail): LKR {{ number_format($kpis['total_retail_value'], 2) }}</div>
        <div class="summary-item">• Potential Gross Profit: LKR {{ number_format($kpis['potential_profit'], 2) }}</div>
    </div>

    <h3 style="font-size: 14px; margin-bottom: 10px;">Inventory Details</h3>
    <table>
        <thead>
            <tr>
                <th>SKU/ISBN</th>
                <th>Product Name</th>
                <th>Category</th>
                <th class="text-right">Price</th>
                <th class="text-right">Stock</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tableData as $row)
            <tr>
                <td>{{ $row['sku'] }}</td>
                <td>{{ $row['name'] }}</td>
                <td>{{ $row['category'] }}</td>
                <td class="text-right">LKR {{ number_format($row['unit_price'], 2) }}</td>
                <td class="text-right">{{ number_format($row['stock_level']) }}</td>
                <td>
                    <span style="color: {{ $row['status'] == 'in_stock' ? '#10b981' : ($row['status'] == 'low_stock' ? '#f59e0b' : '#ef4444') }}">
                        {{ strtoupper(str_replace('_', ' ', $row['status'])) }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
@endsection
