-- Migration: 073_add_cycle_count_recurrence
-- Description: Per PDF §3.5 Cycle Count — add recurrence fields so a count can repeat daily, weekly,
--              or monthly until an optional end date. A background job clones the next instance when
--              the current one completes.

ALTER TABLE cycle_counts
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT NOT NULL DEFAULT 'one_time',
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS recurrence_until DATE,
  ADD COLUMN IF NOT EXISTS parent_count_id UUID REFERENCES cycle_counts(id) ON DELETE SET NULL;

COMMENT ON COLUMN cycle_counts.recurrence_type IS
  'one_time | daily | weekly | monthly. one_time = no clone on completion.';
COMMENT ON COLUMN cycle_counts.recurrence_interval IS
  'Repeat every N units of the recurrence_type. e.g. weekly + interval=2 → every other week.';
COMMENT ON COLUMN cycle_counts.recurrence_until IS
  'Stop creating new instances after this date (inclusive). NULL = no end.';
COMMENT ON COLUMN cycle_counts.parent_count_id IS
  'Link clones back to the original count so the recurrence chain is traceable.';

CREATE INDEX IF NOT EXISTS idx_cycle_counts_parent ON cycle_counts(parent_count_id);
CREATE INDEX IF NOT EXISTS idx_cycle_counts_recurrence ON cycle_counts(recurrence_type) WHERE recurrence_type != 'one_time';
