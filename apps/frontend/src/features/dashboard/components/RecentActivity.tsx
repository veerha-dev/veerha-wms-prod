import { Package, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, Clock, Activity, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useMovements } from '@/features/inventory/hooks/useMovements';
import { useAlerts } from '@/features/operations/hooks/useAlerts';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, typeof Package> = {
  stock_in: Package,
  stock_out: Package,
  transfer: ArrowRight,
  return: RotateCcw,
  adjustment: Package,
  damage: AlertTriangle,
  putaway: Package,
  pick: Package,
  alert: AlertTriangle,
  completed: CheckCircle2,
};

const colorMap: Record<string, string> = {
  stock_in: 'bg-success/10 text-success',
  stock_out: 'bg-info/10 text-info',
  transfer: 'bg-accent/10 text-accent',
  return: 'bg-warning/10 text-warning',
  adjustment: 'bg-muted text-muted-foreground',
  damage: 'bg-destructive/10 text-destructive',
  putaway: 'bg-success/10 text-success',
  pick: 'bg-info/10 text-info',
  alert: 'bg-destructive/10 text-destructive',
};

export function RecentActivity() {
  const { data: movements = [] } = useMovements();
  const { data: alerts = [] } = useAlerts();

  // Combine movements and alerts into activity feed
  const activities = [
    ...movements.slice(0, 10).map(m => ({
      id: m.id,
      type: m.type,
      title: getMovementTitle(m.type),
      description: `${m.quantity} units - ${m.movement_number}`,
      time: m.performed_at,
    })),
    ...alerts.filter(a => !a.is_acknowledged).slice(0, 5).map(a => ({
      id: a.id,
      type: 'alert' as const,
      title: getAlertTitle(a.type),
      description: a.message,
      time: a.created_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
   .slice(0, 5);

  const hasActivity = activities.length > 0;

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Latest warehouse operations</p>
        </div>
        {hasActivity && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Live updates</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
        )}
      </div>
      
      {!hasActivity ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Activity will appear here as you manage inventory and operations
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/inventory">
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {activities.map((activity, index) => {
              const Icon = iconMap[activity.type] || Package;
              return (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-muted/30 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                        colorMap[activity.type] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground">{activity.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-border">
            <Link 
              to="/inventory" 
              className="w-full block text-center text-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              View All Activity →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function getMovementTitle(type: string): string {
  const titles: Record<string, string> = {
    stock_in: 'Stock Received',
    stock_out: 'Stock Shipped',
    transfer: 'Zone Transfer',
    return: 'Return Processed',
    adjustment: 'Stock Adjusted',
    damage: 'Damage Reported',
    putaway: 'Putaway Complete',
    pick: 'Picking Complete',
  };
  return titles[type] || 'Inventory Movement';
}

function getAlertTitle(type: string): string {
  const titles: Record<string, string> = {
    low_stock: 'Low Stock Warning',
    overstock: 'Overstock Alert',
    expiry_warning: 'Expiry Warning',
    expiry_critical: 'Critical Expiry',
    damage_reported: 'Damage Alert',
  };
  return titles[type] || 'Alert';
}
