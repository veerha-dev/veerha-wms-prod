import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useGRNs(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['grns', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/grn', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useGRN(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['grn', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/grn/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grn: any) => { const { data } = await api.post('/api/v1/grn', grn); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grns'] }); toast.success('GRN created successfully'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCompleteGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/grn/${id}/complete`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grns'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('GRN completed — stock updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateGRNItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemId, ...updates }: { id: string; itemId: string; [key: string]: any }) => {
      const { data } = await api.put(`/api/v1/grn/${id}/items/${itemId}`, updates); return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['grns'] }); toast.success('GRN item updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
