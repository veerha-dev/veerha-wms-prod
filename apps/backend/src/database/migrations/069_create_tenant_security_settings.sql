-- Migration: 069_create_tenant_security_settings
-- Description: Per-tenant security policy: password complexity rules, session timeout, 2FA mandate.
--              Surfaced on the Users → Settings tab per PDF §3.8 Settings Tab.

CREATE TABLE IF NOT EXISTS tenant_security_settings (
  tenant_id              UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,

  password_min_length    INTEGER NOT NULL DEFAULT 8,
  password_require_upper BOOLEAN NOT NULL DEFAULT true,
  password_require_lower BOOLEAN NOT NULL DEFAULT true,
  password_require_digit BOOLEAN NOT NULL DEFAULT true,
  password_require_special BOOLEAN NOT NULL DEFAULT true,
  password_expiry_days   INTEGER NOT NULL DEFAULT 0,    -- 0 = never

  session_timeout_minutes INTEGER NOT NULL DEFAULT 30,
  failed_login_lockout_count INTEGER NOT NULL DEFAULT 5,
  failed_login_lockout_minutes INTEGER NOT NULL DEFAULT 30,

  require_2fa_for_admins BOOLEAN NOT NULL DEFAULT false,
  require_2fa_for_all    BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE tenant_security_settings IS 'Per-tenant password policy, session timeout, 2FA mandates';

-- Seed defaults for existing tenants
INSERT INTO tenant_security_settings (tenant_id)
SELECT id FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;
