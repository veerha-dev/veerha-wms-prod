-- Migration: 033_create_plans.sql
-- Description: Create plans table for subscription tiers
-- Date: 2026-03-29

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) DEFAULT 0,
  yearly_price NUMERIC(10,2) DEFAULT 0,
  max_warehouses INTEGER DEFAULT 1,
  max_skus INTEGER DEFAULT 100,
  max_users INTEGER DEFAULT 5,
  max_managers INTEGER DEFAULT 1,
  max_workers INTEGER DEFAULT 3,
  max_daily_movements INTEGER DEFAULT 100,
  max_batches INTEGER DEFAULT 50,
  report_retention_days INTEGER DEFAULT 30,
  enabled_modules TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default plans
INSERT INTO plans (name, code, description, monthly_price, yearly_price, max_warehouses, max_skus, max_users, max_managers, max_workers, max_daily_movements, max_batches, report_retention_days, enabled_modules, sort_order)
VALUES
  ('Starter', 'starter', 'For small warehouses getting started', 2999, 29990, 1, 100, 5, 1, 3, 100, 50, 30,
   ARRAY['Dashboard','Warehouses','Layout','Inventory','Purchase Orders','Suppliers','GRN','Sales Orders','Operations','Users','Settings'], 1),

  ('Professional', 'professional', 'For growing businesses with multiple warehouses', 9999, 99990, 5, 1000, 25, 5, 15, 1000, 500, 90,
   ARRAY['Dashboard','Warehouses','Layout','Inventory','Purchase Orders','Suppliers','GRN','QC Inspections','Putaway','Sales Orders','Pick Lists','Packing','Shipments','Returns','Operations','Workflows','Invoices','Reports','Users','Settings'], 2),

  ('Enterprise', 'enterprise', 'For large operations with unlimited scale', 24999, 249990, 999, 50000, 100, 20, 50, 10000, 5000, 365,
   ARRAY['Dashboard','Warehouses','Layout','Inventory','Purchase Orders','Suppliers','GRN','QC Inspections','Putaway','Sales Orders','Pick Lists','Packing','Shipments','Returns','Operations','Workflows','Invoices','Reports','Analytics','Users','Settings'], 3)
ON CONFLICT (code) DO NOTHING;
