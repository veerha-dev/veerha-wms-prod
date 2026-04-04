// Mock Dashboard Data

export const MOCK_DASHBOARD_STATS = {
  // Core counts - using exact field names WMSContext expects
  totalWarehouses: 3,
  totalZones: 12,
  totalRacks: 78,
  totalBins: 1560,
  totalSkus: 8,  // WMSContext uses totalSkus (lowercase 's')
  totalSKUs: 8,  // Also include uppercase for other components
  activeSKUs: 8,
  
  // Stock metrics
  totalStockUnits: 1850,
  totalStockValue: 2850000,
  lowStockSkus: 2,
  expiringBatches: 1,
  
  // Orders - openSOs is used by WMSContext for activeOrders
  totalOrders: 8,
  pendingOrders: 2,
  activeOrders: 3,
  openSOs: 3,
  completedOrders: 4,
  
  // Tasks
  pendingTasks: 4,
  inProgressTasks: 1,
  completedTasks: 5,
  
  // Alerts
  unacknowledgedAlerts: 3,
  totalAlerts: 5,
  
  // Performance
  inventoryAccuracy: 98.5,
  utilizationRate: 68,
  
  // Today's activity
  dailyMovements: 15,
  returnsToday: 1,
  todayInwardQty: 250,
  todayOutwardQty: 180,
  
  // GRN and QC pending counts
  grnPending: 1,
  qcPending: 1,
  
  // Recent movements for dashboard
  recentMovements: [
    { id: 'mov-001', type: 'stock_in', skuCode: 'SKU-ELEC-001', quantity: 100, timestamp: new Date().toISOString() },
    { id: 'mov-002', type: 'stock_out', skuCode: 'SKU-OFF-001', quantity: 20, timestamp: new Date().toISOString() },
    { id: 'mov-003', type: 'transfer', skuCode: 'SKU-FRN-001', quantity: 5, timestamp: new Date().toISOString() },
  ],
};

export const MOCK_INVENTORY_OVERVIEW = {
  totalSKUs: 8,
  activeSKUs: 8,
  inactiveSKUs: 0,
  totalQuantity: 1100,
  totalValue: 2850000,
  lowStockItems: 2,
  lowStockSkus: 2,
  outOfStockItems: 0,
  expiringSoonItems: 1,
  expiringBatches: 1,
  categoryBreakdown: [
    { category: 'Electronics', count: 3, value: 450000 },
    { category: 'Office Supplies', count: 1, value: 80000 },
    { category: 'Furniture', count: 2, value: 1200000 },
    { category: 'Food & Beverage', count: 1, value: 175000 },
    { category: 'Cleaning Supplies', count: 1, value: 122000 },
  ],
  warehouseBreakdown: [
    { warehouseId: 'wh-001', warehouseName: 'Coimbatore Main Warehouse', quantity: 240, value: 1730000 },
    { warehouseId: 'wh-002', warehouseName: 'Chennai Distribution Center', quantity: 860, value: 1120000 },
  ],
  // Stock level charts data
  stockLevelData: [
    { name: 'Wireless Mouse', available: 45, reserved: 5, inTransit: 10 },
    { name: 'USB Keyboard', available: 25, reserved: 5, inTransit: 0 },
    { name: 'HDMI Cable', available: 90, reserved: 10, inTransit: 20 },
    { name: 'A4 Paper', available: 15, reserved: 5, inTransit: 0 },
    { name: 'Office Chair', available: 4, reserved: 1, inTransit: 2 },
    { name: 'Standing Desk', available: 2, reserved: 1, inTransit: 0 },
    { name: 'Coffee Beans', available: 180, reserved: 20, inTransit: 50 },
    { name: 'Hand Sanitizer', available: 450, reserved: 50, inTransit: 100 },
  ],
};

export const MOCK_ORDERS_SUMMARY = {
  purchaseOrders: {
    total: 4,
    pending: 1,
    approved: 1,
    received: 1,
    partial: 1,
    totalValue: 855738,
  },
  salesOrders: {
    total: 4,
    pending: 1,
    confirmed: 1,
    picking: 1,
    shipped: 1,
    totalValue: 169165,
  },
  returns: {
    total: 2,
    pending: 1,
    completed: 1,
  },
  // Status breakdowns for WMSContext
  poByStatus: [
    { status: 'draft', _count: 0 },
    { status: 'pending', _count: 1 },
    { status: 'submitted', _count: 0 },
    { status: 'approved', _count: 1 },
    { status: 'received', _count: 1 },
    { status: 'partial', _count: 1 },
  ],
  soByStatus: [
    { status: 'pending', _count: 1 },
    { status: 'confirmed', _count: 1 },
    { status: 'picking', _count: 1 },
    { status: 'packing', _count: 0 },
    { status: 'shipped', _count: 1 },
    { status: 'delivered', _count: 0 },
  ],
};

