import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Module, ModuleId } from '@/shared/types/wms';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTenant } from '@/shared/hooks/useTenant';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { useSKUs } from '@/features/inventory/hooks/useSKUs';
import { useTasks } from '@/features/operations/hooks/useTasks';
import { useDashboardMetrics, useDashboardRealtime } from '@/features/dashboard/hooks/useDashboardMetrics';


type Warehouse = any;
type DBTenant = any;

interface DashboardMetrics {
  totalWarehouses: number;
  totalSKUs: number;
  activeOrders: number;
  pendingTasks: number;
  utilizationRate: number;
  dailyMovements: number;
  returnsToday: number;
  totalStockAvailable: number;
  totalStockReserved: number;
  lowStockSkus: number;
  expiringBatches30d: number;
  activeAlerts: number;
  todayInwardQty: number;
  todayOutwardQty: number;
  poDraft: number;
  poSubmitted: number;
  poApproved: number;
  grnPending: number;
  qcPending: number;
  soConfirmed: number;
  soInProgress: number;
  soShipped: number;
  soDelivered: number;
  picksPending: number;
  shipmentsPending: number;
  tasksInProgress: number;
  tasksCompletedToday: number;
}

// Legacy tenant format with limits
interface LegacyTenant {
  id: string;
  name: string;
  plan: string;
  enabledModules: string[];
  limits: {
    maxWarehouses: number;
    maxSKUs: number;
    maxUsers: number;
    maxDailyMovements: number;
    maxBatches: number;
    reportRetentionDays: number;
  };
  createdAt: Date;
}

function convertTenantToLegacy(tenant: DBTenant): LegacyTenant {
  return {
    id: tenant.id,
    name: tenant.name,
    plan: tenant.plan,
    enabledModules: tenant.enabledModules || [],
    limits: {
      maxWarehouses: tenant.maxWarehouses ?? 10,
      maxSKUs: tenant.maxSkus ?? 1000,
      maxUsers: tenant.maxUsers ?? 50,
      maxDailyMovements: tenant.maxDailyMovements ?? 10000,
      maxBatches: 5000,
      reportRetentionDays: 365,
    },
    createdAt: new Date(tenant.createdAt),
  };
}

interface WMSContextType {
  currentUser: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'worker';
    avatar?: string;
  } | null;
  tenant: LegacyTenant | null;
  modules: Module[];
  warehouses: Warehouse[];
  selectedWarehouse: Warehouse | null;
  metrics: DashboardMetrics;
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  selectWarehouse: (warehouse: Warehouse) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
}

const WMSContext = createContext<WMSContextType | undefined>(undefined);

const defaultModules: Module[] = [
  { id: 'warehouse-setup', name: 'Godown Setup', description: 'Define physical and logical godowns', icon: 'Building2', enabled: true, usageCount: 0 },
  { id: 'inventory-sku', name: 'Inventory & SKU', description: 'Manage SKUs and stock levels', icon: 'Package', enabled: true, usageCount: 0 },
  { id: 'warehouse-mapping', name: 'Godown Mapping', description: 'Digitally map godown structure', icon: 'Map', enabled: true, usageCount: 0 },
  { id: 'storage-config', name: 'Storage Configuration', description: 'Configure pallets and storage rules', icon: 'Boxes', enabled: true, usageCount: 0 },
  { id: 'workflow-automation', name: 'Workflow Automation', description: 'Automate putaway, picking, packing', icon: 'Workflow', enabled: true, usageCount: 0 },
  { id: 'returns-damaged', name: 'Returns & Damaged', description: 'Handle returns and damaged goods', icon: 'RotateCcw', enabled: true, usageCount: 0 },
  { id: 'manager-operations', name: 'Manager Operations', description: 'Batch processing and task management', icon: 'ClipboardList', enabled: true, usageCount: 0 },
  { id: 'analytics-reports', name: 'Analytics & Reports', description: 'View analytics and generate reports', icon: 'BarChart3', enabled: true, usageCount: 0 },
  { id: 'user-management', name: 'User Management', description: 'Manage users and access control', icon: 'Users', enabled: true, usageCount: 0 },
];

const defaultMetrics: DashboardMetrics = {
  totalWarehouses: 0,
  totalSKUs: 0,
  activeOrders: 0,
  pendingTasks: 0,
  utilizationRate: 0,
  dailyMovements: 0,
  returnsToday: 0,
  totalStockAvailable: 0,
  totalStockReserved: 0,
  lowStockSkus: 0,
  expiringBatches30d: 0,
  activeAlerts: 0,
  todayInwardQty: 0,
  todayOutwardQty: 0,
  poDraft: 0,
  poSubmitted: 0,
  poApproved: 0,
  grnPending: 0,
  qcPending: 0,
  soConfirmed: 0,
  soInProgress: 0,
  soShipped: 0,
  soDelivered: 0,
  picksPending: 0,
  shipmentsPending: 0,
  tasksInProgress: 0,
  tasksCompletedToday: 0,
};

