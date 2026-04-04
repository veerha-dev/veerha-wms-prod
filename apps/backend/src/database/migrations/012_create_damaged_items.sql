-- Migration: 012_create_damaged_items.sql
-- Description: Create damaged items table
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS damaged_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  batch_number TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  damage_type TEXT NOT NULL DEFAULT 'physical',
  description TEXT NOT NULL,
  photos TEXT[],
  
  location_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  disposition TEXT DEFAULT 'pending',
  decided_by UUID REFERENCES users(id) ON DELETE SET NULL,
  decided_at TIMESTAMP,
  
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_by_role TEXT DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_damaged_items_tenant_id ON damaged_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_damaged_items_sku_id ON damaged_items(sku_id);
CREATE INDEX IF NOT EXISTS idx_damaged_items_batch_id ON damaged_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_damaged_items_status ON damaged_items(disposition);
CREATE INDEX IF NOT EXISTS idx_damaged_items_created_at ON damaged_items(created_at);
CREATE INDEX IF NOT EXISTS idx_damaged_items_location ON damaged_items(location_id, warehouse_id);
