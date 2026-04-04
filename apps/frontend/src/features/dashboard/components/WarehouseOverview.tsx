import { useWMS } from '@/shared/contexts/WMSContext';
import { cn } from '@/shared/lib/utils';
import { Building2, MapPin, Clock, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';

export function WarehouseOverview() {
  const { warehouses, selectWarehouse, selectedWarehouse } = useWMS();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'logistics':
        return 'bg-info/10 text-info border-info/20';
      case 'manufacturing':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'franchise':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'fulfillment_hub':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-destructive';
    if (utilization >= 70) return 'text-warning';
    return 'text-success';
  };

  const calculateUtilization = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="wms-card h-full flex flex-col">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Godowns</h2>
          <p className="text-sm text-muted-foreground">
            {warehouses.length} active locations
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <div className="divide-y divide-border flex-1 overflow-y-auto">
        {warehouses.map((warehouse, index) => {
          const utilization = calculateUtilization(warehouse.used_capacity, warehouse.total_capacity);
          
          return (
            <div
              key={`overview-warehouse-${warehouse.id}-${index}`}
              onClick={() => selectWarehouse(warehouse)}
              className={cn(
                'p-4 hover:bg-muted/30 cursor-pointer transition-colors',
                selectedWarehouse?.id === warehouse.id && 'bg-accent/5 border-l-2 border-l-accent'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{warehouse.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {warehouse.city}, {warehouse.country}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full border capitalize',
                    getTypeColor(warehouse.type)
                  )}
                >
                  {warehouse.type.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp
                      className={cn('h-3.5 w-3.5', getUtilizationColor(utilization))}
                    />
                    <span
                      className={cn('font-medium', getUtilizationColor(utilization))}
                    >
                      {utilization}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={utilization}
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  {(warehouse.used_capacity || 0).toLocaleString()} /{' '}
                  {(warehouse.total_capacity || 0).toLocaleString()} units
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