export function WMSProvider({ children }: { children: ReactNode }) {
  const { user, role, isLoading: authLoading } = useAuth();
  const { tenant: dbTenant } = useTenant();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  
  // Filter out inactive warehouses
  const activeWarehouses = useMemo(() => 
    warehouses.filter(w => w.status !== 'inactive'), 
    [warehouses]
  );
  const { data: skus = [] } = useSKUs();
  const { data: tasks = [] } = useTasks();
  const { stats: dbStats, inventory: dbInventory, orders: dbOrders } = useDashboardMetrics();
  useDashboardRealtime();

  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Convert tenant to legacy format
  const tenant = useMemo(() => dbTenant ? convertTenantToLegacy(dbTenant) : null, [dbTenant]);

  // Auto-select first warehouse when data loads
  useEffect(() => {
    if (activeWarehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(activeWarehouses[0]);
    }
  }, [activeWarehouses, selectedWarehouse]);

  const currentUser = user ? {
    id: user.id,
    email: user.email,
    name: user.fullName || user.email.split('@')[0],
    role: (user.role || role || 'worker') as 'admin' | 'manager' | 'worker',
    avatar: user.avatarUrl || undefined,
  } : null;

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    // All modules are enabled for all users
    return true;
  };

  const selectWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate real metrics from DB materialized view + fallback
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => 
    t.status === 'created' || t.status === 'assigned' || t.status === 'in_progress'
  ).length : 0;

  // Extract PO/SO status counts from orders summary
  const poStatusCounts: Record<string, number> = {};
  const soStatusCounts: Record<string, number> = {};
  if (dbOrders?.poByStatus) {
    (dbOrders.poByStatus as any[]).forEach((g: any) => { poStatusCounts[g.status] = g._count || 0; });
  }
  if (dbOrders?.soByStatus) {
    (dbOrders.soByStatus as any[]).forEach((g: any) => { soStatusCounts[g.status] = g._count || 0; });
  }

  const metrics: DashboardMetrics = dbStats ? {
    totalWarehouses: dbStats.totalWarehouses || 0,
    totalSKUs: dbStats.totalSkus || 0,
    activeOrders: dbStats.openSOs || 0,
    pendingTasks: dbStats.pendingTasks || 0,
    utilizationRate: activeWarehouses.length > 0 ?
      Math.round((activeWarehouses.reduce((acc: number, w: any) => acc + (w.currentOccupancy || 0), 0) /
        Math.max(1, activeWarehouses.reduce((acc: number, w: any) => acc + (w.totalCapacity || 1), 0))) * 100) : 0,
    dailyMovements: dbStats.dailyMovements || dbStats.recentMovements?.length || 0,
    returnsToday: dbStats.returnsToday || 0,
    totalStockAvailable: dbStats.totalStockUnits || 0,
    totalStockReserved: 0,
    lowStockSkus: dbInventory?.lowStockSkus || 0,
    expiringBatches30d: dbInventory?.expiringBatches || 0,
    activeAlerts: dbStats.unacknowledgedAlerts || 0,
    todayInwardQty: dbStats.todayInwardQty || 0,
    todayOutwardQty: dbStats.todayOutwardQty || 0,
    poDraft: poStatusCounts['draft'] || 0,
    poSubmitted: poStatusCounts['submitted'] || 0,
    poApproved: poStatusCounts['approved'] || 0,
    grnPending: dbStats.grnPending || 0,
    qcPending: dbStats.qcPending || 0,
    soConfirmed: soStatusCounts['confirmed'] || 0,
    soInProgress: (soStatusCounts['picking'] || 0) + (soStatusCounts['packing'] || 0),
    soShipped: soStatusCounts['shipped'] || 0,
    soDelivered: soStatusCounts['delivered'] || 0,
    picksPending: 0,
    shipmentsPending: 0,
    tasksInProgress: pendingTasks,
    tasksCompletedToday: 0,
  } : {
    ...defaultMetrics,
    totalWarehouses: activeWarehouses.length,
    totalSKUs: skus.length,
    pendingTasks,
    utilizationRate: activeWarehouses.length > 0 ?
      Math.round((activeWarehouses.reduce((acc: number, w: any) => acc + (w.currentOccupancy || 0), 0) /
        Math.max(1, activeWarehouses.reduce((acc: number, w: any) => acc + (w.totalCapacity || 1), 0))) * 100) : 0,
  };

  const isLoading = authLoading || warehousesLoading;

  return (
    <WMSContext.Provider
      value={{
        currentUser,
        tenant,
        modules: defaultModules.map(m => ({
          ...m,
          enabled: isModuleEnabled(m.id as ModuleId),
          key: m.id,
        })),
        warehouses: activeWarehouses,
        selectedWarehouse,
        metrics,
        isModuleEnabled,
        selectWarehouse,
        isSidebarCollapsed,
        toggleSidebar,
        isLoading,
      }}
    >
      {children}
    </WMSContext.Provider>
  );
}

export function useWMS() {
  const context = useContext(WMSContext);
  if (context === undefined) {
    throw new Error('useWMS must be used within a WMSProvider');
  }
  return context;
}
