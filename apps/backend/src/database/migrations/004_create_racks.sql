-- Migration: 004_create_racks
-- Description: Create racks table for physical shelving structures within zones
-- Created: 2026-03-14

CREATE TABLE IF NOT EXISTS racks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  row_position INTEGER,
  column_position INTEGER,
  
  levels INTEGER DEFAULT 1,
  slots_per_level INTEGER DEFAULT 1,
  
  max_weight_kg NUMERIC DEFAULT 0,
  max_volume_m3 NUMERIC DEFAULT 0,
  
  current_weight_kg NUMERIC DEFAULT 0,
  current_volume_m3 NUMERIC DEFAULT 0,
  
  bin_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_racks_tenant ON racks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_racks_zone ON racks(zone_id);
CREATE INDEX IF NOT EXISTS idx_racks_code ON racks(code);
CREATE INDEX IF NOT EXISTS idx_racks_status ON racks(status);
CREATE INDEX IF NOT EXISTS idx_racks_zone_status ON racks(zone_id, status);

-- Comments for documentation
COMMENT ON TABLE racks IS 'Physical shelving structures within zones for organizing bins';
COMMENT ON COLUMN racks.code IS 'Unique rack code, auto-generated if not provided (RK-001, RK-002, etc.)';
COMMENT ON COLUMN racks.levels IS 'Number of vertical levels/shelves in the rack (1-20)';
COMMENT ON COLUMN racks.slots_per_level IS 'Number of bin slots per level (1-50)';
COMMENT ON COLUMN racks.bin_count IS 'Number of bins in this rack (updated by service/triggers)';
COMMENT ON COLUMN racks.row_position IS 'Physical row position within the zone';
COMMENT ON COLUMN racks.column_position IS 'Physical column position within the zone';
