-- Migration: 030_create_role_permissions.sql
-- Description: Create role_permissions table for module-level access control
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, role, module, action)
);

CREATE INDEX IF NOT EXISTS idx_rp_tenant_role ON role_permissions(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_rp_module ON role_permissions(module);

-- Seed default permissions for admin (all access)
INSERT INTO role_permissions (tenant_id, role, module, action, allowed)
SELECT '00000000-0000-0000-0000-000000000001', 'admin', m, a, true
FROM (VALUES ('Dashboard'),('Warehouses'),('Layout'),('Inventory'),('Purchase Orders'),('Suppliers'),('GRN'),('QC Inspections'),('Sales Orders'),('Pick Lists'),('Packing'),('Shipments'),('Returns'),('Operations'),('Workflows'),('Invoices'),('Reports'),('Analytics'),('Users'),('Settings')) AS modules(m),
     (VALUES ('view'),('create'),('edit'),('delete'),('manage')) AS actions(a)
ON CONFLICT DO NOTHING;

-- Seed default permissions for manager (most access, no user management)
INSERT INTO role_permissions (tenant_id, role, module, action, allowed)
SELECT '00000000-0000-0000-0000-000000000001', 'manager', m, a,
  CASE
    WHEN m IN ('Users','Settings') AND a IN ('delete','manage') THEN false
    WHEN m IN ('Users') AND a IN ('create') THEN false
    ELSE true
  END
FROM (VALUES ('Dashboard'),('Warehouses'),('Layout'),('Inventory'),('Purchase Orders'),('Suppliers'),('GRN'),('QC Inspections'),('Sales Orders'),('Pick Lists'),('Packing'),('Shipments'),('Returns'),('Operations'),('Workflows'),('Invoices'),('Reports'),('Analytics'),('Users'),('Settings')) AS modules(m),
     (VALUES ('view'),('create'),('edit'),('delete'),('manage')) AS actions(a)
ON CONFLICT DO NOTHING;

-- Seed default permissions for worker (limited access)
INSERT INTO role_permissions (tenant_id, role, module, action, allowed)
SELECT '00000000-0000-0000-0000-000000000001', 'worker', m, a,
  CASE
    WHEN a = 'view' AND m IN ('Dashboard','Inventory','Operations','Pick Lists','Packing') THEN true
    WHEN a = 'create' AND m IN ('Operations') THEN true
    WHEN a = 'edit' AND m IN ('Operations','Pick Lists','Packing') THEN true
    ELSE false
  END
FROM (VALUES ('Dashboard'),('Warehouses'),('Layout'),('Inventory'),('Purchase Orders'),('Suppliers'),('GRN'),('QC Inspections'),('Sales Orders'),('Pick Lists'),('Packing'),('Shipments'),('Returns'),('Operations'),('Workflows'),('Invoices'),('Reports'),('Analytics'),('Users'),('Settings')) AS modules(m),
     (VALUES ('view'),('create'),('edit'),('delete'),('manage')) AS actions(a)
ON CONFLICT DO NOTHING;
