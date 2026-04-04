-- Migration: 035_create_usage_metrics.sql
-- Description: Create tenant usage metrics table for tracking consumption vs limits
-- Date: 2026-03-29

CREATE TABLE IF NOT EXISTS tenant_usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sku_count INTEGER DEFAULT 0,
  warehouse_count INTEGER DEFAULT 0,
  user_count INTEGER DEFAULT 0,
  manager_count INTEGER DEFAULT 0,
  worker_count INTEGER DEFAULT 0,
  daily_movements INTEGER DEFAULT 0,
  batch_count INTEGER DEFAULT 0,
  stock_level_count INTEGER DEFAULT 0,
  po_count INTEGER DEFAULT 0,
  so_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_date ON tenant_usage_metrics(tenant_id, metric_date);
