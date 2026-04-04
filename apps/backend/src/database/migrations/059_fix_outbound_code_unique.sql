-- Migration: 059_fix_outbound_code_unique
-- Description: Fix global unique constraints on outbound + customers tables for multi-tenancy

DROP INDEX IF EXISTS idx_so_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_so_tenant_number ON sales_orders(tenant_id, so_number);

DROP INDEX IF EXISTS idx_pl_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pl_tenant_number ON pick_lists(tenant_id, pick_list_number);

DROP INDEX IF EXISTS idx_shipment_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipment_tenant_number ON shipments(tenant_id, shipment_number);

DROP INDEX IF EXISTS idx_customers_code;
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tenant_code ON customers(tenant_id, code);
