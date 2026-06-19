<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledReport extends Model
{
    protected $fillable = [
        'user_id', 'saved_report_id', 'frequency', 'delivery_time',
        'recipients', 'format', 'is_active', 'last_sent_at'
    ];

    protected $casts = [
        'recipients' => 'array',
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function savedReport(): BelongsTo
    {
        return $this->belongsTo(SavedReport::class);
    }
}
