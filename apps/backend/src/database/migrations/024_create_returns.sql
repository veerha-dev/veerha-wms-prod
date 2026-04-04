-- Migration: 024_create_returns.sql
-- Description: Create returns and return items tables
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  return_number TEXT NOT NULL,
  so_id UUID REFERENCES sales_orders(id),
  customer_id UUID REFERENCES customers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  reason TEXT,
  status TEXT DEFAULT 'pending',
  received_at TIMESTAMP,
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'good',
  disposition TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_return_number ON returns(return_number);
CREATE INDEX IF NOT EXISTS idx_returns_tenant_id ON returns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON return_items(return_id);
