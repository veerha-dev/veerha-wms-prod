import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function usePutawayTasks(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['putaway', params],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/putaway', { params });
      return { data: data.data || [], meta: data.meta || {} };
    },
    enabled: isAuthenticated,
  });
}

export function usePutawayTask(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['putaway', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/putaway/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function usePutawayStats(warehouseId?: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['putaway-stats', warehouseId],
    queryFn: async () => {
      const params: any = {};
      if (warehouseId) params.warehouseId = warehouseId;
      const { data } = await api.get('/api/v1/putaway/stats', { params });
      return data.data;
    },
    enabled: isAuthenticated,
  });
}

export function useSuggestBinsPreview(warehouseId: string | null, skuId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['putaway-suggest-bins-preview', warehouseId, skuId],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/putaway/suggest-bins-preview', {
        params: { warehouseId, skuId },
      });
      return data.data;
    },
    enabled: isAuthenticated && !!warehouseId && !!skuId,
  });
}

export function useCreatePutaway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => { const { data } = await api.post('/api/v1/putaway', task); return data.data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-stats'] });
      toast.success('Putaway task created');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useGenerateFromGrn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grnId: string) => { const { data } = await api.post(`/api/v1/putaway/generate-from-grn/${grnId}`); return data.data; },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['putaway'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-stats'] });
      const count = Array.isArray(data) ? data.length : 1;
      toast.success(`${count} putaway task(s) generated from GRN`);
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useSuggestBins(taskId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['putaway-suggest-bins', taskId],
    queryFn: async () => { const { data } = await api.get(`/api/v1/putaway/${taskId}/suggest-bins`); return data.data; },
    enabled: isAuthenticated && !!taskId,
  });
}

export function useAssignBin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, binId, assignedTo }: { taskId: string; binId: string; assignedTo?: string }) => {
      const { data } = await api.post(`/api/v1/putaway/${taskId}/assign-bin`, { binId, assignedTo });
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['putaway'] }); toast.success('Bin assigned'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useStartPutaway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/putaway/${id}/start`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['putaway'] }); toast.success('Putaway started'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCompletePutaway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/putaway/${id}/complete`); return data.data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-stats'] });
      toast.success('Putaway completed — stock moved to bin');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}

export function useCancelPutaway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/putaway/${id}/cancel`); return data.data; },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['putaway'] });
      queryClient.invalidateQueries({ queryKey: ['putaway-stats'] });
      toast.success('Putaway cancelled');
    },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.message || e.message}`),
  });
}
