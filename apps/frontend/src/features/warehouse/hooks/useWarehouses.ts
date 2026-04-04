import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useWarehouses(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/warehouses', { params });
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useWarehouse(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/warehouses/${id}`);
      return data.data;
    },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (warehouse: any) => {
      console.log('📤 Sending warehouse creation request:', warehouse);
      const { data } = await api.post('/api/v1/warehouses', warehouse);
      console.log('✅ Warehouse created successfully:', data);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: any) => {
      console.error('❌ Warehouse creation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      toast.error(`Failed to create warehouse: ${error.response?.data?.error?.message || error.message}`);
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data } = await api.put(`/api/v1/warehouses/${id}`, updates);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', data.id] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update warehouse: ${error.response?.data?.error?.message || error.message}`);
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/warehouses/${id}`);
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      await queryClient.refetchQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete warehouse: ${error.response?.data?.error?.message || error.message}`);
    },
  });
}
