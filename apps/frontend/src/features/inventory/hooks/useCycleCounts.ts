import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useCycleCounts(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['cycle-counts', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/cycle-counts', { params }); return { data: data.data || [], meta: data.meta || {} }; },
    enabled: isAuthenticated,
  });
}

export function useCycleCount(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['cycle-counts', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/cycle-counts/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCycleCountStats(warehouseId?: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['cycle-count-stats', warehouseId],
    queryFn: async () => { const params: any = {}; if (warehouseId) params.warehouseId = warehouseId; const { data } = await api.get('/api/v1/cycle-counts/stats', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

const invalidateAll = (qc: any) => { qc.invalidateQueries({ queryKey: ['cycle-counts'] }); qc.invalidateQueries({ queryKey: ['cycle-count-stats'] }); };

export function useCreateCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => { const { data } = await api.post('/api/v1/cycle-counts', payload); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Cycle count created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useAssignCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/assign`, { assignedTo }); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Worker assigned'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useStartCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/start`); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Count started'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useSubmitCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; physicalQty: number }[] }) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/submit`, { items }); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Counts submitted for review'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useReviewCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; action: string; notes?: string }[] }) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/review`, { items }); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Review saved'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCompleteCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/complete`); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Cycle count completed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCancelCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/cycle-counts/${id}/cancel`); return data.data; },
    onSuccess: () => { invalidateAll(qc); toast.success('Cycle count cancelled'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useDeleteCycleCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/api/v1/cycle-counts/${id}`); return id; },
    onSuccess: () => { invalidateAll(qc); toast.success('Cycle count deleted'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}
