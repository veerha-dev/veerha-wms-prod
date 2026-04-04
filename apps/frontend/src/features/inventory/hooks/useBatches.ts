import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useBatches(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['batches', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/batches', { params: { limit: 500, ...params } }); return data.data || []; },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (b: any) => { const { data } = await api.post('/api/v1/batches', b); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Batch created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/batches/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); toast.success('Batch updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/api/v1/batches/${id}`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); toast.success('Batch deleted'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
