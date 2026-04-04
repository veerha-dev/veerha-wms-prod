-- Migration: 038_add_aisle_id_to_racks
-- Description: Add optional aisle_id foreign key to racks table
-- Created: 2026-03-31

ALTER TABLE racks ADD COLUMN IF NOT EXISTS aisle_id UUID REFERENCES aisles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_racks_aisle ON racks(aisle_id);

COMMENT ON COLUMN racks.aisle_id IS 'Optional parent aisle - NULL when rack is directly under zone';
