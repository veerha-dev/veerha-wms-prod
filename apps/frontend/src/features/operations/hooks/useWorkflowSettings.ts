// STUB: Returns default settings until workflow settings API endpoints are created on the backend.
// Connect to GET/PUT /api/v1/settings/workflow when available.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export type WorkflowSettings = {
  autoAssignTasks: boolean;
  requireQCOnReceipt: boolean;
  enableSLAAlerts: boolean;
  defaultTaskPriority: string;
  slaThresholdHours: number;
  notifyOnException: boolean;
};

export function useWorkflowSettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['workflow-settings'],
    queryFn: async (): Promise<WorkflowSettings> => ({
      autoAssignTasks: false,
      requireQCOnReceipt: true,
      enableSLAAlerts: true,
      defaultTaskPriority: 'medium',
      slaThresholdHours: 24,
      notifyOnException: true,
    }),
    enabled: isAuthenticated,
  });
}

export function useUpdateWorkflowSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<WorkflowSettings>) => settings,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflow-settings'] }); toast.success('Workflow settings updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}
