<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_code',
        'name',
        'email',
        'phone',
        'status',
        'total_purchases',
        'orders',
        'last_visit',
        'loyalty_pts',
    ];

    protected $casts = [
        'total_purchases' => 'float',
        'orders'          => 'integer',
        'loyalty_pts'     => 'integer',
        'last_visit'      => 'date',
    ];

    /**
     * Return a human-readable last visit string for the frontend.
     */
    public function getFormattedLastVisitAttribute(): string
    {
        if (!$this->last_visit) {
            return '—';
        }

        $date = Carbon::parse($this->last_visit);

        if ($date->isToday()) {
            return 'Today';
        }

        return $date->format('M j, Y');
    }

    /**
     * Serialize to array for Inertia, matching the frontend shape.
     */
    public function toFrontend(): array
    {
        return [
            'id'             => $this->id,
            'customerId'     => $this->customer_code,
            'name'           => $this->name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'status'         => $this->status,
            'totalPurchases' => (float) $this->total_purchases,
            'orders'         => (int) $this->orders,
            'createdAt'      => $this->created_at->format('Y-m-d'),
            'lastVisit'      => $this->formatted_last_visit,
            'loyaltyPts'     => (int) $this->loyalty_pts,
            'avatar'         => null,
        ];
    }
}
