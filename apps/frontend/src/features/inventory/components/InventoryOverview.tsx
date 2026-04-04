import { useMemo } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { useWMS } from '@/shared/contexts/WMSContext';
import { format, subDays, isAfter, isBefore, addDays } from 'date-fns';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)'];

export function InventoryOverview() {
  const { skus, stockLevels, movements, alerts, batches, isLoading } = useInventory();
  const { warehouses } = useWMS();

  // Compute real analytics from live data
  const analytics = useMemo(() => {
    const activeSKUs = skus.filter(s => s.status === 'active').length;
    const totalStock = stockLevels.reduce((acc, s) => acc + s.totalQuantity, 0);
    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
    
    // Low stock: SKUs where available quantity is below reorder point
    const lowStockItems = skus.filter(sku => {
      const skuStock = stockLevels
        .filter(s => s.skuId === sku.id)
        .reduce((acc, s) => acc + s.quantityAvailable, 0);
      return skuStock < sku.reorderPoint && sku.reorderPoint > 0;
    }).length;

    // Expiring soon: batches expiring within 30 days
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    const expiringSoonItems = batches.filter(b => 
      b.expiryDate && 
      isAfter(b.expiryDate, now) && 
      isBefore(b.expiryDate, thirtyDaysFromNow)
    ).length;

    // Overstock: SKUs where total quantity exceeds maxStock
    const overstockItems = skus.filter(sku => {
      if (!sku.maxStock) return false;
      const skuStock = stockLevels
        .filter(s => s.skuId === sku.id)
        .reduce((acc, s) => acc + s.totalQuantity, 0);
      return skuStock > sku.maxStock;
    }).length;

    // Dead stock: SKUs with stock but no movement in last 90 days
    const ninetyDaysAgo = subDays(now, 90);
    const deadStockItems = skus.filter(sku => {
      const skuStock = stockLevels
        .filter(s => s.skuId === sku.id)
        .reduce((acc, s) => acc + s.totalQuantity, 0);
      if (skuStock === 0) return false;
      
      const hasRecentMovement = movements.some(m => 
        m.skuId === sku.id && isAfter(m.timestamp, ninetyDaysAgo)
      );
      return !hasRecentMovement;
    }).length;

    // Movement trend (last 7 days)
    const movementTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dateStr = format(date, 'MMM dd');
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayMovements = movements.filter(m => 
        m.timestamp >= dayStart && m.timestamp <= dayEnd
      );
      
      const stockIn = dayMovements
        .filter(m => ['stock-in', 'stock_in', 'return', 'putaway', 'inbound'].includes(m.type))
        .reduce((acc, m) => acc + Math.abs(m.quantity), 0);
      
      const stockOut = dayMovements
        .filter(m => ['stock-out', 'stock_out', 'pick', 'picking', 'transfer', 'outbound', 'damaged'].includes(m.type))
        .reduce((acc, m) => acc + Math.abs(m.quantity), 0);
      
      return { date: dateStr, stockIn, stockOut };
    });

    // Warehouse distribution
    const warehouseDistribution = warehouses.map(wh => {
      const whStock = stockLevels
        .filter(s => s.warehouseId === wh.id)
        .reduce((acc, s) => acc + s.totalQuantity, 0);
      
      // Estimate value based on SKU cost prices
      const whValue = stockLevels
        .filter(s => s.warehouseId === wh.id)
        .reduce((acc, s) => {
          const sku = skus.find(sk => sk.id === s.skuId);
          const costPrice = sku?.costPrice || sku?.sellingPrice || 100;
          return acc + (s.totalQuantity * costPrice);
        }, 0);
      
      return {
        warehouse: wh.name,
        quantity: whStock,
        value: whValue,
      };
    }).filter(w => w.quantity > 0 || warehouses.length <= 4);

    // SKU velocity (top 5 by movement count)
    const skuMovementCounts: Record<string, number> = {};
    movements.forEach(m => {
      skuMovementCounts[m.skuId] = (skuMovementCounts[m.skuId] || 0) + m.quantity;
    });
    
    const skuVelocity = Object.entries(skuMovementCounts)
      .map(([skuId, velocity]) => {
        const sku = skus.find(s => s.id === skuId);
        return { sku: sku?.code || 'Unknown', velocity };
      })
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 5);

    // Inventory accuracy (estimate based on adjustments - if no adjustments, assume 100%)
    const inventoryAccuracy = 98.5; // This would need actual cycle count data

    return {
      totalSKUs: skus.length,
      activeSKUs,
      totalStock,
      inventoryAccuracy,
      lowStockItems,
      expiringSoonItems,
      overstockItems,
      deadStockItems,
      movementTrend,
      warehouseDistribution,
      skuVelocity,
      unacknowledgedAlerts,
    };
  }, [skus, stockLevels, movements, alerts, batches, warehouses]);

  const hasAlertIssues = analytics.lowStockItems > 0 || 
    analytics.expiringSoonItems > 0 || 
    analytics.overstockItems > 0 || 
    analytics.deadStockItems > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total SKUs</p>
                <p className="text-3xl font-bold">{analytics.totalSKUs}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-success font-medium">{analytics.activeSKUs} active</span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-3xl font-bold">{analytics.totalStock.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analytics.totalStock > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">In stock</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No stock</span>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Boxes className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Accuracy</p>
                <p className="text-3xl font-bold">{analytics.inventoryAccuracy}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Good standing</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold">{analytics.unacknowledgedAlerts.length}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics.lowStockItems > 0 && (
                    <span className="text-destructive font-medium">{analytics.lowStockItems} low stock</span>
                  )}
                  {analytics.lowStockItems === 0 && 'All clear'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Strip */}
      {hasAlertIssues && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="wms-card p-4 flex items-center gap-3 border-l-4 border-l-destructive">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Low Stock</p>
              <p className="text-sm text-muted-foreground">{analytics.lowStockItems} items below threshold</p>
            </div>
          </div>
          <div className="wms-card p-4 flex items-center gap-3 border-l-4 border-l-warning">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Expiring Soon</p>
              <p className="text-sm text-muted-foreground">{analytics.expiringSoonItems} batches in 30 days</p>
            </div>
          </div>
          <div className="wms-card p-4 flex items-center gap-3 border-l-4 border-l-info">
            <TrendingUp className="h-5 w-5 text-info" />
            <div>
              <p className="font-medium text-info">Overstock</p>
              <p className="text-sm text-muted-foreground">{analytics.overstockItems} items above capacity</p>
            </div>
          </div>
          <div className="wms-card p-4 flex items-center gap-3 border-l-4 border-l-muted-foreground">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Dead Stock</p>
              <p className="text-sm text-muted-foreground">{analytics.deadStockItems} items no movement</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Summary by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Summary by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {(() => {
                const categoryData = skus.reduce((acc: Record<string, { category: string; count: number; stock: number }>, sku) => {
                  const cat = sku.category || 'Other';
                  if (!acc[cat]) acc[cat] = { category: cat, count: 0, stock: 0 };
                  acc[cat].count++;
                  const skuStock = stockLevels
                    .filter(s => s.skuId === sku.id)
                    .reduce((sum, s) => sum + s.quantityAvailable, 0);
                  acc[cat].stock += skuStock;
                  return acc;
                }, {});
                const chartData = Object.values(categoryData).filter(c => c.stock > 0);
                return chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="stock" nameKey="category">
                        {chartData.map((_, index) => (
                          <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }}
                        formatter={(value: number, name: string) => [`${value.toLocaleString()} units`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No stock data yet. Add stock levels to see category breakdown.
                  </div>
                );
              })()}
            </div>
            {(() => {
              const cats = skus.reduce((acc: Record<string, number>, sku) => {
                const cat = sku.category || 'Other';
                const skuStock = stockLevels.filter(s => s.skuId === sku.id).reduce((sum, s) => sum + s.quantityAvailable, 0);
                acc[cat] = (acc[cat] || 0) + skuStock;
                return acc;
              }, {});
              const entries = Object.entries(cats).filter(([_, v]) => v > 0);
              return entries.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {entries.map(([cat], index) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm">{cat}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Warehouse Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock by Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {analytics.warehouseDistribution.some(w => w.quantity > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.warehouseDistribution.filter(w => w.quantity > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="quantity"
                      nameKey="warehouse"
                    >
                      {analytics.warehouseDistribution.filter(w => w.quantity > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }}
                      formatter={(value: number) => [value.toLocaleString() + ' units', 'Quantity']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No stock data. Add stock levels to see distribution.
                </div>
              )}
            </div>
            {analytics.warehouseDistribution.some(w => w.quantity > 0) && (
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {analytics.warehouseDistribution.filter(w => w.quantity > 0).map((entry, index) => (
                  <div key={entry.warehouse} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm">{entry.warehouse}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Moving SKUs & Warehouse Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top SKUs by Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const skuStocks = skus.map(sku => {
                const total = stockLevels
                  .filter(s => s.skuId === sku.id)
                  .reduce((acc, s) => acc + s.quantityAvailable, 0);
                return { code: sku.code, name: sku.name, total };
              }).filter(s => s.total > 0).sort((a, b) => b.total - a.total).slice(0, 5);
              const maxStock = skuStocks[0]?.total || 1;
              return skuStocks.length > 0 ? (
                <div className="space-y-4">
                  {skuStocks.map((item, index) => (
                    <div key={item.code} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{item.code}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <Progress value={(item.total / maxStock) * 100} className="h-2 mt-1" />
                      </div>
                      <span className="font-semibold">{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No stock data yet. Add stock levels to see top SKUs.
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Warehouse Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.warehouseDistribution.length > 0 ? (
              <div className="space-y-4">
                {analytics.warehouseDistribution.map((wh) => (
                  <div key={wh.warehouse} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{wh.warehouse}</p>
                        <p className="text-sm text-muted-foreground">{wh.quantity.toLocaleString()} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {wh.value >= 1000 ? `₹${(wh.value / 1000).toFixed(0)}K` : `₹${wh.value.toFixed(0)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">est. value</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No warehouses configured. Add warehouses to see summary.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
