-- Migration: 040_add_warehouse_id_to_users
-- Description: Add warehouse_id to users for manager warehouse scoping
-- Created: 2026-04-01

ALTER TABLE users ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_warehouse ON users(warehouse_id);

COMMENT ON COLUMN users.warehouse_id IS 'Assigned warehouse for managers and workers — NULL means access to all warehouses (admin)';
