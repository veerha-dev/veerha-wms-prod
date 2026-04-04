-- Migration: 042_create_invoice_items
-- Description: Create invoice_items table for persistent line items with GST and HSN
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  item_type TEXT DEFAULT 'product',
  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  sku_code TEXT,
  sku_name TEXT,
  hsn_code TEXT,
  description TEXT,

  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  cgst_amount NUMERIC(12,2) DEFAULT 0,
  sgst_amount NUMERIC(12,2) DEFAULT 0,
  igst_amount NUMERIC(12,2) DEFAULT 0,
  line_total NUMERIC(12,2) DEFAULT 0,

  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_tenant ON invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_sku ON invoice_items(sku_id);

-- Comments
COMMENT ON TABLE invoice_items IS 'Line items for invoices with GST breakdown and HSN codes';
COMMENT ON COLUMN invoice_items.item_type IS 'product, storage, handling, vas, other';
COMMENT ON COLUMN invoice_items.hsn_code IS 'HSN/SAC code for GST filing (4-8 digits)';
COMMENT ON COLUMN invoice_items.tax_rate IS 'GST rate percentage (e.g., 18 for 18%)';
