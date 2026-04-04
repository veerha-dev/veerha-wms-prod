-- Migration: 062_create_user_preferences
-- Description: Per-user preference storage for general, notification, appearance and session settings
-- Created: 2026-04-04

CREATE TABLE IF NOT EXISTS user_preferences (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Tab 1: General
  system_name                TEXT    DEFAULT 'VEERHA WMS',
  language                   TEXT    DEFAULT 'en',
  timezone                   TEXT    DEFAULT 'Asia/Kolkata',
  date_format                TEXT    DEFAULT 'dmy',
  auto_refresh               BOOLEAN DEFAULT true,
  compact_view               BOOLEAN DEFAULT false,
  refresh_interval_seconds   INTEGER DEFAULT 60,

  -- Tab 3: Notifications
  notif_email_low_stock      BOOLEAN DEFAULT true,
  notif_email_task_exception BOOLEAN DEFAULT true,
  notif_email_daily_summary  BOOLEAN DEFAULT true,
  notif_email_user_activity  BOOLEAN DEFAULT false,
  notif_email_system_updates BOOLEAN DEFAULT true,
  notif_inapp_realtime       BOOLEAN DEFAULT true,
  notif_inapp_sound          BOOLEAN DEFAULT false,

  -- Tab 4: Security
  session_timeout_minutes    INTEGER DEFAULT 480,

  -- Tab 6: Appearance
  theme                      TEXT    DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  primary_color              TEXT    DEFAULT '#2B9E8C',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT uq_user_preferences_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user   ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_tenant ON user_preferences(tenant_id);

COMMENT ON TABLE user_preferences IS 'One row per user. Auto-created with defaults on first read via ON CONFLICT upsert.';
