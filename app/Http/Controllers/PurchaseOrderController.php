<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReceiveStockRequest;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Models\Product;
use App\Models\StoreSettings;
use App\Models\Supplier;
use App\Services\PurchaseOrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(private readonly PurchaseOrderService $purchaseOrderService)
    {
    }

    public function index(): Response
    {
        return Inertia::render('PurchaseOrders/PurchaseOrders', [
            'purchaseOrders' => $this->purchaseOrderService->getPurchaseOrders(),
            'suppliers'      => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products'       => Product::orderBy('name')->get(['id', 'name', 'sku', 'cost_price']),
            'storeSettings'  => StoreSettings::instance(),
        ]);
    }

    public function show(int $purchaseOrder): Response
    {
        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $this->purchaseOrderService->getPurchaseOrder($purchaseOrder),
            'storeSettings' => StoreSettings::instance(),
        ]);
    }

    public function store(StorePurchaseOrderRequest $request): RedirectResponse
    {
        $this->purchaseOrderService->createPurchaseOrder($request->validated(), auth()->id());

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order created successfully.');
    }

    public function receive(ReceiveStockRequest $request, int $purchaseOrder): RedirectResponse
    {
        try {
            $this->purchaseOrderService->receiveItems(
                $purchaseOrder,
                $request->validated('lines'),
                auth()->id()
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->route('purchase-orders.index')->with('error', $e->getMessage());
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Stock received successfully.');
    }

    public function update(int $purchaseOrder): RedirectResponse
    {
        $status = request()->validate([
            'status' => ['required', 'in:draft,ordered,cancelled'],
        ])['status'];

        $this->purchaseOrderService->updateStatus($purchaseOrder, $status);

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order updated successfully.');
    }

    public function destroy(int $purchaseOrder): RedirectResponse
    {
        try {
            $this->purchaseOrderService->deletePurchaseOrder($purchaseOrder);
        } catch (\Exception $e) {
            return redirect()->route('purchase-orders.index')->with('error', $e->getMessage());
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order deleted successfully.');
    }
}
