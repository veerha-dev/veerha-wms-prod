-- Migration: 057_fix_inbound_code_unique
-- Description: Fix global unique constraints on all inbound tables for multi-tenancy

ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_tenant_code ON suppliers(tenant_id, code);

ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_po_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_po_tenant_number ON purchase_orders(tenant_id, po_number);

ALTER TABLE grn DROP CONSTRAINT IF EXISTS grn_grn_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_grn_tenant_number ON grn(tenant_id, grn_number);

ALTER TABLE qc_inspections DROP CONSTRAINT IF EXISTS qc_inspections_qc_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_tenant_number ON qc_inspections(tenant_id, qc_number);

ALTER TABLE putaway_tasks DROP CONSTRAINT IF EXISTS putaway_tasks_putaway_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_putaway_tenant_number ON putaway_tasks(tenant_id, putaway_number);
