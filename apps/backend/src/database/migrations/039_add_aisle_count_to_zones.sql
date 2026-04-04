-- Migration: 039_add_aisle_count_to_zones
-- Description: Add aisle_count column to zones table
-- Created: 2026-03-31

ALTER TABLE zones ADD COLUMN IF NOT EXISTS aisle_count INTEGER DEFAULT 0;

COMMENT ON COLUMN zones.aisle_count IS 'Number of aisles in this zone (updated by service)';
