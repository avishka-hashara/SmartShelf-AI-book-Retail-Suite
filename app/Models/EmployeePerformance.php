<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeePerformance extends Model
{
    protected $table = 'employee_performance';

    protected $fillable = [
        'user_id',
        'date',
        'retail_sales',
        'lounge_tokens',
        'transaction_voids',
    ];

    protected $casts = [
        'date' => 'date',
        'retail_sales' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
