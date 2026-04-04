import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useBins(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['bins', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/bins', { params: { ...params, limit: params?.limit || 5000 } }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useBinsByRack(rackId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['bins', 'by_rack', rackId],
    queryFn: async () => { const { data } = await api.get('/api/v1/bins', { params: { rackId, limit: 5000 } }); return data.data; },
    enabled: isAuthenticated && !!rackId,
  });
}

export function useCreateBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bin: any) => { const { data } = await api.post('/api/v1/bins', bin); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); toast.success('Bin created successfully'); },
    onError: (e: any) => toast.error(`Failed to create bin: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/bins/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); toast.success('Bin updated successfully'); },
    onError: (e: any) => toast.error(`Failed to update bin: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useLockBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => { const { data } = await api.post(`/api/v1/bins/${id}/lock`, { reason }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); toast.success('Bin locked'); },
    onError: (e: any) => toast.error(`Failed to lock bin: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUnlockBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/bins/${id}/unlock`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); toast.success('Bin unlocked'); },
    onError: (e: any) => toast.error(`Failed to unlock bin: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/bins/${id}`); return id; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bins'] }); toast.success('Bin deleted successfully'); },
    onError: (e: any) => toast.error(`Failed to delete bin: ${e.response?.data?.error?.message || e.message}`),
  });
}
