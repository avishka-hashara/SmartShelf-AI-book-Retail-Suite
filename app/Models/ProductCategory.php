<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $fillable = ['name', 'slug', 'custom_fields', 'is_system'];

    protected $casts = [
        'custom_fields' => 'array',
        'is_system' => 'boolean',
    ];
}
