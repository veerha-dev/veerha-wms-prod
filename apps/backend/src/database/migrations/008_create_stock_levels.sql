-- Migration: 008_create_stock_levels.sql
-- Description: Create Stock Levels table for inventory tracking
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,

  quantity_available INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_in_transit INTEGER DEFAULT 0,
  quantity_damaged INTEGER DEFAULT 0,

  last_counted_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_levels_tenant ON stock_levels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_sku ON stock_levels(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_bin ON stock_levels(bin_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_batch ON stock_levels(batch_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_levels_unique ON stock_levels(tenant_id, sku_id, warehouse_id, COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'), COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'));

COMMENT ON TABLE stock_levels IS 'Inventory stock levels per SKU/warehouse/bin/batch combination';
