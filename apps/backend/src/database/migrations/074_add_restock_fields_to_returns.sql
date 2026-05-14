-- Migration: 074_add_restock_fields_to_returns
-- Description: Track which bin a returned item was restocked into, and who processed the disposition.
--              Per PDF §3.4 Returns Restock disposition.

ALTER TABLE returns
  ADD COLUMN IF NOT EXISTS restock_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN returns.restock_bin_id IS
  'Destination bin chosen when disposition = restock. NULL for refurbish/scrap.';
COMMENT ON COLUMN returns.processed_by IS
  'User who processed the disposition. NULL until disposition is applied.';

CREATE INDEX IF NOT EXISTS idx_returns_restock_bin ON returns(restock_bin_id);
