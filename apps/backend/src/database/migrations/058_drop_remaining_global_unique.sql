-- Migration: 058_drop_remaining_global_unique
-- Description: Drop leftover global unique indexes created in original migrations
-- These used different naming than the _key constraints, so 057 missed them

DROP INDEX IF EXISTS idx_po_number;
DROP INDEX IF EXISTS idx_grn_number;
DROP INDEX IF EXISTS idx_qc_number;
DROP INDEX IF EXISTS idx_suppliers_code;
DROP INDEX IF EXISTS idx_putaway_number;
