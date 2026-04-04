-- Migration: 003_create_zones
-- Description: Create zones table for warehouse logical divisions
-- Created: 2026-03-14

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'storage',
  
  capacity_weight NUMERIC DEFAULT 0,
  capacity_volume NUMERIC DEFAULT 0,
  current_weight NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  
  rack_count INTEGER DEFAULT 0,
  bin_count INTEGER DEFAULT 0,
  occupied_bins INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_zones_tenant ON zones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zones_warehouse ON zones(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_zones_code ON zones(code);
CREATE INDEX IF NOT EXISTS idx_zones_type ON zones(type);
CREATE INDEX IF NOT EXISTS idx_zones_warehouse_type ON zones(warehouse_id, type);

-- Comments for documentation
COMMENT ON TABLE zones IS 'Logical divisions within warehouses for organizing inventory';
COMMENT ON COLUMN zones.code IS 'Unique zone code, auto-generated if not provided (ZN-001, ZN-002, etc.)';
COMMENT ON COLUMN zones.type IS 'Zone type: receiving, storage, picking, packing, shipping, returns, staging, cold-storage, hazardous, bulk, fast-moving';
COMMENT ON COLUMN zones.capacity_weight IS 'Maximum weight capacity in kg';
COMMENT ON COLUMN zones.capacity_volume IS 'Maximum volume capacity in cubic units';
COMMENT ON COLUMN zones.rack_count IS 'Number of racks in this zone (updated by triggers/service)';
COMMENT ON COLUMN zones.bin_count IS 'Number of bins in this zone (updated by triggers/service)';
COMMENT ON COLUMN zones.occupied_bins IS 'Number of occupied bins (updated by triggers/service)';
