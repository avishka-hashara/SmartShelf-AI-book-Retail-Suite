<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'         => 'nullable|exists:customers,id',
            'customer_name'       => 'nullable|string|max:255',
            'customer_email'      => 'nullable|email|max:255',
            'payment_method'      => 'required|in:Cash,Credit Card,Debit Card,Digital Wallet',
            'status'              => 'required|in:Pending,Completed',
            'discount'            => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string|max:1000',
            'items'               => 'required|array|min:1',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.title'       => 'required|string|max:255',
            'items.*.qty'         => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'split_payments'      => 'nullable|array',
            'split_payments.*.method' => 'required_with:split_payments|string',
            'split_payments.*.amount' => 'required_with:split_payments|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'             => 'At least one item is required.',
            'items.min'                  => 'At least one item is required.',
            'items.*.title.required'     => 'Each item must have a title.',
            'items.*.qty.required'       => 'Each item must have a quantity.',
            'items.*.unit_price.required'=> 'Each item must have a price.',
        ];
    }
}
