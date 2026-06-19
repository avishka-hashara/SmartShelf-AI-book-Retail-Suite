<?php

namespace App\Models;

use App\Traits\HasPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasPermissions;

    protected $fillable = [
        'name',
        'email',
        'avatar',
        'role',
        'password',
        'store_id',
        'employee_id',
        'phone',
        'nic',
        'pin',
        'status',
        'clocked_in',
        'last_active_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pin',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'clocked_in' => 'boolean',
            'last_active_at' => 'datetime',
        ];
    }

    /* ── Relationships ── */

    public function shifts()
    {
        return $this->hasMany(EmployeeShift::class);
    }

    public function performance()
    {
        return $this->hasMany(EmployeePerformance::class);
    }
}
