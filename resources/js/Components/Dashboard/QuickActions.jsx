import React from "react";
import { router } from "@inertiajs/react";
import { usePermissions } from "@/hooks/usePermissions";

/* ─────────────────────────────────────────────────
   ACTION ICONS
   ───────────────────────────────────────────────── */
const SaleIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-9-9v9m4-9v9"
        />
    </svg>
);

const AddProductIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const PurchaseOrderIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 14l2 2 4-4m4-3v9a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h7l4 4v1"
        />
    </svg>
);

const ReportIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
    </svg>
);

const CustomerIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
    </svg>
);

const StockIcon = () => (
    <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
    </svg>
);

/* ─────────────────────────────────────────────────
   ACTIONS LIST
   ───────────────────────────────────────────────── */
const QUICK_ACTIONS = [
    {
        key: "new-sale",
        label: "New Sale",
        icon: <SaleIcon />,
        href: "/pos",
        permission: "access_pos",
    },
    {
        key: "add-product",
        label: "Add Product",
        icon: <AddProductIcon />,
        href: "/products",
        permission: "create_product",
    },
    {
        key: "create-po",
        label: "Create PO",
        icon: <PurchaseOrderIcon />,
        href: "/purchase-orders",
        permission: "view_purchase_orders",
    },
    {
        key: "reports",
        label: "Reports",
        icon: <ReportIcon />,
        href: "/reports",
        permission: "view_reports",
    },
    {
        key: "add-customer",
        label: "Add Customer",
        icon: <CustomerIcon />,
        href: "/customers",
        permission: "create_customer",
    },
    {
        key: "stock",
        label: "Stock Update",
        icon: <StockIcon />,
        href: "/products",
        permission: "edit_product",
    },
];

/**
 * QuickActions - Grid of shortcut action buttons for the dashboard.
 *
 * @param {Array}    actions    - Override the default action list
 * @param {function} onAction   - Called with the action key when clicked
 * @returns {JSX.Element}
 */
const QuickActions = ({ actions = QUICK_ACTIONS, onAction }) => {
    const { can } = usePermissions();

    const filteredActions = actions.filter(
        (action) => !action.permission || can(action.permission),
    );

    return (
        <div className="card h-full">
            <div className="card-header">
                <h3 className="card-title flex items-center gap-2 normal-case text-base text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
                    <span>⚡</span> Quick Actions
                </h3>
            </div>
            <div className="card-body">
                <div className="grid grid-cols-2 gap-3">
                    {filteredActions.map((action) => (
                        <button
                            key={action.key}
                            type="button"
                            className="qa-tile group"
                            id={`qa-${action.key}`}
                            onClick={() => {
                                if (onAction) onAction(action.key, action.href);
                                router.visit(action.href);
                            }}
                            aria-label={action.label}
                        >
                            <div className="qa-tile-icon group-hover:scale-110 transition-transform">
                                {action.icon}
                            </div>
                            <span className="qa-tile-label">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickActions;
