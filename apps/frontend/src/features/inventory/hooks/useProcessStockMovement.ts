import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { toast } from 'sonner';

export function useProcessStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movement: any) => { const { data } = await api.post('/api/v1/inventory/movements', movement); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); queryClient.invalidateQueries({ queryKey: ['movements'] }); toast.success('Stock movement recorded'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
