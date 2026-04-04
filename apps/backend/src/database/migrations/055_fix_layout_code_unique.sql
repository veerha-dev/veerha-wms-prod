-- Migration: 055_fix_layout_code_unique
-- Description: Change zones, racks, bins code from global unique to per-tenant unique
-- Same fix as 054 for warehouses — allows different tenants to have ZN-001, RK-001 independently

-- zones: global unique → per-tenant unique
ALTER TABLE zones DROP CONSTRAINT IF EXISTS zones_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_zones_tenant_code ON zones(tenant_id, code);

-- racks: global unique → per-tenant unique
ALTER TABLE racks DROP CONSTRAINT IF EXISTS racks_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_racks_tenant_code ON racks(tenant_id, code);

-- bins: global unique → per-tenant unique
ALTER TABLE bins DROP CONSTRAINT IF EXISTS bins_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bins_tenant_code ON bins(tenant_id, code);
