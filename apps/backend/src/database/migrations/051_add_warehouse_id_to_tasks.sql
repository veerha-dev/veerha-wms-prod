-- Migration: 051_add_warehouse_id_to_tasks
-- Description: Add warehouse_id to tasks for warehouse-scoped manager dashboard queries
-- Created: 2026-04-01

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_warehouse ON tasks(warehouse_id);
