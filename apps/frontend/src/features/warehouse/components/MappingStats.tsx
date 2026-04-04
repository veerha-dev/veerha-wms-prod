import { Layers, Grid3X3, Box, Package, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { WarehouseMappingStats } from '@/shared/types/mapping';
import { cn } from '@/shared/lib/utils';

interface MappingStatsProps {
  stats: WarehouseMappingStats;
}

export function MappingStats({ stats }: MappingStatsProps) {
  const statCards = [
    {
      label: 'Total Zones',
      value: stats.totalZones,
      icon: Layers,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Total Racks',
      value: stats.totalRacks,
      icon: Grid3X3,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Bins',
      value: stats.totalBins,
      icon: Box,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Occupied Bins',
      value: stats.occupiedBins,
      icon: Package,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      label: 'Locked Bins',
      value: stats.lockedBins,
      icon: Lock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Damaged Bins',
      value: stats.damagedBins,
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stat.value || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Utilization</span>
              <span className={cn(
                'text-lg font-bold',
                (stats.overallUtilization || 0) > 90 ? 'text-destructive' :
                (stats.overallUtilization || 0) > 75 ? 'text-warning' :
                'text-success'
              )}>
                {stats.overallUtilization || 0}%
              </span>
            </div>
            <Progress value={stats.overallUtilization || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.occupiedBins || 0} of {stats.totalBins || 0} bins occupied
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mapping Completeness</span>
              <span className="text-lg font-bold text-success">
                {stats.mappingCompleteness || 0}%
              </span>
            </div>
            <Progress value={stats.mappingCompleteness || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              All zones and racks are properly configured
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
