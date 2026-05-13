-- Migration: 065_invoice_auto_source
-- Description: Track where auto-generated invoices came from (grn_complete, shipment_dispatch, manual)
--              and enforce idempotency so a GRN/Shipment can never produce duplicate auto-invoices.

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS source_event TEXT;

COMMENT ON COLUMN invoices.source_event IS
  'How the invoice was created: manual | grn_complete | shipment_dispatch | service_billing';

-- Idempotency: at most one purchase invoice per GRN
CREATE UNIQUE INDEX IF NOT EXISTS uniq_invoice_purchase_per_grn
  ON invoices (grn_id)
  WHERE type = 'purchase' AND grn_id IS NOT NULL;

-- Idempotency: at most one sales invoice per shipment
CREATE UNIQUE INDEX IF NOT EXISTS uniq_invoice_sales_per_shipment
  ON invoices (shipment_id)
  WHERE type = 'sales' AND shipment_id IS NOT NULL;
