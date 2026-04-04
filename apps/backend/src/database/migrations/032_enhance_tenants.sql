-- Migration: 032_enhance_tenants.sql
-- Description: Enhance tenants table with plan limits, billing, and module control for Super Admin
-- Date: 2026-03-29

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS admin_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_id UUID;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_warehouses INTEGER DEFAULT 1;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_skus INTEGER DEFAULT 100;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_managers INTEGER DEFAULT 1;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_workers INTEGER DEFAULT 3;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_daily_movements INTEGER DEFAULT 100;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS max_batches INTEGER DEFAULT 50;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS report_retention_days INTEGER DEFAULT 30;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS enabled_modules TEXT[];

-- Update default tenant with enterprise limits
UPDATE tenants SET
  company_name = 'Veerha Demo Company',
  max_warehouses = 999,
  max_skus = 99999,
  max_users = 999,
  max_managers = 99,
  max_workers = 999,
  max_daily_movements = 99999,
  max_batches = 9999,
  report_retention_days = 365,
  enabled_modules = ARRAY['Dashboard','Warehouses','Layout','Inventory','Purchase Orders','Suppliers','GRN','QC Inspections','Putaway','Sales Orders','Pick Lists','Packing','Shipments','Returns','Operations','Workflows','Invoices','Reports','Analytics','Users','Settings']
WHERE id = '00000000-0000-0000-0000-000000000001';
