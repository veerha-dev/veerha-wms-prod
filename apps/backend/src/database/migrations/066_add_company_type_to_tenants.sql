-- Migration: 066_add_company_type_to_tenants
-- Description: Track tenant business type so Service Invoice (3PL) UI can be conditionally enabled.
--              Values per PDF workflow: 3PL, Distributor, Retailer, Manufacturer, Cold Storage, E-commerce, Other.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS company_type TEXT;

COMMENT ON COLUMN tenants.company_type IS
  'Tenant business type — drives feature gating (Service Invoice is 3PL-only).';

CREATE INDEX IF NOT EXISTS idx_tenants_company_type ON tenants(company_type);
