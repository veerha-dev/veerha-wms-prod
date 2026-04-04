import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useModuleRegistry() {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['module-registry'], queryFn: async () => [], enabled: isAuthenticated });
}

export function useModules() { return useModuleRegistry(); }

export function useTenantModules() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['tenant-modules'],
    queryFn: async () => [],
    enabled: isAuthenticated,
  });
}

export function useIsModuleEnabled(moduleId: string) {
  const { data: modules } = useTenantModules();
  return Array.isArray(modules) ? modules.includes(moduleId) : true;
}

export function useToggleModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => ({ moduleId, enabled }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tenant-modules'] }); },
  });
}
