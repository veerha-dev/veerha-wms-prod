-- Migration: 061_create_report_tables
-- Description: Create tables for report configurations and execution history

CREATE TABLE IF NOT EXISTS report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  schedule TEXT DEFAULT 'on_demand',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_name TEXT,
  filters JSONB DEFAULT '{}',
  row_count INTEGER DEFAULT 0,
  export_format TEXT DEFAULT 'view',
  generated_by TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_configs_tenant ON report_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_history_tenant ON report_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created ON report_history(created_at DESC);
