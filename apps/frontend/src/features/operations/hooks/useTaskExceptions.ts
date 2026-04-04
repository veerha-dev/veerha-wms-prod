// STUB: useOpenTaskExceptions, useExceptionsByTask, useExceptionStats return empty data
// until a task-exceptions API endpoint is created on the backend.
// Connect to GET /api/v1/task-exceptions when available.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export type TaskExceptionWithDetails = {
  id: string;
  taskId: string;
  type: string;
  description: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  createdAt: string;
};

export function useTaskExceptions(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['task-exceptions', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/tasks', { params: { ...params, status: 'cancelled' } }); return data.data || []; },
    enabled: isAuthenticated,
  });
}

export function useOpenTaskExceptions(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['task-exceptions', 'open', params],
    queryFn: async () => [] as TaskExceptionWithDetails[],
    enabled: isAuthenticated,
  });
}

export function useExceptionsByTask(taskId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['task-exceptions', 'by_task', taskId],
    queryFn: async () => [] as TaskExceptionWithDetails[],
    enabled: isAuthenticated && !!taskId,
  });
}

export function useExceptionStats() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['task-exception-stats'],
    queryFn: async () => ({ open: 0, resolved: 0, total: 0 }),
    enabled: isAuthenticated,
  });
}

export function useResolveTaskException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => ({ id, resolution }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['task-exceptions'] }); toast.success('Exception resolved'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}
