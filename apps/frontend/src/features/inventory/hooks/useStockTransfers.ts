import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useStockTransfers(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['stock-transfers', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/stock-transfers', { params }); return { data: data.data || [], meta: data.meta || {} }; },
    enabled: isAuthenticated,
  });
}

export function useStockTransfer(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['stock-transfers', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/stock-transfers/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useStockTransferStats(warehouseId?: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['stock-transfer-stats', warehouseId],
    queryFn: async () => { const params: any = {}; if (warehouseId) params.warehouseId = warehouseId; const { data } = await api.get('/api/v1/stock-transfers/stats', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

const inv = (qc: any) => { qc.invalidateQueries({ queryKey: ['stock-transfers'] }); qc.invalidateQueries({ queryKey: ['stock-transfer-stats'] }); qc.invalidateQueries({ queryKey: ['inventory'] }); };

export function useCreateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: any) => { const { data } = await api.post('/api/v1/stock-transfers', p); return data.data; },
    onSuccess: () => { inv(qc); toast.success('Transfer requested'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useApproveStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/stock-transfers/${id}/approve`); return data.data; },
    onSuccess: () => { inv(qc); toast.success('Transfer approved'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useStartTransit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/stock-transfers/${id}/start-transit`); return data.data; },
    onSuccess: () => { inv(qc); toast.success('Transfer in transit'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCompleteStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/stock-transfers/${id}/complete`); return data.data; },
    onSuccess: () => { inv(qc); toast.success('Transfer completed — stock moved'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCancelStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/stock-transfers/${id}/cancel`); return data.data; },
    onSuccess: () => { inv(qc); toast.success('Transfer cancelled'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}
