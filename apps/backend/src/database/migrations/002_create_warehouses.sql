-- Migration: 002_create_warehouses
-- Description: Create warehouses table with all frontend-required fields
-- Created: 2026-03-13

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'distribution',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  total_capacity INTEGER NOT NULL DEFAULT 0,
  total_area_sqft NUMERIC,
  current_occupancy INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON warehouses(status);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(type);

-- Composite index for tenant + status queries
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_status ON warehouses(tenant_id, status);

-- Add comment for documentation
COMMENT ON TABLE warehouses IS 'Warehouse locations for inventory storage';
COMMENT ON COLUMN warehouses.code IS 'Unique warehouse code, auto-generated if not provided (WH-001, WH-002, etc.)';
COMMENT ON COLUMN warehouses.type IS 'Warehouse type: distribution, manufacturing, cold_storage, bonded, transit, retail';
COMMENT ON COLUMN warehouses.status IS 'Warehouse status: active, inactive, maintenance';
