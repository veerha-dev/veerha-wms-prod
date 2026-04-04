-- Migration: 046_create_cycle_counts
-- Description: Create cycle_counts table for scheduled physical inventory verification
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS cycle_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  count_number TEXT NOT NULL,
  name TEXT NOT NULL,

  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  count_scope TEXT NOT NULL DEFAULT 'full_zone',
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  rack_id UUID REFERENCES racks(id) ON DELETE SET NULL,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,

  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date DATE,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'scheduled',
  instructions TEXT,

  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, count_number)
);

CREATE INDEX IF NOT EXISTS idx_cycle_counts_tenant ON cycle_counts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_warehouse ON cycle_counts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_status ON cycle_counts(status);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_assigned ON cycle_counts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_date ON cycle_counts(scheduled_date);

COMMENT ON TABLE cycle_counts IS 'Scheduled physical inventory verification counts';
COMMENT ON COLUMN cycle_counts.count_scope IS 'full_zone, specific_rack, specific_bin, sku_based';
COMMENT ON COLUMN cycle_counts.status IS 'scheduled, assigned, in_progress, counted, under_review, completed, cancelled';
