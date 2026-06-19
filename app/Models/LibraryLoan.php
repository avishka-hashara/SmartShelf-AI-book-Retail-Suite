<?php

// app/Models/LibraryLoan.php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryLoan extends Model
{
    protected $fillable = [
        'library_book_id', 'library_member_id', 'issued_by',
        'loan_date', 'due_date', 'return_date',
        'extension_days', 'extended_by', 'extended_at',
        'status', 'daily_rate', 'deposit_amount',
        'late_fine', 'extra_fee', 'total_charged',
        'payment_method', 'notes',
    ];

    protected $casts = [
        'loan_date'    => 'date',
        'due_date'     => 'date',
        'return_date'  => 'date',
        'extended_at'  => 'datetime',
        'daily_rate'   => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'late_fine'    => 'decimal:2',
        'extra_fee'    => 'decimal:2',
        'total_charged' => 'decimal:2',
    ];

    /* ── Relationships ────────────────────────────── */

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class, 'library_book_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(LibraryMember::class, 'library_member_id');
    }

    /* ── Scopes ───────────────────────────────────── */

    public function scopeActive(Builder $q): Builder
    {
        return $q->whereIn('status', ['active', 'overdue']);
    }

    /* ── Accessors ────────────────────────────────── */

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'active' && $this->due_date->isPast();
    }

    public function getOverdueDaysAttribute(): int
    {
        if (!$this->is_overdue) return 0;
        $end = $this->return_date ?? Carbon::today();
        return (int) $this->due_date->diffInDays($end);
    }

    public function getCalculatedFineAttribute(): float
    {
        return round($this->overdue_days * (float) $this->daily_rate * 1.5, 2); // 1.5× late penalty
    }
}