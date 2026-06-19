<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSettings extends Model
{
    protected $table = 'store_settings';

    protected $fillable = [
        'shop_name',
        'tagline',
        'logo_path',
        'favicon_path',
        'brand_color',
        'address_line1',
        'address_line2',
        'city',
        'postal_code',
        'phone',
        'email',
        'website',
        'facebook',
        'instagram',
        'whatsapp',
        'tax_id',
        'business_reg_number',
        'currency',
        'timezone',
        'receipt_footer',
        'low_stock_threshold',
        'enable_loyalty',
        'loyalty_points_per_rupee',
    ];

    protected $casts = [
        'low_stock_threshold'    => 'integer',
        'enable_loyalty'         => 'boolean',
        'loyalty_points_per_rupee' => 'decimal:2',
    ];

    /**
     * Get the single settings row (singleton pattern).
     */
    public static function instance(): static
    {
        return static::firstOrCreate([], ['shop_name' => 'My Bookshop', 'currency' => 'LKR']);
    }
}
