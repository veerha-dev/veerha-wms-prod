import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useReturns(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['returns', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/returns', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useReturn(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['return', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/returns/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (r: any) => { const { data } = await api.post('/api/v1/returns', r); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); toast.success('Return created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/returns/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); toast.success('Return updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useReceiveReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/returns/${id}/receive`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); toast.success('Return received'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useProcessReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; [key: string]: any }) => { const { data } = await api.post(`/api/v1/returns/${id}/process`, body); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['returns'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Return processed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
