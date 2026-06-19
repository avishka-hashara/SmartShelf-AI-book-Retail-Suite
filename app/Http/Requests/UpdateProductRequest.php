<?php

// app/Http/Requests/UpdateProductRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product');

        return [
            'name'                => ['required', 'string', 'max:255'],
            'brand'               => ['required', 'string', 'max:255'],
            'sku'                 => ['required', 'string', 'max:100', "unique:products,sku,{$productId}"],
            'category'            => ['required', 'string', 'max:100'],
            'description'         => ['nullable', 'string', 'max:2000'],
            'unit_price'          => ['required', 'numeric', 'min:0.01'],
            'cost_price'          => ['nullable', 'numeric', 'min:0'],
            'stock_level'         => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'image'               => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'custom_attributes'   => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'sku.unique'     => 'A product with this SKU already exists.',
            'unit_price.min' => 'Unit price must be greater than zero.',
        ];
    }
}