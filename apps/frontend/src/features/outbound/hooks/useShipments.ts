import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useShipments(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/shipments', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useShipment(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/shipments/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (s: any) => { const { data } = await api.post('/api/v1/shipments', s); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/shipments/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDispatchShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/shipments/${id}/dispatch`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment dispatched'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useMarkShipmentDelivered() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/shipments/${id}/deliver`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment marked as delivered'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function usePendingShipments() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['shipments', 'pending'],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/shipments', { params: { status: 'pending' } }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export const useMarkDelivered = useMarkShipmentDelivered;
