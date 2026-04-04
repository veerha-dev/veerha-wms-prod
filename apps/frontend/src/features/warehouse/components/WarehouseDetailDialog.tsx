
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import {
  Building2,
  MapPin,
  Clock,
  Package,
  Calendar,
  TrendingUp,
  Users,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Wrench,
  LayoutGrid,
  Activity,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { useWarehouseStructure, useWarehouseActivity } from '@/features/warehouse/hooks/useWarehouseRealtime';

type DBWarehouse = any;

interface WarehouseDetailDialogProps {
  warehouse: DBWarehouse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-success bg-success/10' },
  inactive: { label: 'Inactive', icon: AlertCircle, color: 'text-muted-foreground bg-muted' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-warning bg-warning/10' },
};

const warehouseTypeLabels: Record<string, string> = {
  logistics: 'Logistics Godown',
  manufacturing: 'Manufacturing Unit',
  franchise: 'Franchise Outlet',
  hub: 'Distribution Centre',
  cold_storage: 'Cold Storage',
  bonded: 'Bonded Warehouse',
};

export function WarehouseDetailDialog({
  warehouse,
  open,
  onOpenChange,
}: WarehouseDetailDialogProps) {
  // Use real-time hooks - must be called before any conditional returns
  const { data: structureData, loading: structureLoading } = useWarehouseStructure(warehouse?.id || '');
  const { activities, loading: activityLoading, isUsingMockData } = useWarehouseActivity(warehouse?.id || '');
  
  if (!warehouse) return null;

  const status = statusConfig[warehouse.status as keyof typeof statusConfig] || statusConfig.active;
  const StatusIcon = status.icon;
  
  const capacity = (warehouse as any).totalCapacity ?? warehouse.total_capacity ?? 0;
  const usedSpace = (warehouse as any).currentOccupancy ?? warehouse.current_occupancy ?? 0;
  const utilization = capacity > 0 ? Math.round((usedSpace / capacity) * 100) : 0;
  
  const address = [(warehouse as any).addressLine1 || warehouse.address_line1, (warehouse as any).addressLine2 || warehouse.address_line2].filter(Boolean).join(', ') || 'No address';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{warehouse.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {address}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {warehouseTypeLabels[warehouse.type] || warehouse.type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={cn('gap-1', status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Capacity</span>
                </div>
                <p className="text-lg font-semibold">{capacity.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">units</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Utilization</span>
                </div>
                <p className={cn(
                  'text-lg font-semibold',
                  utilization >= 90 ? 'text-destructive' :
                  utilization >= 70 ? 'text-warning' : 'text-success'
                )}>
                  {utilization}%
                </p>
                <p className="text-xs text-muted-foreground">{usedSpace.toLocaleString('en-IN')} units used</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Boxes className="h-4 w-4" />
                  <span className="text-xs">Total SKUs</span>
                </div>
                <p className="text-lg font-semibold">{(structureData?.skus || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">active items</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Workers</span>
                </div>
                <p className="text-lg font-semibold">-</p>
                <p className="text-xs text-muted-foreground">assigned</p>
              </div>
            </div>

            {/* Utilization Progress */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Space Utilization</span>
                <span className={cn(
                  'text-sm font-semibold',
                  utilization >= 90 ? 'text-destructive' :
                  utilization >= 70 ? 'text-warning' : 'text-success'
                )}>
                  {utilization}%
                </span>
              </div>
              <Progress value={utilization} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{usedSpace.toLocaleString('en-IN')} units used</span>
                <span>{(capacity - usedSpace).toLocaleString('en-IN')} units available</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Location Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City</span>
                    <span className="font-medium">{warehouse.city || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State</span>
                    <span className="font-medium">{warehouse.state || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pin Code</span>
                    <span className="font-medium">{warehouse.postalCode || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country</span>
                    <span className="font-medium">{warehouse.country || 'India'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Operational Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Created
                    </span>
                    <span className="font-medium">
                      {(warehouse.createdAt || warehouse.created_at) ? format(new Date(warehouse.createdAt || warehouse.created_at), 'dd MMM yyyy') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{warehouseTypeLabels[warehouse.type] || warehouse.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="structure" className="mt-4 space-y-4">
            {/* Structure Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-info/5 border border-info/20 text-center">
                <p className="text-2xl font-bold text-info">
                  {structureLoading ? '-' : (structureData?.zones || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Zones</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 text-center">
                <p className="text-2xl font-bold text-accent">
                  {structureLoading ? '-' : (structureData?.racks || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Racks</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20 text-center">
                <p className="text-2xl font-bold text-warning">
                  {structureLoading ? '-' : (structureData?.bins || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Bins</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20 text-center">
                <p className="text-2xl font-bold text-success">
                  {structureLoading ? '-' : (structureData?.skus || 0)}
                </p>
                <p className="text-xs text-muted-foreground">SKUs</p>
              </div>
            </div>

            {/* Empty State or Content */}
            {(structureData?.zones === 0) && !structureLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No zones configured yet</p>
                <p className="text-sm">Configure zones to see the warehouse structure</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Real-time Structure Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">Just now</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Storage Units</span>
                      <span className="font-medium">{structureData?.bins || 0} bins</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recent Activity</h4>
              <Badge variant="outline" className="text-success">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-8"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as operations occur</p>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      activity.type === 'inbound' ? 'bg-success/10 text-success' :
                      activity.type === 'outbound' ? 'bg-info/10 text-info' :
                      activity.type === 'transfer' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                    )}>
                      {activity.type === 'inbound' ? <Package className="h-4 w-4" /> :
                       activity.type === 'outbound' ? <TrendingUp className="h-4 w-4" /> :
                       activity.type === 'transfer' ? <Boxes className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.item}</p>
                      {activity.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {activity.quantity > 0 && (
                        <p className="text-sm font-medium">{activity.quantity} units</p>
                      )}
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
