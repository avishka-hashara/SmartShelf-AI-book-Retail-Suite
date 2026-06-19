<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'customer_id', 'customer_name', 'customer_email',
        'payment_method', 'status', 'subtotal', 'discount', 'total', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount' => 'float',
        'total'    => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    /**
     * Serialize to array for Inertia, matching the frontend shape.
     */
    public function toFrontend(): array
    {
        return [
            'id'          => $this->id,
            'orderId'     => $this->order_number,
            'customer'    => [
                'id'    => $this->customer_id,
                'name'  => $this->customer_name ?? $this->customer?->name ?? 'Walk-in Customer',
                'email' => $this->customer_email ?? $this->customer?->email ?? '',
            ],
            'date'        => $this->created_at->setTimezone('Asia/Colombo')->format('M j, Y'),
            'time'        => $this->created_at->setTimezone('Asia/Colombo')->format('g:i A'),
            'items'       => $this->items->map(fn (OrderItem $i) => [
                'id'       => $i->id,
                'title'    => $i->title,
                'qty'      => (int) $i->qty,
                'price'    => (float) $i->unit_price,
                'subtotal' => (float) $i->subtotal,
            ])->values()->toArray(),
            'payment'     => $this->payment_method,
            'payments'    => $this->relationLoaded('payments') ? $this->payments->map(fn($p) => [
                'method' => $p->payment_method,
                'amount' => (float) $p->amount,
            ])->values()->toArray() : [],
            'status'      => $this->status,
            'subtotal'    => (float) $this->subtotal,
            'discount'    => (float) $this->discount,
            'total'       => (float) $this->total,
            'notes'       => $this->notes ?? '',
        ];
    }
}
