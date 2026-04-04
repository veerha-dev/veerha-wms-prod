-- Migration: 053_add_feature_flags_to_tenants
-- Description: Add feature_flags JSONB and notes to tenants for per-tenant feature control
-- Created: 2026-04-01

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]';

COMMENT ON COLUMN tenants.feature_flags IS 'Per-tenant feature overrides: {"wave_picking": true, "serial_tracking": false}';
COMMENT ON COLUMN tenants.internal_notes IS 'Internal notes array: [{"text": "...", "createdAt": "...", "createdBy": "..."}]';
