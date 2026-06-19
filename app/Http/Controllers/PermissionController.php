<?php

namespace App\Http\Controllers;

use App\Constants\Permissions;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * Allowed roles for permission management (admin is always full-access).
     */
    private const MANAGEABLE_ROLES = ['manager', 'cashier', 'lounge_manager', 'inventory'];

    /**
     * Get all permissions for a given role.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'required|string|in:' . implode(',', self::MANAGEABLE_ROLES),
        ]);

        $permissions = RolePermission::where('role', $request->query('role'))
            ->get(['permission_key', 'is_enabled']);

        return response()->json(['permissions' => $permissions]);
    }

    /**
     * Update a single permission toggle for a role.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role'           => 'required|string|in:' . implode(',', self::MANAGEABLE_ROLES),
            'permission_key' => 'required|string|in:' . implode(',', Permissions::ALL_PERMISSIONS),
            'is_enabled'     => 'required|boolean',
        ]);

        RolePermission::updateOrCreate(
            [
                'role'           => $validated['role'],
                'permission_key' => $validated['permission_key'],
            ],
            [
                'is_enabled' => $validated['is_enabled'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permission updated.',
        ]);
    }

    /**
     * Reset a role's permissions back to the seeder defaults.
     */
    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|in:' . implode(',', self::MANAGEABLE_ROLES),
        ]);

        $role = $validated['role'];

        // Delete all existing permissions for this role
        RolePermission::where('role', $role)->delete();

        // Re-seed defaults for this specific role
        $this->seedDefaultsForRole($role);

        return response()->json([
            'success' => true,
            'message' => ucfirst(str_replace('_', ' ', $role)) . ' permissions reset to defaults.',
        ]);
    }

    /**
     * Seed the default permissions for a single role.
     */
    private function seedDefaultsForRole(string $role): void
    {
        $defaults = $this->getDefaults();

        if (!isset($defaults[$role])) {
            return;
        }

        $enabledKeys = $defaults[$role];

        foreach (Permissions::ALL_PERMISSIONS as $permissionKey) {
            RolePermission::create([
                'role'           => $role,
                'permission_key' => $permissionKey,
                'is_enabled'     => in_array($permissionKey, $enabledKeys),
            ]);
        }
    }

    /**
     * Default permission sets per role — matches RolePermissionSeeder.
     */
    private function getDefaults(): array
    {
        return [
            'manager' => array_values(array_diff(
                Permissions::ALL_PERMISSIONS,
                [Permissions::DELETE_EMPLOYEE, Permissions::EDIT_SETTINGS, Permissions::DELETE_PRODUCT]
            )),
            'cashier' => [
                Permissions::VIEW_DASHBOARD,
                Permissions::ACCESS_POS,
                Permissions::HOLD_SALE,
                Permissions::VIEW_PRODUCTS,
                Permissions::VIEW_CUSTOMERS,
                Permissions::CREATE_CUSTOMER,
                Permissions::VIEW_SALES,
                Permissions::ACCESS_LOUNGE,
            ],
            'lounge_manager' => [
                Permissions::VIEW_DASHBOARD,
                Permissions::ACCESS_LOUNGE,
                Permissions::MANAGE_LOUNGE,
                Permissions::VIEW_CUSTOMERS,
                Permissions::CREATE_CUSTOMER,
                Permissions::VIEW_SALES,
            ],
            'inventory' => [
                Permissions::VIEW_DASHBOARD,
                Permissions::VIEW_PRODUCTS,
                Permissions::CREATE_PRODUCT,
                Permissions::EDIT_PRODUCT,
                Permissions::DELETE_PRODUCT,
                Permissions::VIEW_CUSTOMERS,
                Permissions::VIEW_SUPPLIERS,
                Permissions::MANAGE_SUPPLIERS,
                Permissions::VIEW_PURCHASE_ORDERS,
                Permissions::MANAGE_PURCHASE_ORDERS,
            ],
        ];
    }
}
