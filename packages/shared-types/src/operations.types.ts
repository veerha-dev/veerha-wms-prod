// Operations domain types: tasks, workflows, adjustments

import { TenantScopedEntity, BaseEntity } from './common.types';

// --- Enums ---

export type TaskType =
  | 'receiving'
  | 'putaway'
  | 'picking'
  | 'packing'
  | 'shipping'
  | 'cycle_count'
  | 'maintenance'
  | 'transfer'
  | 'other';

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'exception';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// --- Entities ---

export interface Task extends TenantScopedEntity {
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  warehouseId?: string;
  warehouseName?: string;
  referenceType?: string;
  referenceId?: string;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdBy?: string;
  createdByName?: string;
}

export interface WorkflowTemplate extends TenantScopedEntity {
  name: string;
  code: string;
  type: TaskType;
  description?: string;
  steps: WorkflowStep[];
  slaMinutes?: number;
  defaultPriority: TaskPriority;
  autoAssign: boolean;
  isActive: boolean;
}

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  description?: string;
  requiredInputs?: string[];
  validations?: string[];
  autoExecute?: boolean;
}

export interface TaskException {
  id: string;
  taskId: string;
  exceptionType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reportedAt: string;
  reportedBy: string;
  reporterName?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolverName?: string;
  resolutionNotes?: string;
}

// --- Dashboard ---

export interface WorkflowDashboardMetrics {
  totalActiveWorkflows: number;
  tasksByStatus: Record<TaskStatus, number>;
  slaBreaches: number;
  exceptionsCount: number;
  completedToday: number;
  avgCompletionTime: number;
}

// --- Audit ---

export interface AuditLogEntry {
  id: string;
  tenantId?: string;
  entityType: string;
  entityId?: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  tenantId?: string;
  userId?: string;
  action: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
