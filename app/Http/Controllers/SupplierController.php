<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Services\SupplierService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function __construct(private readonly SupplierService $supplierService)
    {
    }

    public function index(): Response
    {
        return Inertia::render('Suppliers/Suppliers', [
            'suppliers' => $this->supplierService->getSuppliers(),
        ]);
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        $this->supplierService->createSupplier($request->validated());

        return redirect()->route('suppliers.index')->with('success', 'Supplier created successfully.');
    }

    public function update(StoreSupplierRequest $request, int $supplier): RedirectResponse
    {
        $this->supplierService->updateSupplier($supplier, $request->validated());

        return redirect()->route('suppliers.index')->with('success', 'Supplier updated successfully.');
    }

    public function destroy(int $supplier): RedirectResponse
    {
        try {
            $this->supplierService->deleteSupplier($supplier);
        } catch (\Exception $e) {
            return redirect()->route('suppliers.index')->with('error', $e->getMessage());
        }

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }
}
