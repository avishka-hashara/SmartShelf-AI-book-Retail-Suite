<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display all customers.
     */
    public function index(): Response
    {
        $customers = Customer::latest()->get()
            ->map(fn(Customer $c) => $c->toFrontend());

        return Inertia::render('Customers/Customer', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a new customer.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = Customer::create($request->validated());

        // Generate customer code based on the new ID
        $customer->customer_code = 'CUS-' . str_pad($customer->id + 1000, 4, '0', STR_PAD_LEFT);
        $customer->save();

        return back()->with('success', "\"{$customer->name}\" added successfully!");
    }

    /**
     * Update an existing customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return back()->with('success', "\"{$customer->name}\" updated successfully!");
    }

    /**
     * Delete a customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $name = $customer->name;
        $customer->delete();

        return back()->with('success', "\"{$name}\" has been deleted.");
    }
}
