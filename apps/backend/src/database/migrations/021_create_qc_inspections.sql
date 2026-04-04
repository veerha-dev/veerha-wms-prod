-- Migration: 021_create_qc_inspections.sql
-- Description: Create QC inspections table
-- Date: 2026-03-28

CREATE TABLE IF NOT EXISTS qc_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  qc_number TEXT NOT NULL,
  grn_id UUID REFERENCES grn(id),
  sku_id UUID REFERENCES skus(id),
  batch_number TEXT,
  status TEXT DEFAULT 'pending',
  result TEXT,
  inspector UUID REFERENCES users(id),
  quantity_inspected INTEGER DEFAULT 0,
  quantity_passed INTEGER DEFAULT 0,
  quantity_failed INTEGER DEFAULT 0,
  defect_count INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_number ON qc_inspections(qc_number);
CREATE INDEX IF NOT EXISTS idx_qc_tenant_id ON qc_inspections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qc_grn_id ON qc_inspections(grn_id);
CREATE INDEX IF NOT EXISTS idx_qc_status ON qc_inspections(status);
