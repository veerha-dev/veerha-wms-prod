// Mock Reports Data

export const MOCK_STOCK_REPORT = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalSKUs: 8,
    totalQuantity: 1100,
    totalValue: 2850000,
    lowStockItems: 1,
    outOfStockItems: 0,
    overstockItems: 0,
  },
  data: [
    { skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', category: 'Electronics', warehouse: 'Coimbatore Main Warehouse', quantity: 60, value: 41940, status: 'normal' },
    { skuCode: 'SKU-ELEC-002', skuName: 'USB Keyboard', category: 'Electronics', warehouse: 'Coimbatore Main Warehouse', quantity: 30, value: 29970, status: 'normal' },
    { skuCode: 'SKU-ELEC-003', skuName: 'HDMI Cable 2m', category: 'Electronics', warehouse: 'Coimbatore Main Warehouse', quantity: 120, value: 35880, status: 'normal' },
    { skuCode: 'SKU-OFF-001', skuName: 'A4 Paper Ream', category: 'Office Supplies', warehouse: 'Coimbatore Main Warehouse', quantity: 20, value: 7980, status: 'low_stock' },
    { skuCode: 'SKU-FRN-001', skuName: 'Office Chair', category: 'Furniture', warehouse: 'Coimbatore Main Warehouse', quantity: 7, value: 90993, status: 'normal' },
    { skuCode: 'SKU-FRN-002', skuName: 'Standing Desk', category: 'Furniture', warehouse: 'Coimbatore Main Warehouse', quantity: 3, value: 119997, status: 'normal' },
    { skuCode: 'SKU-FOOD-001', skuName: 'Organic Coffee Beans', category: 'Food & Beverage', warehouse: 'Chennai Distribution Center', quantity: 250, value: 174750, status: 'normal' },
    { skuCode: 'SKU-CLEAN-001', skuName: 'Hand Sanitizer 500ml', category: 'Cleaning Supplies', warehouse: 'Chennai Distribution Center', quantity: 610, value: 121390, status: 'normal' },
  ],
};

export const MOCK_MOVEMENT_REPORT = {
  generatedAt: new Date().toISOString(),
  period: { from: new Date('2024-01-01').toISOString(), to: new Date().toISOString() },
  summary: {
    totalMovements: 5,
    stockIn: 2,
    stockOut: 1,
    transfers: 1,
    adjustments: 1,
    totalQuantityIn: 600,
    totalQuantityOut: 20,
  },
  data: [
    { movementNumber: 'MOV-2024-0001', type: 'stock_in', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 100, warehouse: 'Coimbatore Main Warehouse', reference: 'GRN-2024-001', date: new Date('2024-01-15').toISOString(), user: 'Demo Admin' },
    { movementNumber: 'MOV-2024-0002', type: 'stock_out', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 20, warehouse: 'Coimbatore Main Warehouse', reference: 'SO-2024-001', date: new Date('2024-01-16').toISOString(), user: 'Demo Admin' },
    { movementNumber: 'MOV-2024-0003', type: 'transfer', skuCode: 'SKU-ELEC-002', skuName: 'USB Keyboard', quantity: 15, warehouse: 'Coimbatore Main Warehouse', reference: 'Internal Transfer', date: new Date('2024-01-17').toISOString(), user: 'Demo Admin' },
    { movementNumber: 'MOV-2024-0004', type: 'adjustment', skuCode: 'SKU-ELEC-003', skuName: 'HDMI Cable 2m', quantity: -5, warehouse: 'Coimbatore Main Warehouse', reference: 'ADJ-2024-001', date: new Date('2024-01-18').toISOString(), user: 'Demo Admin' },
    { movementNumber: 'MOV-2024-0005', type: 'stock_in', skuCode: 'SKU-FOOD-001', skuName: 'Organic Coffee Beans', quantity: 500, warehouse: 'Chennai Distribution Center', reference: 'GRN-2024-002', date: new Date('2024-02-10').toISOString(), user: 'Demo Admin' },
  ],
};

