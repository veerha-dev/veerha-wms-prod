-- Migration: 043_create_serial_numbers
-- Description: Create serial_numbers table for individual unit tracking
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS serial_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'in_stock',

  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,

  grn_id UUID REFERENCES grn(id) ON DELETE SET NULL,
  grn_item_id UUID,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  so_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  pick_list_id UUID REFERENCES pick_lists(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  received_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_serial_tenant ON serial_numbers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_serial_sku ON serial_numbers(sku_id);
CREATE INDEX IF NOT EXISTS idx_serial_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_warehouse ON serial_numbers(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_serial_bin ON serial_numbers(bin_id);
CREATE INDEX IF NOT EXISTS idx_serial_grn ON serial_numbers(grn_id);
CREATE INDEX IF NOT EXISTS idx_serial_so ON serial_numbers(so_id);
CREATE INDEX IF NOT EXISTS idx_serial_number ON serial_numbers(serial_number);

COMMENT ON TABLE serial_numbers IS 'Individual serial number registry for serial-tracked SKUs';
COMMENT ON COLUMN serial_numbers.status IS 'in_stock, picked, packed, shipped, delivered, returned, damaged';
