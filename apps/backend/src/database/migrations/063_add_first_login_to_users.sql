-- Adds fields used by the forced-password-change-on-first-login flow.
-- When an Admin invites a Manager/Worker (or Super Admin creates a tenant Admin),
-- a temporary password is generated and must_change_password is set to true.
-- The user is forced to change their password on first login.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Existing users do not need to change passwords
UPDATE users SET must_change_password = false WHERE must_change_password IS NULL;
