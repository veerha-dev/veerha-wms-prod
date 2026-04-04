import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useCustomers(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['customers', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/customers', { params }); return data.data || []; },
    enabled: isAuthenticated,
  });
}

export function useCustomer(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/customers/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (c: any) => { const { data } = await api.post('/api/v1/customers', c); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/customers/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/customers/${id}`); return id; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer deleted'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
