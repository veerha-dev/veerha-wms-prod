-- Migration: 048_create_stock_transfers
-- Description: Create stock_transfers table for inter/intra warehouse transfers
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  transfer_number TEXT NOT NULL,
  transfer_type TEXT NOT NULL DEFAULT 'intra-warehouse',

  source_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  source_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  source_rack_id UUID REFERENCES racks(id) ON DELETE SET NULL,
  source_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,

  dest_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  dest_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  dest_rack_id UUID REFERENCES racks(id) ON DELETE SET NULL,
  dest_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,

  sku_id UUID REFERENCES skus(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'requested',

  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tenant_id, transfer_number)
);

CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON stock_transfers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON stock_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_src_wh ON stock_transfers(source_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_dest_wh ON stock_transfers(dest_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfers_sku ON stock_transfers(sku_id);

COMMENT ON TABLE stock_transfers IS 'Inter and intra warehouse stock transfers';
COMMENT ON COLUMN stock_transfers.transfer_type IS 'inter-warehouse or intra-warehouse';
COMMENT ON COLUMN stock_transfers.status IS 'requested, approved, in_transit, completed, cancelled';
COMMENT ON COLUMN stock_transfers.reason IS 'Rebalancing, Replenishment, Damaged Relocation, Customer Order, Other';
