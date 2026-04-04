-- Migration: 047_create_cycle_count_items
-- Description: Create cycle_count_items for individual SKU count lines
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS cycle_count_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cycle_count_id UUID NOT NULL REFERENCES cycle_counts(id) ON DELETE CASCADE,

  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  sku_code TEXT,
  sku_name TEXT,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  bin_code TEXT,

  system_qty INTEGER NOT NULL DEFAULT 0,
  physical_qty INTEGER,
  variance INTEGER,
  variance_percent NUMERIC(5,2),

  action TEXT,
  notes TEXT,
  counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cc_items_tenant ON cycle_count_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cc_items_cycle_count ON cycle_count_items(cycle_count_id);
CREATE INDEX IF NOT EXISTS idx_cc_items_sku ON cycle_count_items(sku_id);

COMMENT ON TABLE cycle_count_items IS 'Individual SKU/bin lines within a cycle count';
COMMENT ON COLUMN cycle_count_items.action IS 'approved, rejected, escalated — set during review';
