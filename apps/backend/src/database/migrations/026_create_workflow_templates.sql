-- Migration: 026_create_workflow_templates.sql
-- Description: Create workflow templates table
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wft_tenant_id ON workflow_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wft_trigger_type ON workflow_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_wft_is_active ON workflow_templates(is_active);
