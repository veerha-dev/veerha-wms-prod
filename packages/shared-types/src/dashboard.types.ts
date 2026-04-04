// Dashboard and analytics types

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

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  categoryId?: string;
  skuId?: string;
}
