-- Migration: 067_create_audit_logs
-- Description: Tenant-level system audit log. Every mutation captured by AuditInterceptor lands here.
--              Different from stock_movements (which is inventory-specific) — this covers all CRUD
--              across the system: SKU edits, user changes, settings updates, approvals, etc.

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email    TEXT,
  user_name     TEXT,
  user_role     TEXT,
  module        TEXT NOT NULL,           -- 'sku', 'warehouse', 'user', 'adjustment', ...
  action        TEXT NOT NULL,           -- 'create', 'update', 'delete', 'approve', 'reject', ...
  entity_type   TEXT,                    -- e.g. 'sku', 'po', 'invoice'
  entity_id     TEXT,
  http_method   TEXT,
  http_path     TEXT,
  status_code   INTEGER,
  request_body  JSONB,
  response_body JSONB,
  before        JSONB,
  after         JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  duration_ms   INTEGER,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'System-wide activity log captured by the AuditInterceptor';
