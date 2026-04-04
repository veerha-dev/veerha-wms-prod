-- Migration: 009_create_stock_movements.sql
-- Description: Create Stock Movements table for audit trail
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  movement_number TEXT UNIQUE NOT NULL,
  movement_type TEXT NOT NULL,

  sku_id UUID NOT NULL REFERENCES skus(id),
  batch_id UUID REFERENCES batches(id),
  warehouse_id UUID REFERENCES warehouses(id),

  from_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  to_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,

  quantity INTEGER NOT NULL,

  reference_type TEXT,
  reference_id UUID,
  notes TEXT,

  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_sku ON stock_movements(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_number ON stock_movements(movement_number);

COMMENT ON TABLE stock_movements IS 'Audit trail for all inventory movements';
