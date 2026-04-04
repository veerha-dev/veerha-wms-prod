import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export type InventorySettingsUpdate = {
  stockLockingEnabled?: boolean;
  negativeStockAllowed?: boolean;
  autoReorderEnabled?: boolean;
  batchTrackingEnabled?: boolean;
  expiryTrackingEnabled?: boolean;
  defaultReorderPoint?: number;
  defaultReorderQty?: number;
};

export function useInventorySettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['inventory-settings'],
    queryFn: async () => {
      // Settings are tenant-level; return sensible defaults until a settings endpoint exists
      return {
        stockLockingEnabled: true,
        negativeStockAllowed: false,
        autoReorderEnabled: false,
        batchTrackingEnabled: true,
        expiryTrackingEnabled: true,
        defaultReorderPoint: 10,
        defaultReorderQty: 50,
      };
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertInventorySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: InventorySettingsUpdate) => {
      // TODO: POST /api/v1/settings/inventory when backend endpoint is created
      return settings;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory-settings'] }); toast.success('Inventory settings saved'); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
}
