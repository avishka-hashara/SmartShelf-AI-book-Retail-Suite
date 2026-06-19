<?php

namespace App\Services;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService
{
    public function __construct(
        private readonly ProductService $productService,
        private readonly NotificationService $notificationService
    ) {
    }

    public function getPurchaseOrders(): Collection
    {
        return PurchaseOrder::with(['supplier', 'items.product', 'creator'])
            ->latest()
            ->get();
    }

    public function getPurchaseOrder(int $poId): PurchaseOrder
    {
        return PurchaseOrder::with(['supplier', 'items.product', 'creator'])
            ->findOrFail($poId);
    }

    public function createPurchaseOrder(array $data, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            $totalCost = collect($data['items'])->sum(fn ($i) => $i['qty_ordered'] * $i['unit_cost']);

            $po = PurchaseOrder::create([
                'po_number'     => 'TEMP',
                'supplier_id'   => $data['supplier_id'],
                'status'        => $data['status'] ?? 'draft',
                'order_date'    => $data['order_date'],
                'expected_date' => $data['expected_date'] ?? null,
                'total_cost'    => $totalCost,
                'notes'         => $data['notes'] ?? null,
                'created_by'    => $userId,
            ]);

            $po->po_number = 'PO-' . date('Y') . '-' . str_pad($po->id, 4, '0', STR_PAD_LEFT);
            $po->save();

            foreach ($data['items'] as $item) {
                $po->items()->create([
                    'product_id'   => $item['product_id'],
                    'qty_ordered'  => $item['qty_ordered'],
                    'unit_cost'    => $item['unit_cost'],
                ]);
            }

            return $po->fresh(['supplier', 'items.product']);
        });
    }

    /**
     * Receive stock against a PO. Increments product stock and writes a
     * 'purchase' StockMovement for each line, referencing this PO.
     *
     * @throws ValidationException
     */
    public function receiveItems(int $poId, array $lines, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($poId, $lines, $userId) {
            $po = PurchaseOrder::with('items')->findOrFail($poId);

            if ($po->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => ['Cannot receive stock against a cancelled purchase order.'],
                ]);
            }

            foreach ($lines as $line) {
                /** @var PurchaseOrderItem $poItem */
                $poItem = $po->items->firstWhere('id', $line['purchase_order_item_id']);

                if (!$poItem) {
                    throw ValidationException::withMessages([
                        'lines' => ['One of the line items does not belong to this purchase order.'],
                    ]);
                }

                $remaining = $poItem->qty_ordered - $poItem->qty_received;
                if ($line['qty_received_now'] > $remaining) {
                    throw ValidationException::withMessages([
                        'lines' => ["Cannot receive more than the remaining {$remaining} unit(s) for this line."],
                    ]);
                }

                $poItem->increment('qty_received', $line['qty_received_now']);

                $this->productService->adjustStock(
                    $poItem->product_id,
                    $line['qty_received_now'],
                    "PO {$po->po_number} received",
                    'purchase',
                    'purchase_order',
                    $po->id,
                    $userId
                );

                // Last-cost-wins: keep the product's cost_price in sync with the latest receipt.
                Product::where('id', $poItem->product_id)->update(['cost_price' => $poItem->unit_cost]);
            }

            $po->refresh()->load('items');
            $fullyReceived = $po->items->every(fn (PurchaseOrderItem $i) => $i->qty_received >= $i->qty_ordered);
            $partiallyReceived = $po->items->sum('qty_received') > 0;

            $wasReceived = $po->status === 'received';
            $po->status = $fullyReceived ? 'received' : ($partiallyReceived ? 'partially_received' : $po->status);
            if ($fullyReceived) {
                $po->received_date = now()->toDateString();
            }
            $po->save();

            if ($fullyReceived && !$wasReceived) {
                $this->notificationService->purchaseOrderReceived($po);
            }

            return $po->fresh(['supplier', 'items.product']);
        });
    }

    public function updateStatus(int $poId, string $status): PurchaseOrder
    {
        $po = PurchaseOrder::findOrFail($poId);
        $po->status = $status;
        $po->save();

        return $po->fresh();
    }

    /**
     * @throws \Exception
     */
    public function deletePurchaseOrder(int $poId): bool
    {
        $po = PurchaseOrder::with('items')->findOrFail($poId);

        if ($po->items->sum('qty_received') > 0) {
            throw new \Exception('Cannot delete a purchase order that has received stock. Cancel it instead.');
        }

        return $po->delete();
    }
}
