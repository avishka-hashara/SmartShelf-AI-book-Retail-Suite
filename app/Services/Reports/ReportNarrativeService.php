<?php

namespace App\Services\Reports;

class ReportNarrativeService
{
    /**
     * Auto-generate insights based on report data.
     */
    public function generateInsights(array $data, string $type): array
    {
        $insights = [];

        if ($type === 'overview') {
            $totalSales = $data['kpis']['total_sales'];
            $margin = $data['kpis']['margin'];

            $insights[] = "Revenue for the period is LKR " . number_format($totalSales) . ".";
            
            if ($margin < 20) {
                $insights[] = "⚠ Profit margin is currently low ({$margin}%). Review COGS and pricing strategy.";
            } else {
                $insights[] = "✅ Profit margin is healthy at " . number_format($margin, 1) . "%.";
            }

            if ($data['low_stock_count'] > 10) {
                $insights[] = "⚠ Critical: {$data['low_stock_count']} items are low on stock and need immediate reordering.";
            }

            // More logic based on trend...
        }

        return $insights;
    }

    public function generateRecommendations(array $data, string $type): array
    {
        $recs = [];
        
        if ($type === 'overview') {
            $recs[] = "Focus on the top 5 products which contribute significantly to your revenue.";
            
            if ($data['low_stock_count'] > 0) {
                $recs[] = "Check the 'Low Stock Alerts' report to replenish inventory.";
            }
        }

        return $recs;
    }
}
