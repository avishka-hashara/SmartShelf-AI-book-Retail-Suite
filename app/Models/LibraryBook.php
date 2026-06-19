<?php

// app/Models/LibraryBook.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryBook extends Model
{
    protected $fillable = [
        'title', 'author', 'isbn', 'genre', 'description', 'publisher',
        'published_year', 'total_copies', 'available_copies',
        'daily_rate', 'deposit_amount', 'lost_fee', 'damage_fee',
        'status', 'image_path', 'added_by',
    ];

    protected $casts = [
        'daily_rate'       => 'decimal:2',
        'deposit_amount'   => 'decimal:2',
        'lost_fee'         => 'decimal:2',
        'damage_fee'       => 'decimal:2',
        'total_copies'     => 'integer',
        'available_copies' => 'integer',
    ];

    /* ── Relationships ────────────────────────────── */

    public function loans(): HasMany
    {
        return $this->hasMany(LibraryLoan::class);
    }

    public function activeLoans(): HasMany
    {
        return $this->hasMany(LibraryLoan::class)->whereIn('status', ['active', 'overdue']);
    }

    /* ── Scopes ───────────────────────────────────── */

    public function scopeAvailable(Builder $q): Builder
    {
        return $q->where('status', 'available')->where('available_copies', '>', 0);
    }

    public function scopeSearch(Builder $q, string $term): Builder
    {
        return $q->where(fn ($s) =>
            $s->where('title', 'like', "%{$term}%")
              ->orWhere('author', 'like', "%{$term}%")
              ->orWhere('isbn', 'like', "%{$term}%")
        );
    }

    /* ── Accessors ────────────────────────────────── */

    public function getFormattedDailyRateAttribute(): string
    {
        return 'Rs. ' . number_format((float) $this->daily_rate, 2);
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'available' && $this->available_copies > 0;
    }
}