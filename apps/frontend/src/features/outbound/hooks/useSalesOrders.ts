import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useSalesOrders(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sales-orders', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/sales-orders', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useSalesOrder(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sales-order', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/sales-orders/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (so: any) => { const { data } = await api.post('/api/v1/sales-orders', so); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Sales order created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/sales-orders/${id}/confirm`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Sales order confirmed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/sales-orders/${id}/cancel`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Sales order cancelled'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/sales-orders/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sales-orders'] }); toast.success('Sales order updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useOrderStats(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sales-order-stats', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/sales-orders/stats', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export const useCreateOrder = useCreateSalesOrder;
export const useConfirmOrder = useConfirmSalesOrder;
export const useCancelOrder = useCancelSalesOrder;
