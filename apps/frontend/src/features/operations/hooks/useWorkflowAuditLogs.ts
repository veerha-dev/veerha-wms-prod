// STUB: Returns empty data until workflow audit log API endpoints are created on the backend.
// Connect to GET /api/v1/workflow-audit-logs when available.
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';

export type WorkflowAuditLogWithDetails = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userEmail?: string;
  changes?: Record<string, any>;
  createdAt: string;
};

export function useWorkflowAuditLogs(_params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({ queryKey: ['workflow-audit-logs', _params], queryFn: async () => [] as WorkflowAuditLogWithDetails[], enabled: isAuthenticated });
}

export function useAuditLogsByEntity(_entityType: string, _entityId: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['audit-logs', _entityType, _entityId],
    queryFn: async () => [] as WorkflowAuditLogWithDetails[],
    enabled: isAuthenticated && !!_entityId,
  });
}

export function formatAuditAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function exportAuditLogsToCSV(logs: WorkflowAuditLogWithDetails[]): string {
  const headers = ['ID', 'Entity Type', 'Entity ID', 'Action', 'User', 'Date'];
  const rows = logs.map((l) => [
    l.id, l.entityType, l.entityId,
    formatAuditAction(l.action),
    l.userEmail || l.userId,
    new Date(l.createdAt).toLocaleString(),
  ]);
  return [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
}
