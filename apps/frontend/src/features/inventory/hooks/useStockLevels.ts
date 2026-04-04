import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useStockLevels(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory', { params }); return data.data || []; },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (s: any) => {
      console.log('[useCreateStockLevel] Sending data:', s);
      const payload = {
        skuId: s.skuId,
        warehouseId: s.warehouseId,
        binId: s.binId || null,
        batchId: s.batchId || null,
        quantityAvailable: parseInt(s.quantityAvailable) || 0,
        quantityReserved: parseInt(s.quantityReserved) || 0,
        quantityInTransit: parseInt(s.quantityInTransit) || 0,
        quantityDamaged: parseInt(s.quantityDamaged) || 0,
      };
      console.log('[useCreateStockLevel] Payload:', payload);
      const { data } = await api.post('/api/v1/inventory', payload);
      console.log('[useCreateStockLevel] Response:', data);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock level created'); },
    onError: (e: any) => { 
      console.error('[useCreateStockLevel] Error:', e);
      toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`); 
    },
  });
}

export function useUpdateStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data } = await api.put(`/api/v1/inventory/${id}`, updates);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock level updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteStockLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/inventory/${id}`); return id; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); },
  });
}

export function useLowStockItems(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory-low-stock', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory/low-stock', { params }); return data.data || []; },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}

export function useStockLevelsByWarehouse(warehouseId: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory', 'warehouse', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory', { params: { warehouseId } }); return data.data || []; },
    enabled: isAuthenticated && !!warehouseId,
  });
}

export function useExpiringBatches(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory-expiring', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory/expiring', { params }); return data.data || []; },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}
