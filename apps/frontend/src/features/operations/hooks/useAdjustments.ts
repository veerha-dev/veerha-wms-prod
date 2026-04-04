import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useAdjustments(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['adjustments', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/adjustments', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useAdjustment(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['adjustment', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/adjustments/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adj: any) => { const { data } = await api.post('/api/v1/adjustments', adj); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adjustments'] }); toast.success('Adjustment request created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/adjustments/${id}/approve`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adjustments'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Adjustment approved — stock updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useRejectAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/adjustments/${id}/reject`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adjustments'] }); toast.success('Adjustment rejected'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
