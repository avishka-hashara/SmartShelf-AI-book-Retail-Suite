<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'discount_type',
        'discount_value',
        'bundle_price',
        'start_date',
        'end_date',
        'is_active',
        'min_purchase_amount',
        'usage_limit',
        'times_used',
        'promo_code',
        'priority',
        'image_path',
        'created_by',
    ];

    protected $casts = [
        'discount_value'      => 'decimal:2',
        'bundle_price'        => 'decimal:2',
        'min_purchase_amount' => 'decimal:2',
        'start_date'          => 'date',
        'end_date'            => 'date',
        'is_active'           => 'boolean',
        'usage_limit'         => 'integer',
        'times_used'          => 'integer',
        'priority'            => 'integer',
    ];

    /* ─────────────────────────────────────────────────
       RELATIONSHIPS
       ───────────────────────────────────────────────── */
    
    public function promotionProducts(): HasMany
    {
        return $this->hasMany(PromotionProduct::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot(['quantity', 'discount_override'])
            ->withTimestamps();
    }

    /* ─────────────────────────────────────────────────
       SCOPES
       ───────────────────────────────────────────────── */
    
    /**
     * Scope to get only active and valid promotions
     */
    public function scopeActive(Builder $query): Builder
    {
        $today = Carbon::today();
        
        return $query->where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $today);
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                  ->orWhereColumn('times_used', '<', 'usage_limit');
            });
    }

    /**
     * Scope for bundle type promotions
     */
    public function scopeBundles(Builder $query): Builder
    {
        return $query->where('type', 'bundle');
    }

    /**
     * Scope for discount type promotions
     */
    public function scopeDiscounts(Builder $query): Builder
    {
        return $query->where('type', 'discount');
    }

    /* ─────────────────────────────────────────────────
       HELPERS
       ───────────────────────────────────────────────── */
    
    /**
     * Check if the promotion is currently valid
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $today = Carbon::today();

        if ($this->start_date && $this->start_date->gt($today)) {
            return false;
        }

        if ($this->end_date && $this->end_date->lt($today)) {
            return false;
        }

        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Get the calculated total original price of bundle products
     */
    public function getOriginalPriceAttribute(): float
    {
        return $this->products->sum(function ($product) {
            return $product->unit_price * $product->pivot->quantity;
        });
    }

    /**
     * Get the final price (for bundles or after discount)
     */
    public function getFinalPriceAttribute(): float
    {
        if ($this->type === 'bundle' && $this->bundle_price !== null) {
            return (float) $this->bundle_price;
        }

        $originalPrice = $this->original_price;

        if ($this->discount_type === 'percentage') {
            return $originalPrice * (1 - ($this->discount_value / 100));
        }

        return max(0, $originalPrice - $this->discount_value);
    }

    /**
     * Get the savings amount
     */
    public function getSavingsAttribute(): float
    {
        return $this->original_price - $this->final_price;
    }

    /**
     * Get formatted final price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rs. ' . number_format($this->final_price, 2);
    }

    /**
     * Get formatted original price
     */
    public function getFormattedOriginalPriceAttribute(): string
    {
        return 'Rs. ' . number_format($this->original_price, 2);
    }

    /**
     * Get formatted savings
     */
    public function getFormattedSavingsAttribute(): string
    {
        return 'Rs. ' . number_format($this->savings, 2);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        if (!$this->is_active) {
            return 'Inactive';
        }

        $today = Carbon::today();

        if ($this->start_date && $this->start_date->gt($today)) {
            return 'Scheduled';
        }

        if ($this->end_date && $this->end_date->lt($today)) {
            return 'Expired';
        }

        if ($this->usage_limit && $this->times_used >= $this->usage_limit) {
            return 'Limit Reached';
        }

        return 'Active';
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('times_used');
    }
}
