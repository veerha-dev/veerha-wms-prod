import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useBinsByWarehouse(warehouseId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['bins', 'by_warehouse', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/bins', { params: { warehouseId, limit: 5000 } }); return data.data; },
    enabled: isAuthenticated && !!warehouseId,
  });
}
