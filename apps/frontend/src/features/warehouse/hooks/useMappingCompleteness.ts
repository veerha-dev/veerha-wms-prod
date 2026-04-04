import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useMappingCompleteness(warehouseId?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['mapping-completeness', warehouseId],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/stats');
      return { completeness: 100, ...(data.data || {}) };
    },
    enabled: isAuthenticated,
  });
}
