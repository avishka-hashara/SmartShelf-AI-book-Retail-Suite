<?php

// app/Models/Product.php
// (rename this file to Product.php when placing in app/Models/)

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Product extends Model
{
    protected $fillable = [
        'name', 'brand', 'sku', 'category', 'description',
        'unit_price', 'cost_price', 'stock_level', 'low_stock_threshold',
        'status', 'image_path', 'added_by', 'custom_attributes'
    ];

    protected $casts = [
        'unit_price'          => 'decimal:2',
        'cost_price'          => 'decimal:2',
        'stock_level'         => 'integer',
        'low_stock_threshold' => 'integer',
        'custom_attributes'   => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            $product->status = self::deriveStatus(
                $product->stock_level,
                $product->low_stock_threshold
            );
        });
    }

    /**
     * Derive status from stock level vs threshold.
     *
     *   stock = 0                              → out_of_stock
     *   0 < stock <= low_stock_threshold       → low_stock
     *   stock > low_stock_threshold            → in_stock
     */
    public static function deriveStatus(int $stock, int $threshold): string
    {
        if ($stock <= 0)         return 'out_of_stock';
        if ($stock <= $threshold) return 'low_stock';
        return 'in_stock';
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'Rs. ' . number_format((float) $this->unit_price, 2);
    }

    public function getMarginPercentageAttribute(): ?string
    {
        if (!$this->cost_price || $this->unit_price <= 0) return null;
        $margin = (($this->unit_price - $this->cost_price) / $this->unit_price) * 100;
        return number_format($margin, 1) . '%';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'in_stock'     => 'In Stock',
            'low_stock'    => 'Low Stock',
            'out_of_stock' => 'Out of Stock',
            default        => 'Unknown',
        };
    }

    public function getCategoryLabelAttribute(): string
    {
        $category = ProductCategory::where('slug', $this->category)->first();
        return $category ? $category->name : $this->category;
    }

    public function scopeInStock(Builder $query): Builder      { return $query->where('status', 'in_stock'); }
    public function scopeLowStock(Builder $query): Builder     { return $query->where('status', 'low_stock'); }
    public function scopeOutOfStock(Builder $query): Builder   { return $query->where('status', 'out_of_stock'); }
    public function scopeByCategory(Builder $query, string $c): Builder { return $query->where('category', $c); }
    public function scopeSearch(Builder $query, string $t): Builder {
        return $query->where(fn($q) => $q->where('name','like',"%{$t}%")->orWhere('brand','like',"%{$t}%")->orWhere('sku','like',"%{$t}%"));
    }
    public function scopeNeedsAttention(Builder $query): Builder {
        return $query->whereIn('status', ['low_stock', 'out_of_stock'])->orderBy('stock_level');
    }
}