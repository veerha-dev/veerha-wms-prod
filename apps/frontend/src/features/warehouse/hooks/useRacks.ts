import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useRacks(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['racks', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/racks', { params: { ...params, limit: params?.limit || 500 } }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useRacksByZone(zoneId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['racks', 'by_zone', zoneId],
    queryFn: async () => { const { data } = await api.get('/api/v1/racks', { params: { zoneId, limit: 500 } }); return data.data; },
    enabled: isAuthenticated && !!zoneId,
  });
}

export function useCreateRack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rack: any) => { const { data } = await api.post('/api/v1/racks', rack); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['racks'] }); toast.success('Rack created successfully'); },
    onError: (e: any) => toast.error(`Failed to create rack: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateRack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/racks/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['racks'] }); toast.success('Rack updated successfully'); },
    onError: (e: any) => toast.error(`Failed to update rack: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteRack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/racks/${id}`); return id; },
    onSuccess: async () => { 
      await queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'racks'
      });
      await queryClient.refetchQueries({ 
        predicate: (query) => query.queryKey[0] === 'racks'
      });
      toast.success('Rack deleted successfully'); 
    },
    onError: (e: any) => toast.error(`Failed to delete rack: ${e.response?.data?.error?.message || e.message}`),
  });
}
