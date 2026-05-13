import { api } from '@/shared/lib/api';

export interface OnboardingStatus {
  tenantId: string;
  onboardingCompletedAt: string | null;
  hasWarehouse: boolean;
  hasLayout: boolean;
  hasSkus: boolean;
  hasSuppliers: boolean;
  hasInvitedUsers: boolean;
  counts: {
    warehouses: number;
    zones: number;
    skus: number;
    suppliers: number;
    invitedUsers: number;
  };
}

export interface LayoutZoneSpec {
  name: string;
  type: string;
  aisleCount?: number;
  rackCount: number;
  levels: number;
  positionsPerLevel: number;
}

export interface BulkLayoutResult {
  warehouseId: string;
  created: { zones: number; aisles: number; racks: number; bins: number };
}

export interface BulkImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export interface SkuImportRow {
  code?: string;
  name: string;
  category?: string;
  uom?: string;
  weight?: number;
  minStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  hsnCode?: string;
  batchTracking?: boolean;
  serialTracking?: boolean;
  expiryTracking?: boolean;
}

export interface SupplierCreate {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  paymentTerms?: string;
  address?: string;
}

export interface InviteRow {
  email: string;
  fullName: string;
  role: 'manager' | 'worker';
  warehouseId?: string;
  phone?: string;
}

export const onboardingApi = {
  async getStatus(): Promise<OnboardingStatus> {
    const { data } = await api.get('/api/v1/onboarding/status');
    return data.data;
  },

  async complete(): Promise<OnboardingStatus> {
    const { data } = await api.post('/api/v1/onboarding/complete', {});
    return data.data;
  },

  async createWarehouse(payload: Record<string, any>): Promise<{ id: string; code: string; name: string }> {
    const { data } = await api.post('/api/v1/warehouses', payload);
    return data.data;
  },

  async createLayout(warehouseId: string, zones: LayoutZoneSpec[]): Promise<BulkLayoutResult> {
    const { data } = await api.post(`/api/v1/warehouses/${warehouseId}/layout/bulk`, { zones });
    return data.data;
  },

  async importSkus(rows: SkuImportRow[]): Promise<BulkImportResult> {
    const { data } = await api.post('/api/v1/skus/import', { items: rows });
    return data.data;
  },

  async createSupplier(payload: SupplierCreate): Promise<any> {
    const { data } = await api.post('/api/v1/suppliers', payload);
    return data.data;
  },

  async inviteBulk(invites: InviteRow[]): Promise<{ invited: number; failed: number; errors: any[]; users: any[] }> {
    const { data } = await api.post('/api/v1/users/invite/bulk', { invites });
    return data.data;
  },
};
