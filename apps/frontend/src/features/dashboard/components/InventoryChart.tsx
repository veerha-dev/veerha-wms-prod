import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { useMovements } from '@/features/inventory/hooks/useMovements';
import { useStockLevels } from '@/features/inventory/hooks/useStockLevels';
import { Package, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

type ChartView = 'stock' | 'movement';

export function InventoryChart() {
  const [view, setView] = useState<ChartView>('stock');
  const { data: movements = [] } = useMovements();
  const { data: stockLevels = [] } = useStockLevels();

  // Calculate total stock from stock levels
  const totalStock = stockLevels.reduce((sum, sl) => sum + (sl.quantity_available || 0), 0);

  // Generate last 7 days data from actual movements
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'MMM d');
    
    const dayMovements = movements.filter(m => {
      // Handle invalid or missing dates
      if (!m.createdAt) return false;
      const movementDate = new Date(m.createdAt);
      // Check if date is valid
      if (isNaN(movementDate.getTime())) return false;
      return format(movementDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });

    const inbound = dayMovements
      .filter(m => m.movementType === 'inbound' || m.movementType === 'return')
      .reduce((sum, m) => sum + (m.quantity || 0), 0);

    const outbound = dayMovements
      .filter(m => m.movementType === 'outbound' || m.movementType === 'transfer')
      .reduce((sum, m) => sum + (m.quantity || 0), 0);

    return {
      date: dateStr,
      inbound,
      outbound,
      stock: totalStock, // Simplified - in production would calculate running total
    };
  });

  // Movement type breakdown
  const movementBreakdown = [
    { name: 'Receiving', value: movements.filter(m => m.movementType === 'inbound').reduce((sum, m) => sum + (m.quantity || 0), 0) },
    { name: 'Transfer', value: movements.filter(m => m.movementType === 'transfer').reduce((sum, m) => sum + (m.quantity || 0), 0) },
    { name: 'Shipping', value: movements.filter(m => m.movementType === 'outbound').reduce((sum, m) => sum + (m.quantity || 0), 0) },
    { name: 'Returns', value: movements.filter(m => m.movementType === 'return').reduce((sum, m) => sum + (m.quantity || 0), 0) },
    { name: 'Adjustment', value: movements.filter(m => m.movementType === 'adjustment').reduce((sum, m) => sum + (m.quantity || 0), 0) },
  ];

  const hasData = movements.length > 0 || stockLevels.length > 0;
  const hasMovementData = movementBreakdown.some(m => m.value > 0);

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Inventory Analytics</h2>
            <p className="text-sm text-muted-foreground">7-day overview</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setView('stock')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                view === 'stock'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Stock Levels
            </button>
            <button
              onClick={() => setView('movement')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                view === 'movement'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Movements
            </button>
          </div>
        </div>

        {/* Legend */}
        {view === 'stock' && (
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Stock Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Inbound</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-info" />
              <span className="text-sm text-muted-foreground">Outbound</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="h-[280px]">
          {!hasData ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                {view === 'stock' ? (
                  <Package className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No data yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {view === 'stock' 
                  ? 'Add inventory and stock levels to see analytics here'
                  : 'Record inventory movements to see trends here'}
              </p>
            </div>
          ) : view === 'stock' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="stock"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#stockGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : !hasMovementData ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No movements yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Record inventory movements to see breakdown here
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
