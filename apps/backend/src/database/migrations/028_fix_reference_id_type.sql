-- Migration: 028_fix_reference_id_type.sql
-- Description: Change reference_id from UUID to TEXT to support PO-001/SO-001 style references
-- Date: 2026-03-28

ALTER TABLE stock_movements ALTER COLUMN reference_id TYPE TEXT;
