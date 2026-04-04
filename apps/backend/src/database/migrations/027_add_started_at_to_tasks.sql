-- Migration: 027_add_started_at_to_tasks.sql
-- Description: Add started_at column to tasks table for task lifecycle tracking
-- Date: 2026-03-28

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
