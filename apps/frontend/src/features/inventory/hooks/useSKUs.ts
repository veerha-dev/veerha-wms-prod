import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useSKUs(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['skus', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/skus', { params }); return data.data; },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSKU(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sku', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/skus/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useSKUStock(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sku-stock', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/skus/${id}/stock`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateSKU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sku: any) => { const { data } = await api.post('/api/v1/skus', sku); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['skus'] }); toast.success('SKU created successfully'); },
    onError: (e: any) => toast.error(`Failed to create SKU: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateSKU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/skus/${id}`, updates); return data.data; },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['skus'] }); queryClient.invalidateQueries({ queryKey: ['sku', data.id] }); toast.success('SKU updated successfully'); },
    onError: (e: any) => toast.error(`Failed to update SKU: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteSKU() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/skus/${id}`); return id; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['skus'] }); toast.success('SKU deleted successfully'); },
    onError: (e: any) => toast.error(`Failed to delete SKU: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useBulkCreateSKUs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: any[]) => { 
      const { data } = await api.post('/api/v1/skus/bulk', { items }); 
      return data.data; 
    },
    onSuccess: (result) => { 
      queryClient.invalidateQueries({ queryKey: ['skus'] }); 
      toast.success(`Bulk create completed: ${result.created} created, ${result.failed} failed`);
    },
    onError: (e: any) => toast.error(`Failed to bulk create SKUs: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useBulkUpdateSKUs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; data: any }[]) => {
      const results = await Promise.allSettled(
        updates.map(({ id, data }) => api.put(`/api/v1/skus/${id}`, data))
      );
      const fulfilled = results.filter(r => r.status === 'fulfilled').length;
      const rejected = results.filter(r => r.status === 'rejected').length;
      return { fulfilled, rejected };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      toast.success(`Bulk update completed: ${result.fulfilled} updated, ${result.rejected} failed`);
    },
    onError: (e: any) => toast.error(`Failed to bulk update SKUs: ${e.response?.data?.error?.message || e.message}`),
  });
}
