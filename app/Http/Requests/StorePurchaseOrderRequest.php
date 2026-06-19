<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id'             => ['required', 'integer', 'exists:suppliers,id'],
            'status'                  => ['nullable', 'in:draft,ordered'],
            'order_date'              => ['required', 'date'],
            'expected_date'           => ['nullable', 'date'],
            'notes'                   => ['nullable', 'string', 'max:1000'],
            'items'                   => ['required', 'array', 'min:1'],
            'items.*.product_id'      => ['required', 'integer', 'exists:products,id'],
            'items.*.qty_ordered'     => ['required', 'integer', 'min:1'],
            'items.*.unit_cost'       => ['required', 'numeric', 'min:0'],
        ];
    }
}
