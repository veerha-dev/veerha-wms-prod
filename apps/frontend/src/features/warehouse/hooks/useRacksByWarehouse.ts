import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useRacksByWarehouse(warehouseId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['racks', 'by_warehouse', warehouseId],
    queryFn: async () => { const { data } = await api.get('/api/v1/racks', { params: { warehouseId, limit: 500 } }); return data.data; },
    enabled: isAuthenticated && !!warehouseId,
  });
}
