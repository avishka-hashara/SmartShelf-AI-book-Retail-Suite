import { usePermissions } from '@/hooks/usePermissions';

/**
 * Declarative permission gate component.
 *
 * Usage:
 *   <Can permission="create_product">
 *       <button>Add Product</button>
 *   </Can>
 *
 *   <Can permission="delete_product" fallback={<span>No access</span>}>
 *       <button>Delete</button>
 *   </Can>
 */
export default function Can({ permission, any, all, fallback = null, children }) {
    const { can, canAny, canAll } = usePermissions();

    let allowed = false;

    if (permission) {
        allowed = can(permission);
    } else if (any) {
        allowed = canAny(any);
    } else if (all) {
        allowed = canAll(all);
    }

    return allowed ? children : fallback;
}
