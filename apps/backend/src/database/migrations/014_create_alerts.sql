-- Migration: 014_create_alerts.sql
-- Description: Create inventory alerts table
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  sku_code TEXT,
  sku_name TEXT,
  
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  warehouse_name TEXT,
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  zone_name TEXT,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  
  message TEXT NOT NULL,
  threshold_value INTEGER,
  current_value INTEGER,
  
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP,
  
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_tenant_id ON inventory_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type ON inventory_alerts(type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_severity ON inventory_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_sku_id ON inventory_alerts(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_warehouse_id ON inventory_alerts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_acknowledged ON inventory_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_created_at ON inventory_alerts(created_at);
