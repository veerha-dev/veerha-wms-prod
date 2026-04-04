import { AppLayout } from '@/shared/components/layout/AppLayout';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { WarehouseOverview } from '@/features/dashboard/components/WarehouseOverview';
import { InventoryChart } from '@/features/dashboard/components/InventoryChart';
import { ZoneHeatmap } from '@/features/dashboard/components/ZoneHeatmap';
import { InboundPipeline } from '@/features/dashboard/components/InboundPipeline';
import { OutboundPipeline } from '@/features/dashboard/components/OutboundPipeline';
import { AlertsSummary } from '@/features/dashboard/components/AlertsSummary';
import { TasksActivityPanel } from '@/features/dashboard/components/TasksActivityPanel';
import { useWMS } from '@/shared/contexts/WMSContext';
import {
  Building2,
  Package,
  ShoppingCart,
  ArrowUpDown,
  AlertTriangle,
  ClipboardList,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const { metrics, selectedWarehouse } = useWMS();

  const totalAlerts = metrics.activeAlerts + metrics.lowStockSkus;

  return (
    <AppLayout
      title="Dashboard"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: selectedWarehouse?.name || 'All Warehouses' },
      ]}
    >

      {/* ── Section 1: KPI Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <MetricCard
          variant="compact"
          title="Total Stock"
          value={metrics.totalStockAvailable.toLocaleString()}
          icon={Package}
          iconColor="text-accent"
          iconBg="bg-accent/10"
          subtitle={metrics.totalStockReserved > 0 ? `${metrics.totalStockReserved.toLocaleString()} reserved` : 'Available'}
          accentColor="bg-accent"
          className="lg:col-span-2"
        />
        <MetricCard
          variant="compact"
          title="Active Orders"
          value={metrics.activeOrders}
          icon={ShoppingCart}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          subtitle={metrics.soConfirmed > 0 ? `${metrics.soConfirmed} confirmed` : 'No active orders'}
          accentColor="bg-blue-500"
          className="lg:col-span-2"
        />
        <MetricCard
          variant="compact"
          title="Today's Movements"
          value={metrics.dailyMovements}
          icon={ArrowUpDown}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
          subtitle={`↓${metrics.todayInwardQty} in · ↑${metrics.todayOutwardQty} out`}
          accentColor="bg-emerald-500"
          className="lg:col-span-2"
        />
        <MetricCard
          variant="compact"
          title="Active Alerts"
          value={totalAlerts}
          icon={AlertTriangle}
          iconColor={totalAlerts > 0 ? 'text-destructive' : 'text-success'}
          iconBg={totalAlerts > 0 ? 'bg-destructive/10' : 'bg-success/10'}
          subtitle={metrics.lowStockSkus > 0 ? `${metrics.lowStockSkus} low stock` : 'All levels normal'}
          accentColor={totalAlerts > 0 ? 'bg-destructive' : 'bg-success'}
          className="lg:col-span-2"
        />
      </div>

      {/* ── Section 1b: Secondary KPI Strip ─────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          variant="compact"
          title="Godowns"
          value={metrics.totalWarehouses}
          icon={Building2}
          iconColor="text-violet-500"
          iconBg="bg-violet-500/10"
          subtitle={metrics.utilizationRate > 0 ? `${metrics.utilizationRate}% avg utilization` : 'No godowns yet'}
          accentColor="bg-violet-500"
        />
        <MetricCard
          variant="compact"
          title="Total SKUs"
          value={metrics.totalSKUs}
          icon={TrendingUp}
          iconColor="text-cyan-500"
          iconBg="bg-cyan-500/10"
          subtitle={metrics.totalSKUs > 0 ? 'Active in inventory' : 'Create SKUs to start'}
          accentColor="bg-cyan-500"
        />
        <MetricCard
          variant="compact"
          title="Pending Tasks"
          value={metrics.pendingTasks}
          icon={ClipboardList}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
          subtitle={metrics.tasksInProgress > 0 ? `${metrics.tasksInProgress} in progress` : 'No pending tasks'}
          accentColor="bg-amber-500"
        />
        <MetricCard
          variant="compact"
          title="Returns Today"
          value={metrics.returnsToday}
          icon={RotateCcw}
          iconColor="text-rose-500"
          iconBg="bg-rose-500/10"
          subtitle="Returns received today"
          accentColor="bg-rose-500"
        />
      </div>

      {/* ── Section 2: Workflow Pipelines ────────────────────────── */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Workflow Pipelines
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <InboundPipeline />
          <OutboundPipeline />
        </div>
      </div>

      {/* ── Section 3: Analytics + Alerts ────────────────────────── */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Analytics &amp; Alerts
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
          <div className="xl:col-span-2">
            <InventoryChart />
          </div>
          <div className="h-full">
            <AlertsSummary />
          </div>
        </div>
      </div>

      {/* ── Section 4: Zone Overview (Full Width) ──────────── */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Zone Overview
        </h2>
        <ZoneHeatmap />
      </div>

      {/* ── Section 5: Godowns & Operations ────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Warehouse &amp; Operations
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <WarehouseOverview />
          <TasksActivityPanel />
        </div>
      </div>

    </AppLayout>
  );
}
