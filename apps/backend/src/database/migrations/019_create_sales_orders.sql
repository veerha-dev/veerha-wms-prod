-- Migration: 019_create_sales_orders.sql
-- Description: Create sales orders and line items tables
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  so_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'draft',
  shipping_address TEXT,
  total_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  so_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity_ordered INTEGER NOT NULL DEFAULT 0,
  quantity_picked INTEGER DEFAULT 0,
  quantity_shipped INTEGER DEFAULT 0,
  unit_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_so_number ON sales_orders(so_number);
CREATE INDEX IF NOT EXISTS idx_so_tenant_id ON sales_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_so_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_so_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_soi_so_id ON sales_order_items(so_id);
