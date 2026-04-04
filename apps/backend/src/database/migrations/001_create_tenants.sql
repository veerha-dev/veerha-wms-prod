-- Migration: 001_create_tenants
-- Description: Create tenants table for multi-tenancy support
-- Created: 2026-03-13

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on slug for lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Insert default tenant for development
INSERT INTO tenants (id, name, slug, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Tenant',
  'default',
  'active'
) ON CONFLICT (slug) DO NOTHING;
