-- Migration: 007_create_batches.sql
-- Description: Create Batches table for batch/expiry tracking
-- Date: 2026-03-14

CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,

  batch_number TEXT NOT NULL,
  manufacture_date DATE,
  expiry_date DATE,
  supplier_reference TEXT,

  quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  fifo_rank INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (tenant_id, sku_id, batch_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_batches_tenant ON batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_batches_sku ON batches(sku_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_expiry ON batches(expiry_date);

COMMENT ON TABLE batches IS 'Batch tracking for SKUs with expiry/manufacture dates';
