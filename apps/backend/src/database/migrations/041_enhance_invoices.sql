-- Migration: 041_enhance_invoices
-- Description: Add GST, payment terms, linked references, warehouse scoping to invoices
-- Created: 2026-04-01

-- New columns for invoice metadata
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP DEFAULT NOW();
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;

-- Linked references
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS grn_id UUID REFERENCES grn(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- GST breakdown
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gst_type TEXT DEFAULT 'intra-state';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;

-- Service invoice billing period
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_period_start DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_period_end DATE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_grn ON invoices(grn_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment ON invoices(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_warehouse ON invoices(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Comments
COMMENT ON COLUMN invoices.gst_type IS 'intra-state (CGST+SGST) or inter-state (IGST only)';
COMMENT ON COLUMN invoices.payment_terms IS 'Payment terms in days (30, 45, 60)';
COMMENT ON COLUMN invoices.billing_period_start IS 'Service invoice billing period start date';
