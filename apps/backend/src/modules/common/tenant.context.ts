import { AsyncLocalStorage } from 'async_hooks';

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const tenantStorage = new AsyncLocalStorage<string>();

export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return tenantStorage.run(tenantId, fn);
}

export function getCurrentTenantId(): string {
  return tenantStorage.getStore() || DEFAULT_TENANT_ID;
}
