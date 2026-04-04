import { useWMS } from '@/shared/contexts/WMSContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, ListChecks, Package, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const stages = [
  { key: 'confirmed', label: 'Confirmed', icon: ShoppingCart, path: '/outbound', color: 'bg-blue-500' },
  { key: 'picking', label: 'Picking', icon: ListChecks, path: '/outbound/picking', color: 'bg-amber-500' },
  { key: 'packing', label: 'Packing', icon: Package, path: '/outbound/packing', color: 'bg-orange-500' },
  { key: 'shipping', label: 'Shipping', icon: Truck, path: '/outbound/shipping', color: 'bg-emerald-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, path: '/outbound', color: 'bg-green-600' },
];

export function OutboundPipeline() {
  const { metrics } = useWMS();

  const counts: Record<string, number> = {
    confirmed: metrics.soConfirmed,
    picking: metrics.picksPending,
    packing: metrics.soInProgress,
    shipping: metrics.shipmentsPending,
    delivered: metrics.soDelivered,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Outbound Pipeline</h2>
            <p className="text-sm text-muted-foreground">Order → Pick → Pack → Ship → Deliver</p>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{total} total</span>
        </div>
      </div>
      <div className="p-5">
        {/* Progress bar */}
        {total > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden mb-4 bg-muted">
            {stages.map((stage) => {
              const pct = total > 0 ? (counts[stage.key] / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage.key}
                  className={cn('h-full transition-all', stage.color)}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const count = counts[stage.key];

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <Link
                  to={stage.path}
                  className="flex-1 p-3 rounded-lg border border-border hover:border-accent/40 hover:shadow-sm transition-all text-center"
                >
                  <div className={cn('h-8 w-8 rounded-md flex items-center justify-center mx-auto mb-1.5', stage.color + '/10')}>
                    <Icon className={cn('h-4 w-4', stage.color.replace('bg-', 'text-'))} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{stage.label}</p>
                </Link>
                {idx < stages.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
