<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ReadingSession extends Model
{
    protected $guarded = [];

    protected $casts = [
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
        'billed_units' => 'decimal:1',
        'hourly_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function getFormattedDurationAttribute()
    {
        if (!$this->duration_minutes) {
            return '0 min';
        }

        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;

        if ($hours > 0) {
            return "{$hours} hr " . ($minutes > 0 ? "{$minutes} min" : "");
        }

        return "{$minutes} min";
    }

    public function getFormattedTotalAttribute()
    {
        return 'Rs. ' . number_format($this->total_amount ?? 0, 2);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', Carbon::today());
    }
}
