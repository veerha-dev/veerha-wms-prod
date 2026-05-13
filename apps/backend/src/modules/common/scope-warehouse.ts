// Helper to enforce manager warehouse scoping on list/detail endpoints.
// Per workflow doc: managers see only their assigned warehouse data.
// Admins see everything (or filter via query param).

interface AuthUser {
  id: string;
  role: string;
  warehouseId?: string | null;
}

/**
 * Returns the warehouseId that should be applied to queries:
 *  - manager: forced to their warehouseId (overrides any query param)
 *  - admin/other: returns the user-provided warehouseId (or undefined)
 */
export function scopeWarehouseForUser(
  user: AuthUser | undefined,
  requestedWarehouseId: string | undefined,
): string | undefined {
  if (user?.role === 'manager' && user.warehouseId) {
    return user.warehouseId;
  }
  return requestedWarehouseId;
}

/**
 * Throws if a manager attempts to act on a different warehouse than their own.
 * Use this when manager submits create/update operations.
 */
export function assertManagerWarehouseAccess(
  user: AuthUser | undefined,
  targetWarehouseId: string | undefined | null,
): void {
  if (user?.role !== 'manager') return;
  if (!user.warehouseId) return;
  if (!targetWarehouseId) return;
  if (targetWarehouseId !== user.warehouseId) {
    const err = new Error('Manager can only operate on their assigned warehouse');
    (err as any).status = 403;
    throw err;
  }
}
