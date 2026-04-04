import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  History,
  User,
  Workflow,
  ClipboardList,
  UserPlus,
  AlertTriangle,
  Search,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useWorkflowAuditLogs, formatAuditAction, exportAuditLogsToCSV, WorkflowAuditLogWithDetails } from '@/features/operations/hooks/useWorkflowAuditLogs';

const entityTypeConfig: Record<string, { icon: any; color: string }> = {
  workflow: { icon: Workflow, color: 'bg-accent/10 text-accent' },
  task: { icon: ClipboardList, color: 'bg-info/10 text-info' },
  assignment: { icon: UserPlus, color: 'bg-success/10 text-success' },
  exception: { icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
  workflow_template: { icon: Workflow, color: 'bg-accent/10 text-accent' },
};

export function WorkflowAuditLog() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: logs, isLoading } = useWorkflowAuditLogs({
    entityType: entityFilter !== 'all' ? entityFilter : undefined,
    search: search || undefined,
  });

  const handleExport = () => {
    if (!logs || logs.length === 0) return;
    const csv = exportAuditLogsToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="workflow_template">Workflow</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="exception">Exception</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!logs?.length}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Log List */}
      <div className="wms-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Audit Trail</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {logs?.length || 0} records
          </span>
        </div>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">Activity will appear here as tasks are created and modified</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const entityConfig = entityTypeConfig[log.entity_type] || entityTypeConfig.task;
                const EntityIcon = entityConfig.icon;

                return (
                  <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', entityConfig.color)}>
                        <EntityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{formatAuditAction(log.action)}</p>
                          <Badge variant="outline" className="text-xs capitalize">{log.entity_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{log.user?.full_name || log.user?.email || 'System'}</span>
                          {log.entity_id && (
                            <>
                              <span>•</span>
                              <span>ID: {log.entity_id.slice(0, 8)}...</span>
                            </>
                          )}
                        </div>
                        {log.reason && (
                          <p className="mt-1 text-sm text-muted-foreground italic">"{log.reason}"</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{format(new Date(log.created_at), 'HH:mm')}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
