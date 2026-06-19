<?php

// app/Http/Requests/AdjustStockRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer'],                          // positive = restock, negative = deduction
            'reason'   => ['nullable', 'string', 'max:500'],
            'type'     => ['nullable', 'in:purchase,sale,adjustment,return,waste,correction'],
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Quantity is required.',
            'quantity.integer'  => 'Quantity must be a whole number.',
        ];
    }
}