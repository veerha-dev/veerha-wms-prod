// VEERHA WMS Type Definitions

export type UserRole = 'admin' | 'manager';

export type ModuleId = 
  | 'warehouse-setup'
  | 'inventory-sku'
  | 'warehouse-mapping'
  | 'storage-config'
  | 'workflow-automation'
  | 'returns-damaged'
  | 'manager-operations'
  | 'analytics-reports'
  | 'user-management';

export type WarehouseType = 'logistics' | 'manufacturing' | 'franchise' | 'fulfillment-hub';

export type ZoneType = 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns' | 'cold-storage';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  warehouseAccess: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  enabledModules: ModuleId[];
  limits: TenantLimits;
  createdAt: Date;
}

export interface TenantLimits {
  maxWarehouses: number;
  maxSKUs: number;
  maxUsers: number;
  maxDailyMovements: number;
  maxBatches: number;
  reportRetentionDays: number;
}

export interface Module {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  usageCount?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  type: WarehouseType;
  address: string;
  city: string;
  country: string;
  operationalHours: string;
  capacity: number;
  utilization: number;
  zones: Zone[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  warehouseId: string;
  racks: Rack[];
  rules: ZoneRule[];
  utilization: number;
}

export interface ZoneRule {
  id: string;
  type: 'restricted' | 'bulk' | 'fragile' | 'cold' | 'hazardous';
  description: string;
}

export interface Rack {
  id: string;
  name: string;
  zoneId: string;
  shelves: Shelf[];
  maxWeight: number;
  currentWeight: number;
}

export interface Shelf {
  id: string;
  name: string;
  rackId: string;
  bins: Bin[];
  level: number;
}

export interface Bin {
  id: string;
  code: string;
  shelfId: string;
  skuId?: string;
  quantity: number;
  maxCapacity: number;
  status: 'empty' | 'partial' | 'full' | 'reserved';
}

export interface SKU {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  batchTracking: boolean;
  expiryTracking: boolean;
  minStock: number;
  maxStock: number;
  currentStock: number;
  zoneCompatibility: ZoneType[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
}

export interface InventoryMovement {
  id: string;
  type: 'stock-in' | 'stock-out' | 'transfer' | 'adjustment';
  skuId: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  performedBy: string;
  timestamp: Date;
}

export interface Task {
  id: string;
  type: 'putaway' | 'picking' | 'packing' | 'transfer' | 'count' | 'return';
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  warehouseId: string;
  items: TaskItem[];
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
}

export interface TaskItem {
  skuId: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
}

export interface DashboardMetrics {
  totalWarehouses: number;
  totalSKUs: number;
  activeOrders: number;
  pendingTasks: number;
  inventoryAccuracy: number;
  utilizationRate: number;
  dailyMovements: number;
  returnsToday: number;
}

export interface AnalyticsData {
  inventoryTrend: { date: string; value: number }[];
  movementsByType: { type: string; count: number }[];
  warehouseUtilization: { warehouse: string; utilization: number }[];
  topSKUs: { sku: string; movements: number }[];
}
