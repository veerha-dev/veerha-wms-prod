-- Migration: 068_add_token_version_to_users
-- Description: Track a per-user token version so admins can force a logout by bumping it.
--              JWT strategy will reject any token whose payload tokenVersion < users.token_version.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN users.token_version IS
  'Incremented on force-logout or password change. JWT payload carries the version at issue time.';
