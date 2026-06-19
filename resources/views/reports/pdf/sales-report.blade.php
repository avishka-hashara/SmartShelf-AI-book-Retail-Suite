@extends('reports.pdf.layouts.report-pdf')

@section('content')
    <div class="executive-summary">
        <div class="summary-title">Executive Summary</div>
        <div class="summary-item">• Total revenue for the period: LKR {{ number_format($kpis['total_sales'], 2) }}</div>
        <div class="summary-item">• Gross Profit: LKR {{ number_format($kpis['gross_profit'], 2) }} ({{ number_format($kpis['margin'], 1) }}% margin)</div>
        <div class="summary-item">• Average Order Value: LKR {{ number_format($kpis['aov'], 2) }}</div>
        <div class="summary-item">• Total transactions processed: {{ number_format($kpis['transactions']) }}</div>
    </div>

    @foreach($sections as $key => $section)
        <div class="section-title">{{ $section['title'] }}</div>

        {{-- Simple CSS Chart (Only for summary sections, not audit logs) --}}
        @if($key !== 'ledger')
            <div class="chart-container">
                @php
                    $maxValue = collect($section['data'])->max('value') ?: 1;
                @endphp
                @foreach($section['data'] as $row)
                    @php
                        $percentage = ($row['value'] / $maxValue) * 100;
                        // Limit chart display to first 10 items to keep it readable
                        if ($loop->index >= 10) break;
                    @endphp
                    <div class="chart-row">
                        <span class="chart-label">{{ Str::limit($row['label'], 25) }}</span>
                        <div class="chart-track">
                            <div class="chart-fill" style="width: {{ $percentage }}%"></div>
                        </div>
                        <span class="chart-value">{{ number_format($row['value'], 0) }}</span>
                    </div>
                @endforeach
            </div>
        @endif

        {{-- Data Table --}}
        <table>
            <thead>
                <tr>
                    @if($key === 'ledger')
                        <th>Date & Order #</th>
                        <th>Item description</th>
                    @else
                        <th>{{ $key === 'product' ? 'Item Name' : ($key === 'period' ? 'Date' : 'Category/Type') }}</th>
                    @endif
                    <th class="text-right">{{ ($key === 'product' || $key === 'ledger' || $key === 'category') ? 'Units/Qty' : 'Orders' }}</th>
                    <th class="text-right">Revenue (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($section['data'] as $row)
                <tr>
                    @if($key === 'ledger')
                        <td style="font-size: 8px;">
                            <div style="font-weight: bold;">#{{ $row['order_no'] }}</div>
                            <div>{{ Carbon\Carbon::parse($row['period'])->format('d/M/Y H:i') }}</div>
                        </td>
                        <td>{{ $row['label'] }}</td>
                    @else
                        <td>{{ $row['label'] }}</td>
                    @endif
                    <td class="text-right">{{ number_format($row['count']) }}</td>
                    <td class="text-right">{{ number_format($row['value'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr style="font-weight: bold; background: #f8fafc;">
                    <td colspan="1">TOTAL</td>
                    @if($key === 'ledger') <td></td> @endif
                    <td class="text-right">{{ number_format(collect($section['data'])->sum('count')) }}</td>
                    <td class="text-right">LKR {{ number_format(collect($section['data'])->sum('value'), 2) }}</td>
                </tr>
            </tfoot>
        </table>

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
@endsection
