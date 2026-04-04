-- Migration: 022_create_pick_lists.sql
-- Description: Create pick lists and pick list items tables
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS pick_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  pick_list_number TEXT NOT NULL,
  so_id UUID REFERENCES sales_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pick_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pick_list_id UUID REFERENCES pick_lists(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  bin_id UUID REFERENCES bins(id),
  quantity_required INTEGER NOT NULL DEFAULT 0,
  quantity_picked INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pl_number ON pick_lists(pick_list_number);
CREATE INDEX IF NOT EXISTS idx_pl_tenant_id ON pick_lists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pl_so_id ON pick_lists(so_id);
CREATE INDEX IF NOT EXISTS idx_pl_status ON pick_lists(status);
CREATE INDEX IF NOT EXISTS idx_pli_pick_list_id ON pick_list_items(pick_list_id);
