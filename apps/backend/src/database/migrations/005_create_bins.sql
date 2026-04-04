-- Migration: 005_create_bins
-- Description: Create bins table for individual storage locations within racks
-- Created: 2026-03-14

CREATE TABLE IF NOT EXISTS bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL,
  position INTEGER NOT NULL,
  
  capacity NUMERIC DEFAULT 0,
  max_weight NUMERIC DEFAULT 0,
  max_volume NUMERIC DEFAULT 0,
  
  current_weight NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  
  status TEXT DEFAULT 'empty',
  
  is_locked BOOLEAN DEFAULT false,
  lock_reason TEXT,
  
  last_movement_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bins_tenant ON bins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bins_rack ON bins(rack_id);
CREATE INDEX IF NOT EXISTS idx_bins_zone ON bins(zone_id);
CREATE INDEX IF NOT EXISTS idx_bins_warehouse ON bins(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_bins_code ON bins(code);
CREATE INDEX IF NOT EXISTS idx_bins_status ON bins(status);
CREATE INDEX IF NOT EXISTS idx_bins_rack_level ON bins(rack_id, level, position);

-- Comments for documentation
COMMENT ON TABLE bins IS 'Individual storage locations within racks';
COMMENT ON COLUMN bins.code IS 'Unique bin code, auto-generated if not provided (BIN-001, BIN-002, etc.)';
COMMENT ON COLUMN bins.level IS 'Vertical level/shelf number in the rack (1-based)';
COMMENT ON COLUMN bins.position IS 'Horizontal position on the level (1-based)';
COMMENT ON COLUMN bins.status IS 'Bin status: empty, partial, full, reserved, damaged';
COMMENT ON COLUMN bins.is_locked IS 'Whether the bin is locked for operations';
COMMENT ON COLUMN bins.lock_reason IS 'Reason for locking the bin';