export const MOCK_PURCHASE_REGISTER = {
  generatedAt: new Date().toISOString(),
  period: { from: new Date('2024-01-01').toISOString(), to: new Date().toISOString() },
  summary: {
    totalPOs: 4,
    totalValue: 855738,
    totalPaid: 384550,
    totalPending: 471188,
    avgOrderValue: 213935,
  },
  data: [
    { poNumber: 'PO-2024-0001', supplier: 'TechPro Electronics', warehouse: 'Coimbatore Main Warehouse', orderDate: new Date('2024-01-10').toISOString(), status: 'approved', items: 2, subtotal: 65000, tax: 11700, total: 76700, paid: 76700 },
    { poNumber: 'PO-2024-0002', supplier: 'BeanMaster Coffee Co', warehouse: 'Chennai Distribution Center', orderDate: new Date('2024-02-05').toISOString(), status: 'received', items: 1, subtotal: 225000, tax: 11250, total: 236250, paid: 236250 },
    { poNumber: 'PO-2024-0003', supplier: 'CleanGuard Industries', warehouse: 'Chennai Distribution Center', orderDate: new Date('2024-02-15').toISOString(), status: 'partial', items: 1, subtotal: 120000, tax: 21600, total: 141600, paid: 70800 },
    { poNumber: 'PO-2024-0004', supplier: 'ErgoDesk Furniture', warehouse: 'Coimbatore Main Warehouse', orderDate: new Date('2024-03-01').toISOString(), status: 'pending', items: 2, subtotal: 339990, tax: 61198, total: 401188, paid: 0 },
  ],
};

export const MOCK_SALES_REGISTER = {
  generatedAt: new Date().toISOString(),
  period: { from: new Date('2024-01-01').toISOString(), to: new Date().toISOString() },
  summary: {
    totalSOs: 4,
    totalValue: 169165,
    totalReceived: 16996,
    totalPending: 152169,
    avgOrderValue: 42291,
  },
  data: [
    { soNumber: 'SO-2024-0001', customer: 'ABC Electronics Pvt Ltd', warehouse: 'Coimbatore Main Warehouse', orderDate: new Date('2024-01-16').toISOString(), status: 'shipped', items: 1, subtotal: 13980, tax: 2516, shipping: 500, total: 16996, received: 16996 },
    { soNumber: 'SO-2024-0002', customer: 'XYZ Office Supplies', warehouse: 'Coimbatore Main Warehouse', orderDate: new Date('2024-02-20').toISOString(), status: 'picking', items: 1, subtotal: 7980, tax: 958, shipping: 300, total: 8738, received: 0 },
    { soNumber: 'SO-2024-0003', customer: 'Modern Furniture House', warehouse: 'Coimbatore Main Warehouse', orderDate: new Date('2024-03-01').toISOString(), status: 'confirmed', items: 2, subtotal: 92994, tax: 16739, shipping: 2000, total: 106733, received: 53367 },
    { soNumber: 'SO-2024-0004', customer: 'ABC Electronics Pvt Ltd', warehouse: 'Chennai Distribution Center', orderDate: new Date('2024-03-05').toISOString(), status: 'pending', items: 1, subtotal: 34950, tax: 1748, shipping: 0, total: 36698, received: 0 },
  ],
};

export const MOCK_EXPIRY_REPORT = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalBatches: 4,
    expiredBatches: 0,
    expiringSoon: 1,
    healthy: 3,
  },
  data: [
    { batchNumber: 'BTH-2024-002', skuCode: 'SKU-FOOD-001', skuName: 'Organic Coffee Beans', warehouse: 'Chennai Distribution Center', quantity: 500, manufactureDate: new Date('2024-02-01').toISOString(), expiryDate: new Date('2025-02-01').toISOString(), daysToExpiry: 330, status: 'healthy' },
    { batchNumber: 'BTH-2024-003', skuCode: 'SKU-CLEAN-001', skuName: 'Hand Sanitizer 500ml', warehouse: 'Chennai Distribution Center', quantity: 1000, manufactureDate: new Date('2024-01-15').toISOString(), expiryDate: new Date('2026-01-15').toISOString(), daysToExpiry: 680, status: 'healthy' },
    { batchNumber: 'BTH-2024-004', skuCode: 'SKU-FOOD-001', skuName: 'Organic Coffee Beans', warehouse: 'Chennai Distribution Center', quantity: 300, manufactureDate: new Date('2024-03-01').toISOString(), expiryDate: new Date('2025-03-01').toISOString(), daysToExpiry: 360, status: 'healthy' },
  ],
};

