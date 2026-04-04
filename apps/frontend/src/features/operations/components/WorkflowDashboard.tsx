import { cn } from '@/shared/lib/utils';
import {
  Workflow,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pause,
  Users,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { WorkflowDashboardMetrics } from '@/shared/types/workflow';

interface WorkflowDashboardProps {
  metrics: WorkflowDashboardMetrics;
}

export function WorkflowDashboard({ metrics }: WorkflowDashboardProps) {
  const statusCards = [
    { label: 'Created', value: metrics.tasksByStatus.created, color: 'bg-muted text-muted-foreground', icon: Clock },
    { label: 'Assigned', value: metrics.tasksByStatus.assigned, color: 'bg-info/10 text-info', icon: Users },
    { label: 'In Progress', value: metrics.tasksByStatus.inProgress, color: 'bg-warning/10 text-warning', icon: Play },
    { label: 'On Hold', value: metrics.tasksByStatus.onHold, color: 'bg-secondary text-secondary-foreground', icon: Pause },
    { label: 'Blocked', value: metrics.tasksByStatus.blocked, color: 'bg-destructive/10 text-destructive', icon: XCircle },
    { label: 'Completed', value: metrics.tasksByStatus.completed, color: 'bg-success/10 text-success', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Workflow className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalActiveWorkflows}</p>
              <p className="text-sm text-muted-foreground">Active Workflows</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.completedToday}</p>
              <p className="text-sm text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.slaBreaches}</p>
              <p className="text-sm text-muted-foreground">SLA Breaches</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.avgCompletionTime}m</p>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="wms-card p-4">
        <h3 className="font-semibold mb-4">Tasks by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusCards.map((status) => {
            const Icon = status.icon;
            return (
              <div
                key={status.label}
                className={cn(
                  'rounded-lg p-3 text-center transition-all hover:scale-105',
                  status.color
                )}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <p className="text-xl font-bold">{status.value}</p>
                <p className="text-xs opacity-80">{status.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks by Role & Exceptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="wms-card p-4">
          <h3 className="font-semibold mb-4">Tasks by Role</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Manager Tasks</span>
              <span className="font-semibold">{metrics.tasksByRole.manager}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Worker Tasks</span>
              <span className="font-semibold">{metrics.tasksByRole.worker}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <span className="text-sm text-warning">Unassigned</span>
              <span className="font-semibold text-warning">{metrics.tasksByRole.unassigned}</span>
            </div>
          </div>
        </div>

        <div className="wms-card p-4">
          <h3 className="font-semibold mb-4">Exceptions & Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Open Exceptions</span>
              </div>
              <span className="font-semibold text-destructive">{metrics.exceptionsCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">SLA At Risk</span>
              </div>
              <span className="font-semibold text-warning">{Math.floor(metrics.slaBreaches * 0.3)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-info" />
                <span className="text-sm">Pending Approvals</span>
              </div>
              <span className="font-semibold text-info">{Math.floor(metrics.tasksByStatus.created * 0.4)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
