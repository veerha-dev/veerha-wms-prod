import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useMappingAuditLogs(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['mapping-audit-logs', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory/movements', { params }); return data.data || []; },
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refetch every 5 seconds for realtime updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not focused
  });
}
