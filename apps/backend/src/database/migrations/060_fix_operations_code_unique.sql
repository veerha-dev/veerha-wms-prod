-- Migration: 060_fix_operations_code_unique
-- Description: Fix global unique constraints on returns, tasks, invoices for multi-tenancy

DROP INDEX IF EXISTS idx_return_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_returns_tenant_number ON returns(tenant_id, return_number);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_task_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_tenant_number ON tasks(tenant_id, task_number);

DROP INDEX IF EXISTS idx_invoice_number;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_tenant_number ON invoices(tenant_id, invoice_number);
