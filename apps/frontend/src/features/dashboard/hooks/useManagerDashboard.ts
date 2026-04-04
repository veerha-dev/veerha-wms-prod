import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useManagerDashboard(warehouseId: string | undefined | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['manager-dashboard', warehouseId],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/dashboard/manager-stats', {
        params: { warehouseId },
      });
      return data.data;
    },
    enabled: isAuthenticated && !!warehouseId,
    refetchInterval: 30000,
  });
}
