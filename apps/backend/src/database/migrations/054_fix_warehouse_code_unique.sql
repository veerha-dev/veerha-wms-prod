-- Migration: 054_fix_warehouse_code_unique
-- Description: Change warehouse code from global unique to per-tenant unique
-- This allows different tenants to have WH-001, WH-002 independently

-- Drop the global unique constraint
ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_code_key;

-- Add per-tenant unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_warehouses_tenant_code ON warehouses(tenant_id, code);