export const MOCK_LOW_STOCK_REPORT = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalItems: 1,
    criticalItems: 0,
    warningItems: 1,
  },
  data: [
    { skuCode: 'SKU-OFF-001', skuName: 'A4 Paper Ream', category: 'Office Supplies', warehouse: 'Coimbatore Main Warehouse', currentStock: 20, reorderPoint: 50, reorderQty: 200, status: 'warning', daysOfStock: 5 },
  ],
};

export const MOCK_WAREHOUSE_UTILIZATION_REPORT = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalWarehouses: 3,
    avgUtilization: 62,
    totalCapacity: 31000,
    usedCapacity: 19220,
  },
  data: [
    { warehouseCode: 'WH-CBE', warehouseName: 'Coimbatore Main Warehouse', totalZones: 4, totalBins: 480, occupiedBins: 326, utilization: 68, capacity: 10000, used: 6800 },
    { warehouseCode: 'WH-CHN', warehouseName: 'Chennai Distribution Center', totalZones: 6, totalBins: 720, occupiedBins: 518, utilization: 72, capacity: 15000, used: 10800 },
    { warehouseCode: 'WH-MDU', warehouseName: 'Madurai Storage Facility', totalZones: 3, totalBins: 360, occupiedBins: 162, utilization: 45, capacity: 6000, used: 2700 },
  ],
  zoneBreakdown: [
    { zoneName: 'Receiving Zone', warehouseName: 'Coimbatore Main Warehouse', type: 'receiving', bins: 80, occupied: 40, utilization: 50 },
    { zoneName: 'Storage Zone A', warehouseName: 'Coimbatore Main Warehouse', type: 'storage', bins: 240, occupied: 168, utilization: 70 },
    { zoneName: 'Picking Zone', warehouseName: 'Coimbatore Main Warehouse', type: 'picking', bins: 80, occupied: 56, utilization: 70 },
    { zoneName: 'Shipping Zone', warehouseName: 'Coimbatore Main Warehouse', type: 'shipping', bins: 80, occupied: 56, utilization: 70 },
  ],
};

export const MOCK_AUDIT_TRAIL = {
  generatedAt: new Date().toISOString(),
  data: [
    { id: 'audit-001', entityType: 'warehouse', entityId: 'wh-001', action: 'create', userId: 'user-001', userName: 'Demo Admin', userRole: 'admin', timestamp: new Date('2024-01-15').toISOString(), newValue: { name: 'Coimbatore Main Warehouse' } },
    { id: 'audit-002', entityType: 'sku', entityId: 'sku-001', action: 'create', userId: 'user-001', userName: 'Demo Admin', userRole: 'admin', timestamp: new Date('2024-01-15').toISOString(), newValue: { code: 'SKU-ELEC-001', name: 'Wireless Mouse' } },
    { id: 'audit-003', entityType: 'stock', entityId: 'sl-001', action: 'update', userId: 'user-001', userName: 'Demo Admin', userRole: 'admin', timestamp: new Date('2024-01-15').toISOString(), oldValue: { quantity: 0 }, newValue: { quantity: 100 }, reason: 'GRN-2024-0001' },
    { id: 'audit-004', entityType: 'adjustment', entityId: 'adj-001', action: 'approve', userId: 'user-001', userName: 'Demo Admin', userRole: 'admin', timestamp: new Date('2024-01-18').toISOString(), reason: 'Cycle count variance' },
    { id: 'audit-005', entityType: 'user', entityId: 'user-002', action: 'create', userId: 'user-001', userName: 'Demo Admin', userRole: 'admin', timestamp: new Date('2024-01-15').toISOString(), newValue: { name: 'Manager User', role: 'manager' } },
  ],
};
