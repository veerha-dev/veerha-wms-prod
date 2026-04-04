import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useMovements(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['movements', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/inventory/movements', { params }); return data.data || []; },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000, // Poll every 10 seconds for real-time updates
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movement: any) => {
      const payload = {
        movementType: movement.type || movement.movementType,
        skuId: movement.skuId,
        warehouseId: movement.destinationWarehouse || movement.sourceWarehouse || movement.warehouseId,
        fromBinId: movement.sourceBin || movement.fromBinId || null,
        toBinId: movement.destinationBin || movement.toBinId || null,
        batchId: movement.batchId || null,
        quantity: parseInt(movement.quantity) || 0,
        referenceType: movement.referenceType || 'manual',
        referenceId: movement.reference || movement.referenceId || null,
        notes: movement.reason || movement.notes || null,
      };
      const { data } = await api.post('/api/v1/inventory/movements', payload);
      return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['movements'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Movement recorded'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
