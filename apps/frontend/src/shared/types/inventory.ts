// Inventory Management Type Definitions

export type SKUStatus = 'active' | 'inactive' | 'blocked' | 'discontinued';
export type StockStatus = 'available' | 'reserved' | 'damaged' | 'in-transit' | 'expired';
export type MovementType = 'stock-in' | 'stock-out' | 'stock_in' | 'stock_out' | 'putaway' | 'picking' | 'pick' | 'transfer' | 'adjustment' | 'return' | 'damage' | 'scrap';
export type DamageCategory = 'physical' | 'water' | 'expired' | 'defective' | 'contaminated' | 'other' | string;
export type DispositionDecision = 'restock' | 'refurbish' | 'scrap' | 'pending' | 'return_to_vendor';

export interface SKUMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  uom?: string;
  unit?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  barcode?: string;
  hsnCode?: string;
  gstRate?: number;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint?: number;
  reorderQty?: number;
  minStock?: number;
  maxStock?: number;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  serialTracking?: boolean;
  shelfLifeDays?: number;
  storageType?: string;
  hazardous?: boolean;
  fragile?: boolean;
  tags?: string[];
  status: SKUStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SKUVariant {
  id: string;
  skuId: string;
  name: string;
  attributes: Record<string, string>;
}

export interface StockLevel {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  warehouseId: string;
  warehouseName: string;
  zoneId?: string;
  zoneName?: string;
  rackId?: string;
  shelfId?: string;
  binId?: string;
  binCode?: string;
  batchId?: string;
  batchNumber?: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDamaged: number;
  quantityInTransit: number;
  totalQuantity: number;
  lastUpdated: Date;
  lastCountedAt?: Date;
}

export interface Batch {
  id: string;
  skuId: string;
  skuCode: string;
  batchNumber: string;
  manufactureDate: Date;
  expiryDate?: Date;
  supplierReference?: string;
  quantity: number;
  status: 'active' | 'blocked' | 'quarantine' | 'expired' | 'consumed' | 'depleted';
  fifoRank: number;
  createdAt: Date;
}

export interface InventoryMovement {
  id: string;
  movementNumber: string;
  type: MovementType;
  skuId: string;
  skuCode: string;
  skuName: string;
  batchId?: string;
  batchNumber?: string;
  quantity: number;
  sourceWarehouse?: string;
  sourceZone?: string;
  sourceBin?: string;
  destinationWarehouse?: string;
  destinationZone?: string;
  destinationBin?: string;
  reference?: string;
  referenceType?: string;
  referenceId?: string;
  triggeredBy: string;
  triggeredByRole: string;
  reason?: string;
  timestamp: Date;
  reversalOf?: string;
  reversedBy?: string;
}

export interface DamagedItem {
  id: string;
  sku_id: string;
  sku_code: string;
  sku_name: string;
  batch_id?: string;
  batch_number?: string;
  quantity: number;
  damage_type: string;
  description: string;
  photos?: string[];
  location: string;
  location_id?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  bin_code?: string;
  disposition: string;
  decided_by?: string;
  decided_at?: string;
  reported_by?: string;
  reported_by_role?: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  batchId?: string;
  location: string;
  quantityBefore?: number;
  quantityAfter?: number;
  adjustmentQty: number;
  adjustmentType?: string;
  previousQty?: number;
  newQty?: number;
  reason: string;
  reasonCategory?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface InventoryAlert {
  id: string;
  type: 'low-stock' | 'expiring-soon' | 'overstock' | 'expired' | 'low_stock' | 'expiry_warning' | 'expiry_critical' | 'damage_reported';
  severity?: 'warning' | 'critical';
  skuId: string;
  skuCode: string;
  skuName: string;
  warehouseId?: string;
  warehouseName?: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  acknowledged: boolean;
}

export interface InventorySettings {
  stockLockingEnabled: boolean;
  negativeStockAllowed: boolean;
  fifoPreference: 'fifo' | 'fefo' | 'manual';
  autoBlockExpired: boolean;
  lowStockThreshold: number;
  expiryAlertDays: number;
  overstockThreshold: number;
  adjustmentApprovalRequired: boolean;
  maxAdjustmentWithoutApproval: number;
}

export interface InventoryAnalytics {
  inventoryAccuracy: number;
  totalSKUs: number;
  activeSKUs: number;
  totalStockValue: number;
  lowStockItems: number;
  expiringSoonItems: number;
  overstockItems: number;
  deadStockItems: number;
  damageRate: number;
  skuVelocity: { sku: string; velocity: number }[];
  warehouseDistribution: { warehouse: string; quantity: number; value: number }[];
  categoryDistribution: { category: string; count: number }[];
  movementTrend: { date: string; stockIn: number; stockOut: number }[];
}

export interface AuditLogEntry {
  id: string;
  entityType: 'sku' | 'stock' | 'batch' | 'adjustment' | 'setting';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'approve' | 'reject';
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
}
