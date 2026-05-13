-- Migration: 064_add_onboarding_to_tenants
-- Description: Track admin first-time onboarding completion so the wizard
--              shows only on first login and is skipped on subsequent logins.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP NULL;

COMMENT ON COLUMN tenants.onboarding_completed_at IS
  'Set when admin finishes (or skips) the 5-step onboarding wizard. NULL means wizard still pending.';
