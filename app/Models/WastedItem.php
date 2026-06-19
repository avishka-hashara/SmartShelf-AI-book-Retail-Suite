<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WastedItem extends Model
{
    protected $fillable = [
        'product_id',
        'order_id',
        'qty',
        'unit_price',
        'total_loss',
        'reason',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
