import { useWMS } from '@/shared/contexts/WMSContext';
import { cn } from '@/shared/lib/utils';
import {
  Building2,
  Package,
  Map,
  Boxes,
  Workflow,
  RotateCcw,
  ClipboardList,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Package,
  Map,
  Boxes,
  Workflow,
  RotateCcw,
  ClipboardList,
  BarChart3,
  Users,
};

const pathMap: Record<string, string> = {
  'warehouse-setup': '/warehouses',
  'inventory-sku': '/inventory',
  'warehouse-mapping': '/mapping',
  'storage-config': '/storage',
  'workflow-automation': '/workflows',
  'returns-damaged': '/returns',
  'manager-operations': '/operations',
  'analytics-reports': '/analytics',
  'user-management': '/users',
};

export function ModuleStatus() {
  const { modules, tenant } = useWMS();

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">WMS Modules</h2>
            <p className="text-sm text-muted-foreground">
              {enabledCount} of {modules.length} modules enabled
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-accent">{tenant?.plan} Plan</p>
            <p className="text-xs text-muted-foreground">All modules included</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((module) => {
          const Icon = iconMap[module.icon] || Package;
          const path = pathMap[module.id] || '/';

          return (
            <Link
              key={module.id}
              to={module.enabled ? path : '#'}
              className={cn(
                'group relative p-4 rounded-xl border transition-all',
                module.enabled
                  ? 'bg-card border-border hover:border-accent/40 hover:shadow-md cursor-pointer'
                  : 'bg-muted/30 border-dashed border-border/60 cursor-not-allowed opacity-60'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    module.enabled ? 'bg-accent/10' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn('h-5 w-5', module.enabled ? 'text-accent' : 'text-muted-foreground')}
                  />
                </div>
                {module.enabled ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <h3
                className={cn(
                  'font-medium text-sm',
                  module.enabled ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {module.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {module.description}
              </p>

              {module.enabled && module.usageCount !== undefined && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {module.usageCount.toLocaleString()} items
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              )}

              {!module.enabled && (
                <div className="mt-3 pt-3 border-t border-dashed border-border/60">
                  <span className="text-xs text-muted-foreground">Upgrade to enable</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
