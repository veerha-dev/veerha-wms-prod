import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useInvoices(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/invoices', { params });
      return { data: data.data || [], meta: data.meta || {} };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useInvoice(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/invoices/${id}`);
      return data.data;
    },
    enabled: isAuthenticated && !!id,
  });
}

export function useInvoiceStats(warehouseId?: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['invoice-stats', warehouseId],
    queryFn: async () => {
      const params: any = {};
      if (warehouseId) params.warehouseId = warehouseId;
      const { data } = await api.get('/api/v1/invoices/stats', { params });
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: any) => {
      const { data } = await api.post('/api/v1/invoices', invoice);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice created successfully');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data } = await api.put(`/api/v1/invoices/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice updated');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, paidAmount }: any) => {
      const { data } = await api.patch(`/api/v1/invoices/${id}/status`, { status, paidAmount });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Status updated');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/v1/invoices/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
      toast.success('Invoice deleted');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}
