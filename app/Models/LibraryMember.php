<?php

// app/Models/LibraryMember.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryMember extends Model
{
    protected $fillable = [
        'member_id', 'name', 'email', 'phone', 'address',
        'status', 'joined_at', 'added_by',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
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

    public function scopeSearch(Builder $q, string $term): Builder
    {
        return $q->where(fn ($s) =>
            $s->where('name', 'like', "%{$term}%")
              ->orWhere('member_id', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%")
        );
    }

    /* ── Accessors ────────────────────────────────── */

    public function getActiveLoansCountAttribute(): int
    {
        return $this->activeLoans()->count();
    }
}