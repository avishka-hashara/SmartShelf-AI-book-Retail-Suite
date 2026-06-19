<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Collection;

class SupplierService
{
    public function getSuppliers(): Collection
    {
        return Supplier::orderBy('name')->get();
    }

    public function createSupplier(array $data): Supplier
    {
        return Supplier::create($data);
    }

    public function updateSupplier(int $supplierId, array $data): Supplier
    {
        $supplier = Supplier::findOrFail($supplierId);
        $supplier->fill($data);
        $supplier->save();

        return $supplier->fresh();
    }

    /**
     * @throws \Exception
     */
    public function deleteSupplier(int $supplierId): bool
    {
        $supplier = Supplier::findOrFail($supplierId);

        if ($supplier->purchaseOrders()->exists()) {
            throw new \Exception('Cannot delete a supplier that has purchase order history.');
        }

        return $supplier->delete();
    }
}
