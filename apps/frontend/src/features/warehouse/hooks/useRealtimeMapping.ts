import { useAuth } from '@/shared/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';

export function useRealtimeMapping(warehouseId?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['mapping', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/bins', { params: { warehouseId, limit: 1000 } }); return data.data || []; },
    enabled: isAuthenticated && !!warehouseId,
    refetchInterval: 30000,
  });
}
