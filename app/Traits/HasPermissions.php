<?php

namespace App\Traits;

use App\Constants\Permissions;
use App\Models\RolePermission;

trait HasPermissions
{
    /**
     * Check if the user has a specific permission.
     * Admin always has ALL permissions.
     */
    public function hasPermission(string $permissionKey): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        return RolePermission::roleHasPermission($this->role, $permissionKey);
    }

    /**
     * Check if the user has ALL of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if the user has ANY of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all enabled permission keys for this user's role.
     * Admin gets ALL permissions from the constants file.
     */
    public function getAllPermissions(): array
    {
        if ($this->role === 'admin') {
            return Permissions::ALL_PERMISSIONS;
        }

        return RolePermission::getPermissionsForRole($this->role);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
