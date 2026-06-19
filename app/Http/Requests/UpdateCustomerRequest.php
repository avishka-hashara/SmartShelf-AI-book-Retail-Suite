<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ignore the current customer's email on unique check
        $customerId = $this->route('customer')?->id;

        return [
            'name'   => ['required', 'string', 'max:255'],
            'email'  => ['required', 'email', 'max:255', "unique:customers,email,{$customerId}"],
            'phone'  => ['required', 'string', 'max:50'],
            'status' => ['required', 'in:Active,Inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email address is already used by another customer.',
        ];
    }
}
