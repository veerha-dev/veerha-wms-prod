-- Migration: 050_create_pick_waves
-- Description: Create pick_waves table for wave picking (Phase 2 structure)
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS pick_waves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wave_number TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'draft',
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  release_time TIMESTAMP,
  cutoff_time TIMESTAMP,
  shipping_deadline TIMESTAMP,
  priority_filter TEXT,
  auto_assign_workers BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  released_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pw_number ON pick_waves(tenant_id, wave_number);
CREATE INDEX IF NOT EXISTS idx_pw_tenant ON pick_waves(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pw_status ON pick_waves(status);

-- Add FK from pick_lists.wave_id to pick_waves
ALTER TABLE pick_lists ADD CONSTRAINT fk_pl_wave FOREIGN KEY (wave_id) REFERENCES pick_waves(id) ON DELETE SET NULL;

COMMENT ON TABLE pick_waves IS 'Wave planning for time-scheduled batch picking (Phase 2)';
COMMENT ON COLUMN pick_waves.type IS 'manual or scheduled';
COMMENT ON COLUMN pick_waves.status IS 'draft, scheduled, released, in_progress, completed, cancelled';
