<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'sometimes|required|in:Cash,Credit Card,Debit Card,Digital Wallet',
            'status'         => 'sometimes|required|in:Pending,Completed,Cancelled',
            'discount'       => 'sometimes|nullable|numeric|min:0',
            'notes'          => 'sometimes|nullable|string|max:1000',
        ];
    }
}
