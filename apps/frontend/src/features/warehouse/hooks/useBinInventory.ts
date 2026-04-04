import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface BinInventoryData {
  binId: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDamaged: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
}

export function useBinInventory(binId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory', 'by_bin', binId],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory', { params: { binId } }); return data.data; },
    enabled: isAuthenticated && !!binId,
  });
}
