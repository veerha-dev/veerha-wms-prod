-- Migration: 036_add_super_admin.sql
-- Description: Add super admin flag and create default super admin user
-- Date: 2026-03-29

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
