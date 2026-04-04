import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useAuditTrail(page?: number | Record<string, any>, pageSize?: number, filters?: Record<string, any>) {
  const { isAuthenticated } = useAuth();

  // Handle both useAuditTrail(params) and useAuditTrail(page, pageSize, filters)
  let params: Record<string, any> = {};
  if (typeof page === 'object') {
    params = page || {};
  } else {
    params = { page: page || 1, limit: pageSize || 50, ...filters };
  }

  return useQuery({
    queryKey: ['audit-trail', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/inventory/movements', { params });
      const rows = (data.data || []).map((m: any) => ({
        id: m.id,
        action: m.movementType || m.movement_type || 'update',
        entityType: 'inventory',
        entity_type: 'inventory',
        entityId: m.skuId || m.sku_id || m.id,
        entity_id: m.skuId || m.sku_id || m.id,
        userName: 'System',
        user_name: 'System',
        reason: m.notes || m.referenceType || '',
        createdAt: m.createdAt || m.created_at,
        created_at: m.createdAt || m.created_at,
        details: m,
      }));
      return { data: rows, totalCount: rows.length };
    },
    enabled: isAuthenticated,
  });
}

export function useAuditEntityTypes() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['audit-entity-types'],
    queryFn: async () => ['warehouse', 'sku', 'user', 'order', 'shipment', 'grn', 'adjustment'],
    enabled: isAuthenticated,
  });
}
