// STUB: Returns empty data until workflow templates API endpoints are created on the backend.
// Connect to GET/POST/PUT/DELETE /api/v1/workflow-templates when available.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export type WorkflowTemplate = {
  id: string;
  name: string;
  description?: string;
  taskType: string;
  isActive: boolean;
  steps: any[];
};

export function useWorkflowTemplates() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['workflow-templates'], queryFn: async () => [] as WorkflowTemplate[], enabled: isAuthenticated });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: Partial<WorkflowTemplate>) => template,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflow-templates'] }); toast.success('Workflow template created'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}

export function useToggleWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => ({ id, isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflow-templates'] }); toast.success('Template updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeleteWorkflowTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => id,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workflow-templates'] }); toast.success('Template deleted'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}
