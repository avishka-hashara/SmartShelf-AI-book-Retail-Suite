<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\PurchaseOrder;

class NotificationService
{
    public function lowStockAlert(Product $product): AppNotification
    {
        return AppNotification::create([
            'type'    => 'low_stock',
            'title'   => 'Low stock alert',
            'message' => "\"{$product->name}\" has only {$product->stock_level} left in stock.",
            'data'    => ['product_id' => $product->id, 'stock_level' => $product->stock_level],
        ]);
    }

    public function outOfStockAlert(Product $product): AppNotification
    {
        return AppNotification::create([
            'type'    => 'out_of_stock',
            'title'   => 'Out of stock alert',
            'message' => "\"{$product->name}\" is now out of stock.",
            'data'    => ['product_id' => $product->id],
        ]);
    }

    public function refundProcessed(OrderReturn $return, $order): AppNotification
    {
        return AppNotification::create([
            'type'    => 'refund',
            'title'   => 'Refund processed',
            'message' => "Refund of Rs {$this->formatAmount($return->refund_amount)} issued for Invoice {$order->order_number}.",
            'data'    => ['order_id' => $order->id, 'return_id' => $return->id, 'refund_amount' => $return->refund_amount],
        ]);
    }

    public function purchaseOrderReceived(PurchaseOrder $po): AppNotification
    {
        return AppNotification::create([
            'type'    => 'purchase_order_received',
            'title'   => 'Purchase order received',
            'message' => "Purchase order {$po->po_number} has been fully received.",
            'data'    => ['purchase_order_id' => $po->id],
        ]);
    }

    private function formatAmount($amount): string
    {
        return number_format((float) $amount, 2);
    }
}
