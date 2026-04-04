/**
 * Extract tenantId from request user (JWT payload) with fallback to default.
 * Usage in controllers: const tenantId = getTenantId(req);
 */
export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export function getTenantId(req: any): string {
  return req?.user?.tenantId || DEFAULT_TENANT_ID;
}
