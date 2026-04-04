-- Migration: 037_create_aisles
-- Description: Create aisles table for optional corridor grouping between zones and racks
-- Created: 2026-03-31

CREATE TABLE IF NOT EXISTS aisles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,

  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,

  rack_count INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aisles_tenant ON aisles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aisles_zone ON aisles(zone_id);
CREATE INDEX IF NOT EXISTS idx_aisles_code ON aisles(code);
CREATE INDEX IF NOT EXISTS idx_aisles_zone_sort ON aisles(zone_id, sort_order);

-- Comments for documentation
COMMENT ON TABLE aisles IS 'Optional corridor grouping within zones - aisles contain racks';
COMMENT ON COLUMN aisles.code IS 'Unique aisle code within tenant, auto-generated if not provided (AL-001, AL-002, etc.)';
COMMENT ON COLUMN aisles.sort_order IS 'Display order within the zone';
COMMENT ON COLUMN aisles.rack_count IS 'Number of racks in this aisle (updated by service)';
