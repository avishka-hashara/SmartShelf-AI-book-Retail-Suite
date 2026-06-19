<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;

    protected $table = 'role_permissions';

    protected $fillable = [
        'role',
        'permission_key',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    /**
     * Get all enabled permission keys for a given role.
     */
    public static function getPermissionsForRole(string $role): array
    {
        return static::where('role', $role)
            ->where('is_enabled', true)
            ->pluck('permission_key')
            ->toArray();
    }

    /**
     * Check if a specific role has a specific permission.
     */
    public static function roleHasPermission(string $role, string $permissionKey): bool
    {
        return static::where('role', $role)
            ->where('permission_key', $permissionKey)
            ->where('is_enabled', true)
            ->exists();
    }
}
