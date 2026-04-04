import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { toast } from 'sonner';
import { useTasks as _useTasks } from './useTasks';

export { useTasks, useTask, useCreateTask, useUpdateTask, useAssignTask, useStartTask, useCompleteTask, useCancelTask } from './useTasks';

export function useEnhancedTasks(params?: Record<string, any>) {
  return _useTasks(params);
}

export type TaskWithDetails = any;

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { const { data } = await api.put(`/api/v1/tasks/${id}`, { status }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task status updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useAssignEnhancedTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => { const { data } = await api.post(`/api/v1/tasks/${id}/assign`, { userId }); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task assigned'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
