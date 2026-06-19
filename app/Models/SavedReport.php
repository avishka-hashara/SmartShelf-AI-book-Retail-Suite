<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavedReport extends Model
{
    protected $fillable = [
        'user_id', 'name', 'type', 'filters', 'configuration'
    ];

    protected $casts = [
        'filters' => 'array',
        'configuration' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ScheduledReport::class);
    }
}
