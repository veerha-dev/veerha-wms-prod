import { useWMS } from '@/shared/contexts/WMSContext';
import { AlertTriangle, Package, Clock, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { useAlerts } from '@/features/operations/hooks/useAlerts';

export function AlertsSummary() {
  const { metrics } = useWMS();
  const { data: alerts = [] } = useAlerts();

  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const unacknowledged = safeAlerts.filter(a => !a.is_acknowledged);
  const lowStockAlerts = unacknowledged.filter(a => a.type === 'low_stock');
  const expiryAlerts = unacknowledged.filter(a => a.type === 'expiry_warning' || a.type === 'expiry_critical');
  const otherAlerts = unacknowledged.filter(a => !['low_stock', 'expiry_warning', 'expiry_critical'].includes(a.type));

  const hasAlerts = metrics.activeAlerts > 0 || unacknowledged.length > 0;

  return (
    <div className="wms-card h-full flex flex-col">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Active Alerts</h2>
          <p className="text-sm text-muted-foreground">
            {hasAlerts ? `${metrics.activeAlerts || unacknowledged.length} unacknowledged` : 'All clear'}
          </p>
        </div>
        {hasAlerts && (
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-destructive animate-pulse" />
          </div>
        )}
      </div>

      {!hasAlerts ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <Bell className="h-6 w-6 text-success" />
          </div>
          <h3 className="text-sm font-medium text-foreground">No active alerts</h3>
          <p className="text-xs text-muted-foreground mt-1">All inventory levels are normal</p>
        </div>
      ) : (
        <div className="flex-1 p-4 flex flex-col">
          <div className="space-y-3 flex-1 overflow-y-auto">
            {lowStockAlerts.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="h-9 w-9 rounded-md bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Low Stock</p>
                  <p className="text-xs text-muted-foreground">{lowStockAlerts.length} SKUs below reorder point</p>
                </div>
                <span className="text-lg font-bold text-warning">{lowStockAlerts.length}</span>
              </div>
            )}

            {expiryAlerts.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="h-9 w-9 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Expiry Warnings</p>
                  <p className="text-xs text-muted-foreground">{expiryAlerts.length} batches near expiry</p>
                </div>
                <span className="text-lg font-bold text-destructive">{expiryAlerts.length}</span>
              </div>
            )}

            {otherAlerts.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                <div className="h-9 w-9 rounded-md bg-info/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Other Alerts</p>
                  <p className="text-xs text-muted-foreground">{otherAlerts.length} alerts pending</p>
                </div>
                <span className="text-lg font-bold text-info">{otherAlerts.length}</span>
              </div>
            )}

            {metrics.expiringBatches30d > 0 && expiryAlerts.length === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="h-9 w-9 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Expiring Soon</p>
                  <p className="text-xs text-muted-foreground">{metrics.expiringBatches30d} batches within 30 days</p>
                </div>
                <span className="text-lg font-bold text-amber-500">{metrics.expiringBatches30d}</span>
              </div>
            )}
          </div>

          <Button asChild variant="outline" size="sm" className="w-full mt-4">
            <Link to="/inventory">View All Alerts</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
