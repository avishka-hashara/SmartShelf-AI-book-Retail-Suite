<?php

namespace App\Constants;

final class Permissions
{
    // ──────────────────────────────────────
    // Dashboard
    // ──────────────────────────────────────
    const VIEW_DASHBOARD = 'view_dashboard';

    // ──────────────────────────────────────
    // POS
    // ──────────────────────────────────────
    const ACCESS_POS     = 'access_pos';
    const APPLY_DISCOUNT = 'apply_discount';
    const PROCESS_REFUND = 'process_refund';
    const HOLD_SALE      = 'hold_sale';

    // ──────────────────────────────────────
    // Products
    // ──────────────────────────────────────
    const VIEW_PRODUCTS  = 'view_products';
    const CREATE_PRODUCT = 'create_product';
    const EDIT_PRODUCT   = 'edit_product';
    const DELETE_PRODUCT = 'delete_product';

    // ──────────────────────────────────────
    // Suppliers & Purchase Orders
    // ──────────────────────────────────────
    const VIEW_SUPPLIERS      = 'view_suppliers';
    const MANAGE_SUPPLIERS    = 'manage_suppliers';
    const VIEW_PURCHASE_ORDERS   = 'view_purchase_orders';
    const MANAGE_PURCHASE_ORDERS = 'manage_purchase_orders';

    // ──────────────────────────────────────
    // Customers
    // ──────────────────────────────────────
    const VIEW_CUSTOMERS  = 'view_customers';
    const CREATE_CUSTOMER = 'create_customer';
    const EDIT_CUSTOMER   = 'edit_customer';
    const DELETE_CUSTOMER = 'delete_customer';

    // ──────────────────────────────────────
    // Sales & Reports
    // ──────────────────────────────────────
    const VIEW_SALES     = 'view_sales';
    const VIEW_REPORTS   = 'view_reports';
    const EXPORT_REPORTS = 'export_reports';

    // ──────────────────────────────────────
    // Employees
    // ──────────────────────────────────────
    const VIEW_EMPLOYEES  = 'view_employees';
    const CREATE_EMPLOYEE = 'create_employee';
    const EDIT_EMPLOYEE   = 'edit_employee';
    const DELETE_EMPLOYEE = 'delete_employee';

    // ──────────────────────────────────────
    // Lounge
    // ──────────────────────────────────────
    const ACCESS_LOUNGE = 'access_lounge';
    const MANAGE_LOUNGE = 'manage_lounge';

    // ──────────────────────────────────────
    // Promotions
    // ──────────────────────────────────────
    const VIEW_PROMOTIONS   = 'view_promotions';
    const CREATE_PROMOTION  = 'create_promotion';
    const EDIT_PROMOTION    = 'edit_promotion';
    const DELETE_PROMOTION  = 'delete_promotion';

    // ──────────────────────────────────────
    // Settings
    // ──────────────────────────────────────
    const VIEW_SETTINGS = 'view_settings';
    const EDIT_SETTINGS = 'edit_settings';

    // ──────────────────────────────────────
    // Master list of ALL permission keys
    // ──────────────────────────────────────
    const ALL_PERMISSIONS = [
        // Dashboard
        self::VIEW_DASHBOARD,

        // POS
        self::ACCESS_POS,
        self::APPLY_DISCOUNT,
        self::PROCESS_REFUND,
        self::HOLD_SALE,

        // Products
        self::VIEW_PRODUCTS,
        self::CREATE_PRODUCT,
        self::EDIT_PRODUCT,
        self::DELETE_PRODUCT,

        // Suppliers & Purchase Orders
        self::VIEW_SUPPLIERS,
        self::MANAGE_SUPPLIERS,
        self::VIEW_PURCHASE_ORDERS,
        self::MANAGE_PURCHASE_ORDERS,

        // Customers
        self::VIEW_CUSTOMERS,
        self::CREATE_CUSTOMER,
        self::EDIT_CUSTOMER,
        self::DELETE_CUSTOMER,

        // Sales & Reports
        self::VIEW_SALES,
        self::VIEW_REPORTS,
        self::EXPORT_REPORTS,

        // Employees
        self::VIEW_EMPLOYEES,
        self::CREATE_EMPLOYEE,
        self::EDIT_EMPLOYEE,
        self::DELETE_EMPLOYEE,

        // Lounge
        self::ACCESS_LOUNGE,
        self::MANAGE_LOUNGE,

        // Promotions
        self::VIEW_PROMOTIONS,
        self::CREATE_PROMOTION,
        self::EDIT_PROMOTION,
        self::DELETE_PROMOTION,

        // Settings
        self::VIEW_SETTINGS,
        self::EDIT_SETTINGS,
    ];

    /**
     * Human-readable labels grouped by module (useful for admin UI).
     */
    const GROUPED = [
        'Dashboard' => [
            self::VIEW_DASHBOARD => 'View Dashboard',
        ],
        'POS' => [
            self::ACCESS_POS     => 'Access POS',
            self::APPLY_DISCOUNT => 'Apply Discount',
            self::PROCESS_REFUND => 'Process Refund',
            self::HOLD_SALE      => 'Hold Sale',
        ],
        'Products' => [
            self::VIEW_PRODUCTS  => 'View Products',
            self::CREATE_PRODUCT => 'Create Product',
            self::EDIT_PRODUCT   => 'Edit Product',
            self::DELETE_PRODUCT => 'Delete Product',
        ],
        'Suppliers & Purchase Orders' => [
            self::VIEW_SUPPLIERS         => 'View Suppliers',
            self::MANAGE_SUPPLIERS       => 'Manage Suppliers',
            self::VIEW_PURCHASE_ORDERS   => 'View Purchase Orders',
            self::MANAGE_PURCHASE_ORDERS => 'Manage Purchase Orders',
        ],
        'Customers' => [
            self::VIEW_CUSTOMERS  => 'View Customers',
            self::CREATE_CUSTOMER => 'Create Customer',
            self::EDIT_CUSTOMER   => 'Edit Customer',
            self::DELETE_CUSTOMER => 'Delete Customer',
        ],
        'Sales & Reports' => [
            self::VIEW_SALES     => 'View Sales',
            self::VIEW_REPORTS   => 'View Reports',
            self::EXPORT_REPORTS => 'Export Reports',
        ],
        'Employees' => [
            self::VIEW_EMPLOYEES  => 'View Employees',
            self::CREATE_EMPLOYEE => 'Create Employee',
            self::EDIT_EMPLOYEE   => 'Edit Employee',
            self::DELETE_EMPLOYEE => 'Delete Employee',
        ],
        'Lounge' => [
            self::ACCESS_LOUNGE => 'Access Lounge',
            self::MANAGE_LOUNGE => 'Manage Lounge',
        ],
        'Promotions' => [
            self::VIEW_PROMOTIONS   => 'View Promotions',
            self::CREATE_PROMOTION  => 'Create Promotion',
            self::EDIT_PROMOTION    => 'Edit Promotion',
            self::DELETE_PROMOTION  => 'Delete Promotion',
        ],
        'Settings' => [
            self::VIEW_SETTINGS => 'View Settings',
            self::EDIT_SETTINGS => 'Edit Settings',
        ],
    ];
}
