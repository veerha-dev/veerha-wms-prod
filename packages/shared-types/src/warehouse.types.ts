// Warehouse, zone, rack, bin types

import { TenantScopedEntity, BaseEntity } from './common.types';

// --- Enums ---

export type WarehouseType = 'distribution' | 'manufacturing' | 'cold_storage' | 'bonded' | 'transit' | 'retail';

export type WarehouseStatus = 'active' | 'inactive' | 'maintenance';

export type ZoneType =
  | 'receiving'
  | 'storage'
  | 'picking'
  | 'packing'
  | 'shipping'
  | 'returns'
  | 'staging'
  | 'cold-storage'
  | 'hazardous'
  | 'bulk'
  | 'fast-moving';

export type BinStatus = 'empty' | 'partial' | 'full' | 'reserved' | 'locked' | 'damaged' | 'unavailable';

export type RackOrientation = 'horizontal' | 'vertical';

// --- Entities ---

export interface Warehouse extends TenantScopedEntity {
  code: string;
  name: string;
  type: WarehouseType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  totalCapacity: number;
  totalAreaSqft?: number;
  currentOccupancy: number;
  contactPhone?: string;
  contactEmail?: string;
  status: WarehouseStatus;
}

export interface Zone extends BaseEntity {
  warehouseId: string;
  code: string;
  name: string;
  type: ZoneType;
  capacityWeight: number;
  capacityVolume: number;
  currentWeight: number;
  currentVolume: number;
  utilization: number;
  rackCount: number;
  binCount: number;
  occupiedBins: number;
  isActive: boolean;
  isLocked: boolean;
}

export interface Rack extends BaseEntity {
  zoneId: string;
  code: string;
  name: string;
  orientation: RackOrientation;
  levels: number;
  binsPerLevel: number;
  maxWeight: number;
  currentWeight: number;
  utilization: number;
  isActive: boolean;
  isLocked: boolean;
}

export interface Bin extends BaseEntity {
  rackId: string;
  zoneId: string;
  warehouseId: string;
  code: string;
  level: number;
  position: number;
  capacity: number;
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  status: BinStatus;
  skuId?: string;
  skuCode?: string;
  skuName?: string;
  quantity?: number;
  batchNumber?: string;
  expiryDate?: string;
  isLocked: boolean;
  lockReason?: string;
  lastMovementAt?: string;
}

// --- Stats ---

export interface WarehouseMappingStats {
  totalZones: number;
  totalRacks: number;
  totalBins: number;
  occupiedBins: number;
  emptyBins: number;
  lockedBins: number;
  damagedBins: number;
  overallUtilization: number;
  zoneBreakdown: { type: ZoneType; count: number; utilization: number }[];
}
