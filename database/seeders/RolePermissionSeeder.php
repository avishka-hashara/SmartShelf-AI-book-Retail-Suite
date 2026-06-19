<?php

namespace Database\Seeders;

use App\Constants\Permissions;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Cashier ─────────────────────────────────────────
        $cashierPermissions = [
            Permissions::VIEW_DASHBOARD,
            Permissions::ACCESS_POS,
            Permissions::HOLD_SALE,
            Permissions::VIEW_PRODUCTS,
            Permissions::VIEW_CUSTOMERS,
            Permissions::CREATE_CUSTOMER,
            Permissions::VIEW_SALES,
            Permissions::ACCESS_LOUNGE,
        ];

        // ─── Manager (everything EXCEPT these) ──────────────
        $managerDenied = [
            Permissions::DELETE_EMPLOYEE,
            Permissions::EDIT_SETTINGS,
            Permissions::DELETE_PRODUCT,
        ];
        $managerPermissions = array_values(
            array_diff(Permissions::ALL_PERMISSIONS, $managerDenied)
        );

        // ─── Lounge Manager ─────────────────────────────────
        $loungeManagerPermissions = [
            Permissions::VIEW_DASHBOARD,
            Permissions::ACCESS_LOUNGE,
            Permissions::MANAGE_LOUNGE,
            Permissions::VIEW_CUSTOMERS,
            Permissions::CREATE_CUSTOMER,
            Permissions::VIEW_SALES,
        ];

        // ─── Inventory Clerk ────────────────────────────────
        $inventoryClerkPermissions = [
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
        ];

        // ─── Map roles to their permissions ─────────────────
        $roleMap = [
            'cashier'         => $cashierPermissions,
            'manager'         => $managerPermissions,
            'lounge_manager'  => $loungeManagerPermissions,
            'inventory'       => $inventoryClerkPermissions,
        ];

        foreach ($roleMap as $role => $permissions) {
            foreach (Permissions::ALL_PERMISSIONS as $permissionKey) {
                RolePermission::updateOrCreate(
                    [
                        'role'           => $role,
                        'permission_key' => $permissionKey,
                    ],
                    [
                        'is_enabled' => in_array($permissionKey, $permissions),
                    ]
                );
            }
        }

        $this->command->info('Role permissions seeded successfully.');
    }
}
