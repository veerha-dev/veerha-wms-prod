-- Migration: 031_create_putaway_tasks.sql
-- Description: Create putaway_tasks table for tracking goods placement into storage bins
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS putaway_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  putaway_number TEXT UNIQUE NOT NULL,

  grn_id UUID REFERENCES grn(id),
  grn_item_id UUID REFERENCES grn_items(id),

  sku_id UUID NOT NULL REFERENCES skus(id),
  batch_id UUID REFERENCES batches(id),

  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_putaway INTEGER DEFAULT 0,

  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  source_zone_id UUID REFERENCES zones(id),
  source_bin_id UUID REFERENCES bins(id),

  destination_zone_id UUID REFERENCES zones(id),
  destination_bin_id UUID REFERENCES bins(id),
  suggested_bin_id UUID REFERENCES bins(id),

  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',

  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_putaway_tenant ON putaway_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_putaway_status ON putaway_tasks(status);
CREATE INDEX IF NOT EXISTS idx_putaway_grn ON putaway_tasks(grn_id);
CREATE INDEX IF NOT EXISTS idx_putaway_sku ON putaway_tasks(sku_id);
CREATE INDEX IF NOT EXISTS idx_putaway_warehouse ON putaway_tasks(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_putaway_assigned ON putaway_tasks(assigned_to);

-- Add Putaway permissions for all roles
INSERT INTO role_permissions (tenant_id, role, module, action, allowed)
SELECT '00000000-0000-0000-0000-000000000001', r, 'Putaway', a,
  CASE
    WHEN r = 'admin' THEN true
    WHEN r = 'manager' THEN true
    WHEN r = 'worker' AND a IN ('view', 'edit') THEN true
    ELSE false
  END
FROM (VALUES ('admin'), ('manager'), ('worker')) AS roles(r),
     (VALUES ('view'), ('create'), ('edit'), ('delete'), ('manage')) AS actions(a)
ON CONFLICT DO NOTHING;