export const MOCK_REALTIME_DATA = {
  activeUsers: 1,
  activeTasks: 2,
  recentMovements: [
    { id: 'mov-005', type: 'stock_in', skuCode: 'SKU-FOOD-001', quantity: 500, timestamp: new Date('2024-02-10T10:00:00').toISOString() },
    { id: 'mov-004', type: 'adjustment', skuCode: 'SKU-ELEC-003', quantity: -5, timestamp: new Date('2024-01-18T11:30:00').toISOString() },
    { id: 'mov-003', type: 'transfer', skuCode: 'SKU-ELEC-002', quantity: 15, timestamp: new Date('2024-01-17T09:00:00').toISOString() },
  ],
  recentAlerts: [
    { id: 'alert-001', type: 'low_stock', skuCode: 'SKU-OFF-001', message: 'Stock below reorder point', timestamp: new Date('2024-02-25').toISOString() },
    { id: 'alert-002', type: 'expiry_warning', skuCode: 'SKU-FOOD-001', message: 'Batch expiring soon', timestamp: new Date('2024-12-01').toISOString() },
  ],
};

export const MOCK_TREND_DATA = {
  inventoryTrend: [
    { date: '2024-01-01', value: 850 },
    { date: '2024-01-15', value: 920 },
    { date: '2024-02-01', value: 980 },
    { date: '2024-02-15', value: 1050 },
    { date: '2024-03-01', value: 1100 },
  ],
  movementTrend: [
    { date: '2024-01-01', stockIn: 120, stockOut: 80 },
    { date: '2024-01-15', stockIn: 150, stockOut: 100 },
    { date: '2024-02-01', stockIn: 200, stockOut: 120 },
    { date: '2024-02-15', stockIn: 180, stockOut: 150 },
    { date: '2024-03-01', stockIn: 160, stockOut: 130 },
  ],
  orderTrend: [
    { date: '2024-01-01', purchases: 2, sales: 1 },
    { date: '2024-01-15', purchases: 1, sales: 2 },
    { date: '2024-02-01', purchases: 2, sales: 1 },
    { date: '2024-02-15', purchases: 1, sales: 2 },
    { date: '2024-03-01', purchases: 2, sales: 2 },
  ],
};

export const MOCK_ACTIVITY_LOG = [
  { id: 'act-001', action: 'Task Completed', description: 'Receiving task TSK-2024-0001 completed', user: 'Demo Admin', timestamp: new Date('2024-01-15T10:45:00').toISOString() },
  { id: 'act-002', action: 'GRN Created', description: 'GRN-2024-0001 created for PO-2024-0001', user: 'Demo Admin', timestamp: new Date('2024-01-15T11:00:00').toISOString() },
  { id: 'act-003', action: 'Shipment Delivered', description: 'SHP-2024-0001 delivered to ABC Electronics', user: 'System', timestamp: new Date('2024-01-17T16:00:00').toISOString() },
  { id: 'act-004', action: 'Alert Generated', description: 'Low stock alert for SKU-OFF-001', user: 'System', timestamp: new Date('2024-02-25T08:00:00').toISOString() },
  { id: 'act-005', action: 'Return Processed', description: 'RET-2024-0001 completed and refunded', user: 'Demo Admin', timestamp: new Date('2024-01-29T14:00:00').toISOString() },
];

export const MOCK_ZONE_HEATMAP = [
  { zoneId: 'zone-001', zoneName: 'Receiving Zone', warehouseId: 'wh-001', utilization: 50, activity: 'high' },
  { zoneId: 'zone-002', zoneName: 'Storage Zone A', warehouseId: 'wh-001', utilization: 70, activity: 'medium' },
  { zoneId: 'zone-003', zoneName: 'Picking Zone', warehouseId: 'wh-001', utilization: 70, activity: 'high' },
  { zoneId: 'zone-004', zoneName: 'Shipping Zone', warehouseId: 'wh-001', utilization: 70, activity: 'medium' },
  { zoneId: 'zone-005', zoneName: 'Receiving Dock', warehouseId: 'wh-002', utilization: 70, activity: 'medium' },
  { zoneId: 'zone-006', zoneName: 'Main Storage', warehouseId: 'wh-002', utilization: 72, activity: 'low' },
];
