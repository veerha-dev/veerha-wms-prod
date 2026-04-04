import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';
import type { BulkZoneCreation } from '@/shared/types/mapping';

export function useZones(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['zones', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/zones', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useZonesByWarehouse(warehouseId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['zones', 'by_warehouse', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/zones', { params: { warehouseId } }); return data.data; },
    enabled: isAuthenticated && !!warehouseId,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zone: any) => { const { data } = await api.post('/api/v1/zones', zone); return data.data; },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['zones'] }); 
      queryClient.invalidateQueries({ queryKey: ['zones', 'by_warehouse'] }); 
      toast.success('Zone created successfully'); 
    },
    onError: (e: any) => toast.error(`Failed to create zone: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/zones/${id}`, updates); return data.data; },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['zones'] }); 
      queryClient.invalidateQueries({ queryKey: ['zones', 'by_warehouse'] }); 
      toast.success('Zone updated successfully'); 
    },
    onError: (e: any) => toast.error(`Failed to update zone: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useBulkCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkZoneCreation) => {
      const { data } = await api.post('/api/v1/zones/bulk-create', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['aisles'] });
      queryClient.invalidateQueries({ queryKey: ['racks'] });
      queryClient.invalidateQueries({ queryKey: ['bins'] });
      queryClient.invalidateQueries({ queryKey: ['zones', 'by_warehouse'] });
      queryClient.invalidateQueries({ queryKey: ['aisles', 'by_warehouse'] });
      queryClient.invalidateQueries({ queryKey: ['racks', 'by_warehouse'] });
      queryClient.invalidateQueries({ queryKey: ['bins', 'by_warehouse'] });
      toast.success('Zone created with all locations successfully');
    },
    onError: (e: any) => toast.error(`Failed to bulk create zone: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/zones/${id}`); return id; },
    onSuccess: () => { 
      // Invalidate all zone-related queries
      queryClient.invalidateQueries({ queryKey: ['zones'] }); 
      queryClient.invalidateQueries({ queryKey: ['zones', 'by_warehouse'] }); 
      // Invalidate related warehouse-specific queries
      queryClient.invalidateQueries({ queryKey: ['racks', 'by_warehouse'] }); 
      queryClient.invalidateQueries({ queryKey: ['bins', 'by_warehouse'] }); 
      // Invalidate mapping-related queries
      queryClient.invalidateQueries({ queryKey: ['mapping-audit-logs'] }); 
      queryClient.invalidateQueries({ queryKey: ['mapping-completeness'] }); 
      // Force refresh any warehouse-specific queries
      queryClient.invalidateQueries({ predicate: (query) => {
        const queryKey = query.queryKey;
        return Array.isArray(queryKey) && 
               (queryKey.includes('zones') || 
                queryKey.includes('racks') || 
                queryKey.includes('bins') ||
                queryKey.includes('warehouse') ||
                queryKey.includes('mapping'));
      }});
      // Force refetch active queries
      queryClient.refetchQueries({ queryKey: ['zones', 'by_warehouse'] });
      toast.success('Zone deleted successfully'); 
    },
    onError: (e: any) => toast.error(`Failed to delete zone: ${e.response?.data?.error?.message || e.message}`),
  });
}
