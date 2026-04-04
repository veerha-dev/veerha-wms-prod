-- Migration: 044_create_serial_movements
-- Description: Audit trail timeline for individual serial number lifecycle
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS serial_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  serial_number_id UUID NOT NULL REFERENCES serial_numbers(id) ON DELETE CASCADE,

  movement_type TEXT NOT NULL,
  from_location TEXT,
  to_location TEXT,
  reference_type TEXT,
  reference_id UUID,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_serial_mov_tenant ON serial_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_serial_mov_serial ON serial_movements(serial_number_id);
CREATE INDEX IF NOT EXISTS idx_serial_mov_type ON serial_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_serial_mov_ref ON serial_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_serial_mov_created ON serial_movements(created_at DESC);

COMMENT ON TABLE serial_movements IS 'Audit trail timeline for individual serial number lifecycle';
COMMENT ON COLUMN serial_movements.movement_type IS 'received, putaway, picked, packed, shipped, delivered, returned, damaged, transferred';
