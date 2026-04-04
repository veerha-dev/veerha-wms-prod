// VEERHA WMS - Mapping Module Type Definitions

export type ZoneType = 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping' | 'returns' | 'staging' | 'cold-storage' | 'hazardous' | 'bulk' | 'fast-moving';

export type BinStatus = 'empty' | 'partial' | 'full' | 'reserved' | 'locked' | 'damaged' | 'unavailable';

export type RackOrientation = 'horizontal' | 'vertical';

export interface MappingLimits {
  maxZones: number;
  maxRacksPerZone: number;
  maxBinsPerRack: number;
  visualEditorEnabled: boolean;
  dragDropEnabled: boolean;
  heatmapEnabled: boolean;
}

export interface ZoneConfig {
  id: string;
  code: string;
  name: string;
  type: ZoneType;
  warehouseId: string;
  color: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  capacityWeight: number;
  capacityVolume: number;
  currentWeight: number;
  currentVolume: number;
  allowedCategories: string[];
  handlingRules: string[];
  utilization: number;
  aisleCount: number;
  rackCount: number;
  binCount: number;
  occupiedBins: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AisleConfig {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  sortOrder: number;
  rackCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RackConfig {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  aisleId: string | null;
  orientation: RackOrientation;
  position: { x: number; y: number; row: number; column: number };
  levels: number;
  binsPerLevel: number;
  maxWeight: number;
  currentWeight: number;
  isPickFace: boolean;
  isReserve: boolean;
  utilization: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BinConfig {
  id: string;
  code: string;
  rackId: string;
  zoneId: string;
  warehouseId: string;
  level: number;
  position: number;
  dimensions: { width: number; height: number; depth: number };
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  palletCompatible: boolean;
  status: BinStatus;
  skuId?: string;
  skuCode?: string;
  skuName?: string;
  quantity?: number;
  batchNumber?: string;
  expiryDate?: Date;
  isLocked: boolean;
  lockReason?: string;
  lastMovementAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryInBin {
  binId: string;
  binCode: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: Date;
  status: 'available' | 'reserved' | 'damaged' | 'expired';
}

export interface MappingAuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'lock' | 'unlock' | 'move';
  entityType: 'zone' | 'rack' | 'bin';
  entityId: string;
  entityCode: string;
  userId: string;
  userName: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  timestamp: Date;
}

export interface WarehouseMappingStats {
  totalZones: number;
  totalRacks: number;
  totalBins: number;
  occupiedBins: number;
  emptyBins: number;
  lockedBins: number;
  damagedBins: number;
  overallUtilization: number;
  mappingCompleteness: number;
  zoneBreakdown: { type: ZoneType; count: number; utilization: number }[];
}

export interface MappingValidationError {
  type: 'capacity' | 'compatibility' | 'locked' | 'weight' | 'volume';
  message: string;
  entityType: 'zone' | 'rack' | 'bin';
  entityId: string;
  entityCode: string;
}

export interface BulkRackGeneration {
  zoneId: string;
  rows: number;
  columns: number;
  levelsPerRack: number;
  binsPerLevel: number;
  rackPrefix: string;
  startingNumber: number;
  maxWeightPerBin: number;
  palletCompatible: boolean;
}

export interface BulkZoneCreation {
  warehouseId: string;
  code?: string;
  name: string;
  type?: ZoneType;
  capacityWeight?: number;
  capacityVolume?: number;
  allowedCategories?: string[];
  handlingRules?: string[];
  aisles?: { name: string; code: string; rackCount: number }[];
  racks?: { name: string; code: string; levels: number; positionsPerLevel: number; aisleIndex?: number }[];
}

export const ZONE_COLORS: Record<ZoneType, string> = {
  'receiving': 'hsl(38, 92%, 50%)',
  'storage': 'hsl(142, 71%, 45%)',
  'picking': 'hsl(220, 90%, 56%)',
  'packing': 'hsl(280, 67%, 50%)',
  'shipping': 'hsl(280, 100%, 50%)',
  'returns': 'hsl(30, 100%, 50%)',
  'staging': 'hsl(38, 92%, 50%)',
  'cold-storage': 'hsl(190, 90%, 50%)',
  'hazardous': 'hsl(0, 100%, 40%)',
  'bulk': 'hsl(220, 14%, 50%)',
  'fast-moving': 'hsl(142, 71%, 45%)',
};

export const BIN_STATUS_CONFIG: Record<BinStatus, { bg: string; border: string; label: string }> = {
  'empty': { bg: 'bg-muted', border: 'border-border', label: 'Empty' },
  'partial': { bg: 'bg-warning/20', border: 'border-warning/50', label: 'Partial' },
  'full': { bg: 'bg-success/20', border: 'border-success/50', label: 'Full' },
  'reserved': { bg: 'bg-info/20', border: 'border-info/50', label: 'Reserved' },
  'locked': { bg: 'bg-destructive/20', border: 'border-destructive/50', label: 'Locked' },
  'damaged': { bg: 'bg-destructive/30', border: 'border-destructive', label: 'Damaged' },
  'unavailable': { bg: 'bg-muted/50', border: 'border-muted-foreground/30', label: 'Unavailable' },
};
