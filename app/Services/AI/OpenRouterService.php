<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    public function chat(string $systemPrompt, string $userPrompt): string
    {
        $apiKey = config('ai.openrouter.api_key');

        if (empty($apiKey)) {
            return '';
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => 'http://localhost',
                'X-Title' => 'Smart POS AI',
            ])
            ->timeout(config('ai.openrouter.timeout'))
            ->post(config('ai.openrouter.base_url') . '/chat/completions', [
                'model' => config('ai.openrouter.model'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'max_tokens' => config('ai.openrouter.max_tokens'),
            ]);

            return (string) $response->json('choices.0.message.content');
        } catch (\Exception $e) {
            Log::warning('OpenRouter failed: ' . $e->getMessage());
            return '';
        }
    }
}
