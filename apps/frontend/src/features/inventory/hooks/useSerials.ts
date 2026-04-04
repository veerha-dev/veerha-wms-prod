import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useSerials(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['serials', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/serials', { params });
      return { data: data.data || [], meta: data.meta || {} };
    },
    enabled: isAuthenticated,
  });
}

export function useSerialsBySku(skuId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['serials', 'by-sku', skuId],
    queryFn: async () => { const { data } = await api.get(`/api/v1/serials/by-sku/${skuId}`); return data.data; },
    enabled: isAuthenticated && !!skuId,
  });
}

export function useSerialTimeline(serialId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['serial-timeline', serialId],
    queryFn: async () => { const { data } = await api.get(`/api/v1/serials/${serialId}/timeline`); return data.data; },
    enabled: isAuthenticated && !!serialId,
  });
}

export function useSerialStats(warehouseId?: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['serial-stats', warehouseId],
    queryFn: async () => {
      const params: any = {};
      if (warehouseId) params.warehouseId = warehouseId;
      const { data } = await api.get('/api/v1/serials/stats', { params });
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useAvailableSerials(skuId: string | null, binId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['serials', 'available', skuId, binId],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/serials/available', { params: { skuId, binId } });
      return data.data;
    },
    enabled: isAuthenticated && !!skuId && !!binId,
  });
}

export function useBulkCreateSerials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { serialNumbers: string[]; skuId: string; warehouseId?: string; grnId?: string; grnItemId?: string; poId?: string; supplierId?: string }) => {
      const { data } = await api.post('/api/v1/serials/bulk', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      queryClient.invalidateQueries({ queryKey: ['serial-stats'] });
      toast.success('Serial numbers registered');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function usePickSerials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { serialIds: string[]; pickListId: string; soId?: string; customerId?: string }) => {
      const { data } = await api.post('/api/v1/serials/pick', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] });
      queryClient.invalidateQueries({ queryKey: ['serial-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pick-lists'] });
      toast.success('Serial numbers picked');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}
