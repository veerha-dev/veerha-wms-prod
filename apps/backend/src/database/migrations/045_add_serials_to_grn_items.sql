-- Migration: 045_add_serials_to_grn_items
-- Description: Add serial_numbers_input array to grn_items for serial capture during receipt
-- Created: 2026-04-01

ALTER TABLE grn_items ADD COLUMN IF NOT EXISTS serial_numbers_input TEXT[];

COMMENT ON COLUMN grn_items.serial_numbers_input IS 'Temporary storage for serial numbers entered during GRN receipt';
