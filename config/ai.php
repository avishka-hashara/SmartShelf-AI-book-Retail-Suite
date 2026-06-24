<?php

return [
    'openrouter' => [
        'api_key'    => env('OPENROUTER_API_KEY'),
        'base_url'   => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
        'model'      => env('OPENROUTER_MODEL', 'meta-llama/llama-3.1-8b-instruct:free'),
        'timeout'    => 15,
        'max_tokens' => 300,
    ],
];
