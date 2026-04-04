-- Migration: 056_fix_remaining_code_unique
-- Description: Fix global unique constraints on stock_movements, stock_adjustments, cycle_counts, stock_transfers
-- Same pattern as 054/055 — allow different tenants to have independent numbering

-- stock_movements
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_movement_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_movements_tenant_number ON stock_movements(tenant_id, movement_number);

-- stock_adjustments
ALTER TABLE stock_adjustments DROP CONSTRAINT IF EXISTS stock_adjustments_adjustment_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_number ON stock_adjustments(tenant_id, adjustment_number);

-- cycle_counts (already has tenant-scoped in some setups, but ensure it)
ALTER TABLE cycle_counts DROP CONSTRAINT IF EXISTS cycle_counts_count_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_counts_tenant_number ON cycle_counts(tenant_id, count_number);

-- stock_transfers
ALTER TABLE stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_transfer_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_transfers_tenant_number ON stock_transfers(tenant_id, transfer_number);
