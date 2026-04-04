import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useTasks(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/tasks', { params }); return data.data || []; },
    enabled: isAuthenticated,
  });
}

export function useTask(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/tasks/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: any) => { const { data } = await api.post('/api/v1/tasks', task); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/tasks/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => { const { data } = await api.post(`/api/v1/tasks/${id}/assign`, { userId }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task assigned'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/tasks/${id}/start`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task started'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => { const { data } = await api.post(`/api/v1/tasks/${id}/complete`, { notes }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task completed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/tasks/${id}/cancel`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task cancelled'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
