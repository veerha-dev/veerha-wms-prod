-- Migration: 006_create_skus.sql
-- Description: Create SKU Master table
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  brand TEXT,
  description TEXT,

  uom TEXT DEFAULT 'pcs',
  weight NUMERIC DEFAULT 0,
  length NUMERIC DEFAULT 0,
  width NUMERIC DEFAULT 0,
  height NUMERIC DEFAULT 0,

  barcode TEXT,
  hsn_code TEXT,
  gst_rate NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,

  reorder_point INTEGER DEFAULT 0,
  reorder_qty INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 0,

  batch_tracking BOOLEAN DEFAULT false,
  expiry_tracking BOOLEAN DEFAULT false,
  serial_tracking BOOLEAN DEFAULT false,
  shelf_life_days INTEGER,

  storage_type TEXT DEFAULT 'ambient',
  hazardous BOOLEAN DEFAULT false,
  fragile BOOLEAN DEFAULT false,

  tags TEXT[],
  status TEXT DEFAULT 'active',
  image_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skus_tenant ON skus(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skus_code ON skus(code);
CREATE INDEX IF NOT EXISTS idx_skus_category ON skus(category);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_skus_barcode ON skus(barcode);

COMMENT ON TABLE skus IS 'SKU Master - product catalog for inventory management';
