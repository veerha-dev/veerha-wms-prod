// VEERHA WMS Workflow Types - Aligned with Prisma Database Schema

// Database enum types — must match Prisma schema exactly
export type TaskType = 'receiving' | 'putaway' | 'picking' | 'packing' | 'shipping' | 'cycle_count' | 'maintenance' | 'transfer' | 'other';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'exception';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// For backward compatibility with existing UI
export type WorkflowType = TaskType;
export type TaskStatusType = TaskStatus;
export type TaskPriorityType = TaskPriority;

// Status display mapping
export const STATUS_DISPLAY: Record<TaskStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  exception: 'Exception',
};

export const PRIORITY_DISPLAY: Record<TaskPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

// Actual database enum values for task_type
export const TYPE_DISPLAY: Record<TaskType, string> = {
  receiving: 'Receiving',
  putaway: 'Putaway',
  picking: 'Picking',
  packing: 'Packing',
  shipping: 'Shipping',
  cycle_count: 'Cycle Count',
  maintenance: 'Maintenance',
  transfer: 'Transfer',
  other: 'Other',
};

export type AutomationMode = 'manual' | 'auto' | 'semi-auto';

// Workflow Template UI type (matches database but with some UI additions)
export interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  type: TaskType;
  description: string | null;
  steps: WorkflowStep[];
  slaMinutes: number | null;
  defaultPriority: TaskPriority;
  autoAssign: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

// Dashboard Metrics
export interface WorkflowDashboardMetrics {
  totalActiveWorkflows: number;
  tasksByStatus: {
    created: number;
    assigned: number;
    inProgress: number;
    onHold: number;
    blocked: number;
    completed: number;
    cancelled: number;
  };
  tasksByRole: {
    admin: number;
    manager: number;
    worker: number;
    unassigned: number;
  };
  slaBreaches: number;
  exceptionsCount: number;
  completedToday: number;
  avgCompletionTime: number;
}

// Task Exception UI type
export interface TaskException {
  id: string;
  taskId: string;
  exceptionType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reportedAt: string;
  reportedBy: string;
  reporterName?: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolverName?: string;
  resolutionNotes: string | null;
}

// Workflow Audit Log UI type
export interface WorkflowAuditLog {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  actor: string;
  actorRole: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

// Helper function to map database task to UI-friendly format
export function mapTaskStatus(dbStatus: TaskStatus): string {
  return STATUS_DISPLAY[dbStatus] || dbStatus;
}

export function mapTaskPriority(dbPriority: TaskPriority): string {
  return PRIORITY_DISPLAY[dbPriority] || dbPriority;
}

export function mapTaskType(dbType: TaskType): string {
  return TYPE_DISPLAY[dbType] || dbType;
}
