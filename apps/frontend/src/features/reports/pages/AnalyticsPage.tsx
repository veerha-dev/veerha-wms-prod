import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Package,
  Clock,
  Target,
  Truck,
  RefreshCw,
  FileBarChart,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useDashboardTrend } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useMovements } from '@/features/inventory/hooks/useMovements';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const daysMap: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[dateRange] || 7;

  const { metrics, warehouses } = useWMS();
  const { data: trendData = [] } = useDashboardTrend(days);
  const { data: movements = [] } = useMovements();

  const totalSKUs = metrics.totalSKUs;
  const totalStock = metrics.totalStockAvailable;
  const totalMovements = metrics.dailyMovements;
  const totalWarehouses = metrics.totalWarehouses;

  // Warehouse utilization from real data
  const warehouseUtilization = warehouses.map(w => ({
    name: w.name,
    utilization: w.total_capacity > 0 ? Math.round((w.used_capacity / w.total_capacity) * 100) : 0,
    capacity: w.total_capacity,
  }));

  // Movement types distribution from DB
  const movementTypes = movements.reduce((acc: Record<string, { name: string; value: number }>, m: any) => {
    const type = m.type || 'other';
    if (!acc[type]) acc[type] = { name: type, value: 0 };
    acc[type].value += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const movementsByType = Object.values(movementTypes).map((m, i) => ({
    ...m,
    color: ['hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(173, 58%, 39%)', 'hsl(262, 83%, 58%)'][i % 5],
  }));

  const hasData = totalSKUs > 0 || movements.length > 0 || totalWarehouses > 0;

  return (
    <AppLayout
      title="Analytics & Reports"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="default" size="sm" asChild>
          <Link to="/reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            Open Reports
          </Link>
        </Button>
      </div>

      {/* KPI Cards - now from materialized view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total SKUs</p>
                <p className="text-3xl font-bold">{totalSKUs}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalSKUs > 0 ? 'In inventory' : 'Create SKUs to start'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-3xl font-bold">{totalStock.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {metrics.totalStockReserved > 0 ? `${metrics.totalStockReserved.toLocaleString()} reserved` : 'Units available'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Movements</p>
                <p className="text-3xl font-bold">{totalMovements}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalMovements > 0 ? `↓${metrics.todayInwardQty} in, ↑${metrics.todayOutwardQty} out` : 'No movements today'}
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
                <p className="text-sm text-muted-foreground">Godowns</p>
                <p className="text-3xl font-bold">{totalWarehouses}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {metrics.utilizationRate > 0 ? `${metrics.utilizationRate}% avg utilization` : 'Add godowns first'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {!hasData ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Start by creating godowns, SKUs, and adding stock entries to see analytics and insights.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/warehouses">Add Godown</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/inventory">Add Inventory</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Flow - from useDashboardTrend */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Flow</CardTitle>
                  <CardDescription>Inbound vs Outbound movements ({days} day trend)</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                          <Legend />
                          <Area type="monotone" dataKey="inbound_qty" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#inboundGradient)" name="Inbound" />
                          <Area type="monotone" dataKey="outbound_qty" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="url(#outboundGradient)" name="Outbound" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No movement data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Movements by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Movements by Type</CardTitle>
                  <CardDescription>Distribution of warehouse operations</CardDescription>
                </CardHeader>
                <CardContent>
                  {movementsByType.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={movementsByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {movementsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No movement data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Warehouse Utilization */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Godown Utilization</CardTitle>
                  <CardDescription>Capacity usage by location</CardDescription>
                </CardHeader>
                <CardContent>
                  {warehouseUtilization.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={warehouseUtilization} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} width={100} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 13%, 91%)', borderRadius: '8px' }} />
                          <Bar dataKey="utilization" fill="hsl(173, 58%, 39%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No godown data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Analytics</CardTitle>
              <CardDescription>Detailed inventory metrics from materialized view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Available</p>
                    <p className="text-2xl font-bold">{metrics.totalStockAvailable.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Reserved</p>
                    <p className="text-2xl font-bold">{metrics.totalStockReserved.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Low Stock SKUs</p>
                    <p className="text-2xl font-bold text-warning">{metrics.lowStockSkus}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Expiring (30d)</p>
                    <p className="text-2xl font-bold text-destructive">{metrics.expiringBatches30d}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/stock">View Stock Report</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/low-stock">View Low Stock Report</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/expiry">View Expiry Report</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Operations Analytics</CardTitle>
              <CardDescription>Task and pipeline metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    <p className="text-2xl font-bold">{metrics.pendingTasks}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{metrics.tasksInProgress}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold text-success">{metrics.tasksCompletedToday}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold text-destructive">{metrics.activeAlerts}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/movements">View Movement Report</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/warehouse-utilization">View Utilization Report</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reports/audit-trail">View Audit Trail</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}