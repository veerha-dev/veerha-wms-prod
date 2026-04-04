import { useWMS } from '@/shared/contexts/WMSContext';
import { Building2, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { cn } from '@/shared/lib/utils';

interface WarehouseSelectorProps {
  onWarehouseChange?: () => void;
}

export function WarehouseSelector({ onWarehouseChange }: WarehouseSelectorProps) {
  const { warehouses, selectedWarehouse, selectWarehouse } = useWMS();

  const handleSelect = (warehouse: typeof warehouses[0]) => {
    selectWarehouse(warehouse);
    onWarehouseChange?.();
  };

  const warehouseTypeLabels: Record<string, string> = {
    'logistics': 'Logistics Godown',
    'manufacturing': 'Manufacturing Unit',
    'franchise': 'Franchise Outlet',
    'fulfillment-hub': 'Distribution Centre',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12 px-4 gap-3 min-w-[280px] justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{selectedWarehouse?.name || 'Select Warehouse'}</p>
              <p className="text-xs text-muted-foreground">
                {selectedWarehouse ? warehouseTypeLabels[selectedWarehouse.type] : 'Choose a warehouse'}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px]">
        <DropdownMenuLabel>Available Warehouses</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {warehouses.map((warehouse) => {
          const isSelected = selectedWarehouse?.id === warehouse.id;
          const cap = (warehouse as any).totalCapacity ?? warehouse.total_capacity ?? 0;
          const used = (warehouse as any).currentOccupancy ?? warehouse.used_capacity ?? 0;
          const utilization = cap > 0 
            ? Math.round((used / cap) * 100)
            : 0;
          const isComplete = utilization >= 0;
          
          return (
            <DropdownMenuItem
              key={warehouse.id}
              onClick={() => handleSelect(warehouse)}
              className={cn(
                'flex flex-col items-start gap-2 p-3 cursor-pointer',
                isSelected && 'bg-accent/10'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{warehouse.name}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {warehouse.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                <span>{warehouseTypeLabels[warehouse.type]}</span>
                <span>•</span>
                <span>{warehouse.city}</span>
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Capacity Usage</span>
                  <span className={cn(
                    'font-medium',
                    utilization > 90 ? 'text-destructive' :
                    utilization > 75 ? 'text-warning' :
                    'text-success'
                  )}>
                    {utilization}%
                  </span>
                </div>
                <Progress value={utilization} className="h-1.5" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                {isComplete ? (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Mapping Complete
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning">
                    <AlertCircle className="h-3 w-3" />
                    Mapping Incomplete
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
