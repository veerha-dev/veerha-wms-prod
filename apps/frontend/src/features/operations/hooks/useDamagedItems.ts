import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useDamagedItems(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['damaged-items', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/damaged-items', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useDamagedItem(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['damaged-item', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/damaged-items/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useReportDamagedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => { const { data } = await api.post('/api/v1/damaged-items', item); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['damaged-items'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Damaged item reported'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateDamagedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/damaged-items/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['damaged-items'] }); toast.success('Damaged item updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDisposeDamagedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/damaged-items/${id}/dispose`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['damaged-items'] }); toast.success('Item disposed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
