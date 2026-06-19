<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeShift extends Model
{
    protected $fillable = [
        'user_id',
        'clocked_in_at',
        'clocked_out_at',
        'total_hours',
    ];

    protected $casts = [
        'clocked_in_at' => 'datetime',
        'clocked_out_at' => 'datetime',
        'total_hours' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
