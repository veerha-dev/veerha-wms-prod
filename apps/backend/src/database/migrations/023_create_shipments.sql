-- Migration: 023_create_shipments.sql
-- Description: Create shipments table
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  shipment_number TEXT NOT NULL,
  so_id UUID REFERENCES sales_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  carrier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  weight NUMERIC(10,2),
  dispatched_at TIMESTAMP,
  delivered_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shipment_number ON shipments(shipment_number);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant_id ON shipments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_so_id ON shipments(so_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
