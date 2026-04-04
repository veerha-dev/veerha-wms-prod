import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function usePickLists(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['pick-lists', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/pick-lists', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function usePickList(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['pick-list', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/pick-lists/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreatePickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pl: any) => { const { data } = await api.post('/api/v1/pick-lists', pl); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Pick list created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useAssignPickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => { const { data } = await api.post(`/api/v1/pick-lists/${id}/assign`, { userId }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Pick list assigned'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function usePickItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemId, quantityPicked }: { id: string; itemId: string; quantityPicked: number }) => {
      const { data } = await api.post(`/api/v1/pick-lists/${id}/pick/${itemId}`, { quantityPicked }); return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Item picked'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCompletePickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/pick-lists/${id}/complete`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Pick list completed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function usePendingPicks(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['pick-lists', 'pending', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/pick-lists', { params: { ...params, status: 'pending' } }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useGeneratePickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      strategy: string;
      orderIds: string[];
      warehouseId: string;
      assignedTo?: string;
      priority?: string;
      batchSize?: number;
      notes?: string;
    }) => {
      const { data } = await api.post('/api/v1/pick-lists/generate', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Pick list generated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useStartPicking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/pick-lists/${id}/start`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Picking started'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useRecordPick() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemId, quantityPicked }: { id: string; itemId: string; quantityPicked: number }) => {
      const { data } = await api.post(`/api/v1/pick-lists/${id}/pick/${itemId}`, { quantityPicked }); return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pick-lists'] }); toast.success('Pick recorded'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export const useCompletePicking = useCompletePickList;
