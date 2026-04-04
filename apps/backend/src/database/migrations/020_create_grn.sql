-- Migration: 020_create_grn.sql
-- Description: Create goods received notes tables
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS grn (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  grn_number TEXT NOT NULL,
  po_id UUID REFERENCES purchase_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending',
  received_by UUID REFERENCES users(id),
  received_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grn_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id UUID REFERENCES grn(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity_expected INTEGER DEFAULT 0,
  quantity_received INTEGER DEFAULT 0,
  batch_number TEXT,
  expiry_date TIMESTAMP,
  condition TEXT DEFAULT 'good',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_grn_number ON grn(grn_number);
CREATE INDEX IF NOT EXISTS idx_grn_tenant_id ON grn(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grn_po_id ON grn(po_id);
CREATE INDEX IF NOT EXISTS idx_grn_status ON grn(status);
CREATE INDEX IF NOT EXISTS idx_grn_items_grn_id ON grn_items(grn_id);
