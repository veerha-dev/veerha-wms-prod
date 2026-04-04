-- Migration: 013_create_adjustments.sql
-- Description: Create stock adjustments table
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  adjustment_number TEXT UNIQUE NOT NULL,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  location_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  quantity_before INTEGER DEFAULT 0,
  quantity_after INTEGER DEFAULT 0,
  adjustment_qty INTEGER NOT NULL,
  adjustment_type TEXT DEFAULT 'manual',
  reason TEXT NOT NULL,
  reason_category TEXT,
  
  status TEXT DEFAULT 'pending',
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  applied_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adjustment items for multi-SKU adjustments
CREATE TABLE IF NOT EXISTS stock_adjustment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  system_qty INTEGER DEFAULT 0,
  physical_qty INTEGER DEFAULT 0,
  variance INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_id ON stock_adjustments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_sku_id ON stock_adjustments(sku_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status ON stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_adjustment_id ON stock_adjustment_items(adjustment_id);
