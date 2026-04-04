// STUB: Returns empty data until workflow metrics API endpoints are created on the backend.
// Connect to GET /api/v1/workflow-metrics when available.
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useWorkflowMetrics() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['workflow-metrics'], queryFn: async () => ({}), enabled: isAuthenticated });
}

export function useSLABreachedTasks(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['sla-breached-tasks', params],
    queryFn: async () => [] as any[],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}
