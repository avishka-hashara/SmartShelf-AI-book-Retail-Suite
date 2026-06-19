import { usePage } from '@inertiajs/react';

/**
 * RBAC permission helpers for React components.
 *
 * Reads `permissions` (string[]) and `userRole` (string)
 * from Inertia shared props (set in HandleInertiaRequests middleware).
 *
 * @returns {{ can, canAny, canAll, isAdmin, permissions, userRole }}
 */
export function usePermissions() {
    const { permissions = [], userRole = null } = usePage().props;

    /**
     * Check if the current user has a specific permission.
     * Admin always has all permissions.
     */
    const can = (permission) => {
        if (userRole === 'admin') return true;
        return permissions?.includes(permission) ?? false;
    };

    /**
     * Check if the current user has ANY of the given permissions.
     */
    const canAny = (permissionsArray) => {
        if (userRole === 'admin') return true;
        return permissionsArray.some(p => permissions?.includes(p) ?? false);
    };

    /**
     * Check if the current user has ALL of the given permissions.
     */
    const canAll = (permissionsArray) => {
        if (userRole === 'admin') return true;
        return permissionsArray.every(p => permissions?.includes(p) ?? false);
    };

    const isAdmin = () => userRole === 'admin';

    return { can, canAny, canAll, isAdmin, permissions, userRole };
}
