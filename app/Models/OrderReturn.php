<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderReturn extends Model
{
    protected $fillable = [
        'return_number', 'order_id', 'reason', 'status', 'refund_amount', 'refunded_items', 'notes',
    ];

    protected $casts = [
        'refund_amount' => 'float',
        'refunded_items' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Serialize to array for Inertia, matching the frontend shape.
     */
    public function toFrontend(): array
    {
        $order = $this->order;

        return [
            'id'           => $this->id,
            'returnId'     => $this->return_number,
            'orderId'      => $order?->order_number ?? '',
            'orderDbId'    => $this->order_id,
            'customer'     => [
                'name'  => $order?->customer_name ?? $order?->customer?->name ?? 'Walk-in Customer',
                'email' => $order?->customer_email ?? $order?->customer?->email ?? '',
            ],
            'date'         => $this->created_at->setTimezone('Asia/Colombo')->format('M j, Y'),
            'reason'       => $this->reason,
            'items'        => $this->refunded_items 
                ? collect($this->refunded_items)->map(fn ($i) => [
                    'id'    => $i['id'] ?? null,
                    'title' => $i['name'] ?? '',
                    'qty'   => (int) ($i['qty'] ?? 0),
                    'price' => (float) ($i['price'] ?? 0),
                ])->values()->toArray()
                : ($order?->items->map(fn (OrderItem $i) => [
                    'id'    => $i->id,
                    'title' => $i->title,
                    'qty'   => (int) $i->qty,
                    'price' => (float) $i->unit_price,
                ])->values()->toArray() ?? []),
            'status'       => $this->status,
            'refundAmount' => (float) $this->refund_amount,
            'notes'        => $this->notes ?? '',
        ];
    }
}
