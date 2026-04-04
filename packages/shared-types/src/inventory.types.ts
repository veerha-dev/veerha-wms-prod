// Inventory domain types: SKUs, stock, batches, movements

import { TenantScopedEntity, BaseEntity } from './common.types';

// --- Enums ---

export type SKUStatus = 'active' | 'inactive' | 'discontinued';

export type StockStatus = 'available' | 'reserved' | 'damaged' | 'in-transit' | 'expired';

export type MovementType =
  | 'inbound'
  | 'outbound'
  | 'transfer'
  | 'adjustment'
  | 'damage'
  | 'return'
  | 'putaway'
  | 'picking';

export type BatchStatus = 'active' | 'blocked' | 'quarantine' | 'expired' | 'consumed' | 'depleted';

export type DamageCategory = 'physical' | 'water' | 'expired' | 'defective' | 'contaminated' | 'other';

export type DispositionDecision = 'pending' | 'restock' | 'refurbish' | 'scrap' | 'return_to_vendor';

export type AlertType = 'low_stock' | 'expiry_warning' | 'expiry_critical' | 'overstock' | 'damage_reported';

export type AlertSeverity = 'warning' | 'critical';

// --- Entities ---

export interface Category extends TenantScopedEntity {
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol?: string;
}

export interface SKU extends TenantScopedEntity {
  skuCode: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitId?: string;
  brand?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  barcode?: string;
  hsnCode?: string;
  gstRate?: number;
  unitCost?: number;
  sellingPrice?: number;
  reorderPoint: number;
  reorderQty: number;
  minStock: number;
  maxStock?: number;
  isBatchTracked: boolean;
  isExpiryTracked: boolean;
  isSerialized: boolean;
  shelfLifeDays?: number;
  storageType?: string;
  status: SKUStatus;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface StockLevel {
  id: string;
  skuId: string;
  warehouseId: string;
  zoneId?: string;
  binId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  damagedQuantity: number;
  updatedAt: string;
}

export interface BinInventory {
  id: string;
  binId: string;
  skuId: string;
  batchId?: string;
  quantity: number;
  status: StockStatus;
  updatedAt: string;
}

export interface Batch {
  id: string;
  skuId: string;
  batchNumber: string;
  manufacturedDate?: string;
  expiryDate?: string;
  supplierId?: string;
  quantityReceived: number;
  quantityRemaining: number;
  status: BatchStatus;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  tenantId: string;
  skuId: string;
  batchId?: string;
  movementType: MovementType;
  quantity: number;
  fromBin?: string;
  toBin?: string;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface DamagedItem {
  id: string;
  tenantId: string;
  skuId: string;
  batchId?: string;
  warehouseId?: string;
  binId?: string;
  quantity: number;
  damageCategory: DamageCategory;
  description: string;
  photos?: string[];
  decision: DispositionDecision;
  decidedBy?: string;
  decidedAt?: string;
  reportedBy?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  tenantId: string;
  adjustmentNumber: string;
  skuId: string;
  warehouseId?: string;
  binId?: string;
  systemQty?: number;
  physicalQty?: number;
  variance?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy?: string;
  approvedBy?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  id: string;
  tenantId: string;
  type: AlertType;
  severity: AlertSeverity;
  skuId: string;
  warehouseId?: string;
  message: string;
  thresholdValue?: number;
  currentValue?: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

// --- Analytics ---

export interface InventoryAnalytics {
  totalSKUs: number;
  activeSKUs: number;
  totalStockValue: number;
  lowStockItems: number;
  expiringSoonItems: number;
  overstockItems: number;
  damageRate: number;
  movementTrend: { date: string; stockIn: number; stockOut: number }[];
  categoryDistribution: { category: string; count: number }[];
  warehouseDistribution: { warehouse: string; quantity: number; value: number }[];
}
