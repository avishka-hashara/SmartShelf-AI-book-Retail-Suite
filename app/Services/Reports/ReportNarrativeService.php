<?php

namespace App\Services\Reports;

use App\Services\AI\OpenRouterService;

class ReportNarrativeService
{
    public function __construct(private OpenRouterService $ai) {}

    /**
     * Auto-generate insights based on report data.
     */
    public function generateInsights(array $data, string $type): array
    {
        $systemPrompt = "You are a retail business analyst AI for a point-of-sale system in Sri Lanka. Give concise, actionable insights in 2-3 sentences. Be specific with numbers. Currency is LKR. No markdown, plain text only.";
        $userPrompt = "Analyze this {$type} report data and give key insights: " . json_encode($data, JSON_PRETTY_PRINT);
        
        $result = $this->ai->chat($systemPrompt, $userPrompt);
        
        if ($result === '') {
            return $this->fallbackInsights($data, $type);
        }
        
        return [$result];
    }

    public function generateRecommendations(array $data, string $type): array
    {
        $systemPrompt = "You are a retail business consultant AI for a Sri Lankan store. Give 2-3 specific, actionable recommendations in plain text. No bullet points, no markdown. Keep it under 100 words.";
        $userPrompt = "Based on this {$type} data, what should the store owner do this week? Data: " . json_encode($data, JSON_PRETTY_PRINT);
        
        $result = $this->ai->chat($systemPrompt, $userPrompt);
        
        if ($result === '') {
            return $this->fallbackRecommendations($data, $type);
        }
        
        return [$result];
    }

    private function fallbackInsights(array $data, string $type): array
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

    private function fallbackRecommendations(array $data, string $type): array
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
