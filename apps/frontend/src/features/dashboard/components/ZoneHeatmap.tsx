import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useZoneContext } from '@/shared/contexts/ZoneContext';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  bulk: { bg: 'bg-wms-storage/20', border: 'border-wms-storage/40', text: 'text-wms-storage' },
  rack: { bg: 'bg-wms-picking/20', border: 'border-wms-picking/40', text: 'text-wms-picking' },
  cold: { bg: 'bg-wms-cold/20', border: 'border-wms-cold/40', text: 'text-wms-cold' },
  hazmat: { bg: 'bg-destructive/20', border: 'border-destructive/40', text: 'text-destructive' },
  staging: { bg: 'bg-wms-receiving/20', border: 'border-wms-receiving/40', text: 'text-wms-receiving' },
  dispatch: { bg: 'bg-wms-shipping/20', border: 'border-wms-shipping/40', text: 'text-wms-shipping' },
  returns: { bg: 'bg-wms-returns/20', border: 'border-wms-returns/40', text: 'text-wms-returns' },
  quarantine: { bg: 'bg-warning/20', border: 'border-warning/40', text: 'text-warning' },
};

const getUtilizationColor = (utilization: number) => {
  if (utilization >= 90) return 'bg-destructive/80';
  if (utilization >= 70) return 'bg-warning/80';
  if (utilization >= 50) return 'bg-accent/80';
  return 'bg-success/80';
};

export function ZoneHeatmap() {
  const { zones, isLoading } = useZoneContext();

  // Calculate zone data with utilization
  const zoneData = zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    type: zone.type,
    utilization: zone.utilization,
    bins: 0, // Will be calculated when bins are integrated
    isActive: zone.is_active,
    status: zone.status,
  }));

  const hasZones = zoneData.length > 0;

  return (
    <div className="wms-card h-full flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Zone Overview</h2>
            <p className="text-sm text-muted-foreground">Real-time zone utilization</p>
          </div>
          {hasZones && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-muted-foreground">&lt;50%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="text-muted-foreground">50-70%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="text-muted-foreground">70-90%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-muted-foreground">&gt;90%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col overflow-hidden">
        {!hasZones ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No zones configured</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Create zones in your warehouses to see utilization overview here
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/warehouses">
                <Plus className="h-4 w-4 mr-2" />
                Configure Zones
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto">
            {zoneData.map((zone) => {
              const colors = typeColors[zone.type] || typeColors.bulk;
              return (
                <Tooltip key={zone.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'relative p-5 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
                        colors.bg,
                        colors.border,
                        !zone.isActive && 'opacity-50'
                      )}
                    >
                      {/* Activity indicator */}
                      <div
                        className={cn(
                          'absolute top-2 right-2 h-2 w-2 rounded-full',
                          zone.isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                        )}
                      />

                      <h4 className="font-medium text-base text-foreground truncate pr-4">
                        {zone.name}
                      </h4>
                      <p className="text-sm text-muted-foreground capitalize mt-1">
                        {zone.type ? zone.type.replace(/-/g, ' ') : 'N/A'}
                      </p>

                      {/* Utilization bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className="font-medium">{zone.utilization}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-background/50 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getUtilizationColor(zone.utilization))}
                            style={{ width: `${zone.utilization}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {zone.bins} bins
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone.bins} bins • {zone.utilization}% utilized
                      </p>
                      <p className="text-xs">
                        Status: <span className="capitalize">{zone.isActive ? 'Active' : 'Inactive'}</span>
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
