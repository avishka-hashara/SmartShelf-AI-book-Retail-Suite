<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceiveStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lines'                       => ['required', 'array', 'min:1'],
            'lines.*.purchase_order_item_id' => ['required', 'integer', 'exists:purchase_order_items,id'],
            'lines.*.qty_received_now'   => ['required', 'integer', 'min:1'],
        ];
    }
}
