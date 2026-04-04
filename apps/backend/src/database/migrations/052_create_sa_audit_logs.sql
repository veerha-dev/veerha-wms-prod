-- Migration: 052_create_sa_audit_logs
-- Description: Create super admin audit logs table
-- Created: 2026-04-01

CREATE TABLE IF NOT EXISTS sa_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_audit_admin ON sa_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_sa_audit_action ON sa_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_sa_audit_created ON sa_audit_logs(created_at DESC);

COMMENT ON TABLE sa_audit_logs IS 'Immutable audit trail of all super admin actions';
