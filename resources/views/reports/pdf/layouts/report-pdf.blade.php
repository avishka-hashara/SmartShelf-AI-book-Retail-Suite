<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 2cm; }
        body { font-family: 'Helvetica', sans-serif; color: #334155; line-height: 1.5; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .report-title { font-size: 18px; color: #1e293b; margin-top: 5px; }
        .meta { font-size: 10px; color: #64748b; margin-top: 5px; }
        
        .kpi-grid { display: block; margin-bottom: 20px; }
        .kpi-card { display: inline-block; width: 30%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-right: 2%; }
        .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; }
        .kpi-value { font-size: 16px; font-weight: bold; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; color: #64748b; }
        td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
        tr:nth-child(even) { background: #fdfdfd; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: 0; width: 100%; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
        
        .executive-summary { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .summary-title { font-weight: bold; margin-bottom: 5px; font-size: 12px; }
        .summary-item { font-size: 11px; margin-bottom: 3px; }

        .section-title { font-size: 14px; font-weight: bold; margin: 30px 0 10px 0; border-left: 4px solid #4f46e5; padding-left: 10px; color: #1e293b; }
        .chart-container { margin-top: 10px; margin-bottom: 20px; padding: 10px; border: 1px solid #f1f5f9; border-radius: 8px; }
        .chart-row { margin-bottom: 5px; font-size: 9px; }
        .chart-label { display: inline-block; width: 25%; vertical-align: middle; }
        .chart-track { display: inline-block; width: 60%; height: 12px; background: #f1f5f9; border-radius: 2px; vertical-align: middle; position: relative; }
        .chart-fill { height: 100%; background: #4f46e5; border-radius: 2px; }
        .chart-value { display: inline-block; width: 10%; margin-left: 2%; vertical-align: middle; font-weight: bold; text-align: right; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BookShop POS</div>
        <div class="report-title">{{ $title }}</div>
        <div class="meta">
            Period: {{ $filters['date_from'] }} to {{ $filters['date_to'] }} | 
            Generated: {{ now()->format('d/m/Y H:i') }} | 
            By: {{ auth()->user()->name ?? 'System' }}
        </div>
    </div>

    @yield('content')

    <div class="footer">
        <table style="border: none; margin: 0;">
            <tr>
                <td style="border: none; padding: 0;">BookShop POS - Confidential Report</td>
                <td style="border: none; padding: 0;" class="text-right">Page 1</td>
            </tr>
        </table>
    </div>
</body>
</html>
