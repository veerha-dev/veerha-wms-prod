-- Migration: 029_add_returns_fields.sql
-- Description: Add condition, decision, quantity, total_refund to returns table
-- Date: 2026-03-28

ALTER TABLE returns ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good';
ALTER TABLE returns ADD COLUMN IF NOT EXISTS decision TEXT DEFAULT 'pending';
ALTER TABLE returns ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS total_refund NUMERIC(12,2) DEFAULT 0;
