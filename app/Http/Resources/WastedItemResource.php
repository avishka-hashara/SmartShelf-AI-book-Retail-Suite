<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WastedItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product->name ?? 'Unknown Product',
            'product_sku' => $this->product->sku ?? 'N/A',
            'order_id' => $this->order->orderId ?? 'N/A',
            'qty' => $this->qty,
            'unit_price' => (float) $this->unit_price,
            'total_loss' => (float) $this->total_loss,
            'reason' => $this->reason,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
