import { useWarehouses } from './useWarehouses';
import { useZones } from './useZones';
import { useRacks } from './useRacks';
import { useBins } from './useBins';
import { useZonesByWarehouse } from './useZones';
import { useRacksByWarehouse } from './useRacksByWarehouse';
import { useBinsByWarehouse } from './useBinsByWarehouse';
import { useStockLevelsByWarehouse } from '@/features/inventory/hooks/useStockLevels';
import { useMovements } from '@/features/inventory/hooks/useMovements';
import { formatDistanceToNow } from 'date-fns';

export function useWarehouseRealtime(warehouseId?: string) {
  const warehouses = useWarehouses(warehouseId ? { id: warehouseId } : undefined);
  const zones = useZones(warehouseId ? { warehouseId } : undefined);
  const racks = useRacks(warehouseId ? { warehouseId } : undefined);
  const bins = useBins(warehouseId ? { warehouseId } : undefined);
  return { warehouses, zones, racks, bins };
}

export function useWarehouseStructure(warehouseId: string) {
  const { data: zones = [], isLoading: zonesLoading } = useZonesByWarehouse(warehouseId);
  const { data: racks = [], isLoading: racksLoading } = useRacksByWarehouse(warehouseId);
  const { data: bins = [], isLoading: binsLoading } = useBinsByWarehouse(warehouseId);
  const { data: stockLevels = [], isLoading: stockLoading } = useStockLevelsByWarehouse(warehouseId);
  
  const uniqueSkus = new Set(stockLevels.map((sl: any) => sl.skuId)).size;
  
  return {
    data: {
      zones: zones.length,
      racks: racks.length,
      bins: bins.length,
      skus: uniqueSkus,
    },
    loading: zonesLoading || racksLoading || binsLoading || stockLoading,
  };
}

function formatMovementAction(type: string): string {
  const actions: Record<string, string> = {
    inbound: 'Stock Received',
    outbound: 'Stock Shipped',
    transfer: 'Zone Transfer',
    putaway: 'Putaway Complete',
    pick: 'Picking Complete',
    return: 'Return Processed',
    adjustment: 'Stock Adjusted',
  };
  return actions[type] || 'Movement';
}

export function useWarehouseActivity(warehouseId: string) {
  const { data: movements = [], isLoading } = useMovements({ warehouseId });
  
  function formatMovementAction(type: string): string {
    const actions: Record<string, string> = {
      inbound: 'Stock Received',
      outbound: 'Stock Shipped', 
      transfer: 'Zone Transfer',
      adjustment: 'Stock Adjusted',
      return: 'Return Processed',
      damaged: 'Damaged Stock',
      cycle_count: 'Cycle Count',
    };
    return actions[type] || 'Movement';
  }
  
  const warehouseMovements = movements
    .slice(0, 10)
    .map((m: any) => {
      const dateValue = m.createdAt || m.timestamp;
      let timeStr = 'recently';
      try {
        if (dateValue) {
          timeStr = formatDistanceToNow(new Date(dateValue), { addSuffix: true });
        }
      } catch {
        timeStr = 'recently';
      }
      return {
        id: m.id,
        type: m.movementType || m.type,
        action: formatMovementAction(m.movementType || m.type),
        item: m.sku?.name || m.skuName || 'Unknown item',
        quantity: m.quantity,
        time: timeStr,
        performedBy: m.performedBy?.fullName || m.triggeredBy,
        notes: m.notes || m.reason,
      };
    });
  
  return {
    activities: warehouseMovements,
    loading: isLoading,
    isUsingMockData: false, // Always use real data now
  };
}
