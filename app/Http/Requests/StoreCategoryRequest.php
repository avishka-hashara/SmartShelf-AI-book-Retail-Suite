<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // For now returning true, optionally add permission check like
        // return $this->user()->can('manage_categories');
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:product_categories,name'],
            'custom_fields' => ['nullable', 'array'],
            'custom_fields.*.key' => ['required', 'string', 'regex:/^[a-z0-9_]+$/'],
            'custom_fields.*.label' => ['required', 'string'],
            'custom_fields.*.type' => ['required', 'in:text,number,textarea,select'],
            'custom_fields.*.required' => ['nullable', 'boolean'],
            'custom_fields.*.options' => ['array', 'required_if:custom_fields.*.type,select'],
        ];
    }
}
