import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useAisles(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['aisles', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/aisles', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useAislesByWarehouse(warehouseId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['aisles', 'by_warehouse', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/aisles', { params: { warehouseId, limit: 500 } }); return data.data; },
    enabled: isAuthenticated && !!warehouseId,
  });
}

export function useAislesByZone(zoneId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['aisles', 'by_zone', zoneId],
    queryFn: async () => { const { data } = await api.get('/api/v1/aisles', { params: { zoneId, limit: 500 } }); return data.data; },
    enabled: isAuthenticated && !!zoneId,
  });
}

export function useCreateAisle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aisle: any) => { const { data } = await api.post('/api/v1/aisles', aisle); return data.data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aisles'] });
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      toast.success('Aisle created successfully');
    },
    onError: (e: any) => toast.error(`Failed to create aisle: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateAisle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/aisles/${id}`, updates); return data.data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aisles'] });
      toast.success('Aisle updated successfully');
    },
    onError: (e: any) => toast.error(`Failed to update aisle: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteAisle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/aisles/${id}`); return id; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aisles'] });
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      queryClient.invalidateQueries({ queryKey: ['racks'] });
      toast.success('Aisle deleted successfully');
    },
    onError: (e: any) => toast.error(`Failed to delete aisle: ${e.response?.data?.error?.message || e.message}`),
  });
}
