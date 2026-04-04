-- Migration: 049_add_picking_strategies
-- Description: Add strategy, priority, batch_size to pick_lists and so_id to pick_list_items
-- Created: 2026-04-01

-- Pick list strategy columns
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS strategy TEXT DEFAULT 'single';
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS batch_size INTEGER;
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS wave_id UUID;
ALTER TABLE pick_lists ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_pl_strategy ON pick_lists(strategy);
CREATE INDEX IF NOT EXISTS idx_pl_priority ON pick_lists(priority);

-- Pick list items order traceability (critical for batch picking)
ALTER TABLE pick_list_items ADD COLUMN IF NOT EXISTS so_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pli_so_id ON pick_list_items(so_id);

COMMENT ON COLUMN pick_lists.strategy IS 'single, batch, wave';
COMMENT ON COLUMN pick_list_items.so_id IS 'Sales order this item belongs to (for batch picking traceability)';
