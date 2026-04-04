-- Migration: 015_add_password_hash_to_users.sql
-- Description: Add password_hash column to users table for authentication
-- Date: 2026-03-28

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
