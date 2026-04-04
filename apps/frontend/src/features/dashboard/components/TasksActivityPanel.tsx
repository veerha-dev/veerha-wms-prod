import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Pause, ArrowUpRight, ClipboardList, Plus, Package, ArrowRight, RotateCcw, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { useTasks } from '@/features/operations/hooks/useTasks';
import { useMovements } from '@/features/inventory/hooks/useMovements';
import { useAlerts } from '@/features/operations/hooks/useAlerts';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  created: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  assigned: { icon: Clock, color: 'text-info', bg: 'bg-info/10' },
  in_progress: { icon: ArrowUpRight, color: 'text-info', bg: 'bg-info/10' },
  on_hold: { icon: Pause, color: 'text-warning', bg: 'bg-warning/10' },
  blocked: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  cancelled: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
};

const priorityConfig: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info border-info/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
};

const iconMap: Record<string, typeof Package> = {
  stock_in: Package, stock_out: Package, transfer: ArrowRight,
  return: RotateCcw, adjustment: Package, damage: AlertTriangle,
  putaway: Package, pick: Package, alert: AlertTriangle, completed: CheckCircle2,
};

const colorMap: Record<string, string> = {
  stock_in: 'bg-success/10 text-success', stock_out: 'bg-info/10 text-info',
  transfer: 'bg-accent/10 text-accent', return: 'bg-warning/10 text-warning',
  adjustment: 'bg-muted text-muted-foreground', damage: 'bg-destructive/10 text-destructive',
  putaway: 'bg-success/10 text-success', pick: 'bg-info/10 text-info',
  alert: 'bg-destructive/10 text-destructive',
};

function getMovementTitle(type: string): string {
  const titles: Record<string, string> = {
    stock_in: 'Stock Received', stock_out: 'Stock Shipped', transfer: 'Zone Transfer',
    return: 'Return Processed', adjustment: 'Stock Adjusted', damage: 'Damage Reported',
    putaway: 'Putaway Complete', pick: 'Picking Complete',
  };
  return titles[type] || 'Inventory Movement';
}

function getAlertTitle(type: string): string {
  const titles: Record<string, string> = {
    low_stock: 'Low Stock Warning', overstock: 'Overstock Alert',
    expiry_warning: 'Expiry Warning', expiry_critical: 'Critical Expiry', damage_reported: 'Damage Alert',
  };
  return titles[type] || 'Alert';
}

export function TasksActivityPanel() {
  const [tab, setTab] = useState<'tasks' | 'activity'>('tasks');
  const { data: tasks = [] } = useTasks();
  const { data: movements = [] } = useMovements();
  const { data: alerts = [] } = useAlerts();

  const safeTasksArray = Array.isArray(tasks) ? tasks : [];
  const safeMovementsArray = Array.isArray(movements) ? movements : [];
  const safeAlertsArray = Array.isArray(alerts) ? alerts : [];

  const activeTasks = safeTasksArray.filter(t => !['completed', 'cancelled'].includes(t.status));
  const displayTasks = activeTasks.slice(0, 5);
  const completedTasks = safeTasksArray.filter(t => t.status === 'completed').length;
  const inProgressTasks = safeTasksArray.filter(t => t.status === 'in_progress').length;

  const activities = [
    ...safeMovementsArray.slice(0, 10).map(m => ({
      id: m.id, type: m.type || m.movementType || m.movement_type,
      title: getMovementTitle(m.type || m.movementType || m.movement_type),
      description: `${m.quantity} units · ${m.movementNumber || m.movement_number || ''}`,
      time: m.performed_at || m.createdAt || m.created_at || new Date().toISOString(),
    })),
    ...safeAlertsArray.filter(a => !a.is_acknowledged && !a.isAcknowledged).slice(0, 5).map(a => ({
      id: a.id, type: 'alert' as const,
      title: getAlertTitle(a.type),
      description: a.message,
      time: a.created_at || a.createdAt || new Date().toISOString(),
    })),
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 6);

  return (
    <div className="wms-card h-full flex flex-col">
      {/* Header with tabs */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Operations</h2>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTab('tasks')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                tab === 'tasks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tasks
              {activeTasks.length > 0 && (
                <span className="ml-1.5 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('activity')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                tab === 'activity' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Activity
              {activities.length > 0 && (
                <span className="ml-1.5 bg-muted-foreground/20 text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activities.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mini stats */}
        {tab === 'tasks' && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">{activeTasks.length}</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-info/5">
              <p className="text-lg font-bold text-info">{inProgressTasks}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-success/5">
              <p className="text-lg font-bold text-success">{completedTasks}</p>
              <p className="text-[10px] text-muted-foreground">Done</p>
            </div>
          </div>
        )}
        {tab === 'activity' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>Live · {activities.length} recent events</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'tasks' ? (
          displayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No active tasks</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Create tasks to track operations</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/workflows"><Plus className="h-3 w-3 mr-1" />Create Task</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayTasks.map((task) => {
                const config = statusConfig[task.status] || statusConfig.created;
                const StatusIcon = config.icon;
                const progress = task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0;
                return (
                  <div key={task.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0', config.bg)}>
                          <StatusIcon className={cn('h-3.5 w-3.5', config.color)} />
                        </div>
                        <div>
                          <p className="font-medium text-xs">{task.task_number}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{task.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full border capitalize', priorityConfig[task.priority] || priorityConfig.medium)}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-9">
                      <Progress value={progress} className="h-1 flex-1" />
                      <span className="text-[10px] text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                );
              })}
              <div className="p-3">
                <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                  <Link to="/workflows">View all tasks →</Link>
                </Button>
              </div>
            </div>
          )
        ) : (
          activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">Operations will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((activity) => {
                const Icon = iconMap[activity.type] || Package;
                return (
                  <div key={activity.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[activity.type] || 'bg-muted text-muted-foreground')}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-xs text-foreground truncate">{activity.title}</p>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {activity.time ? formatDistanceToNow(new Date(activity.time), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="p-3">
                <Link to="/inventory" className="w-full block text-center text-xs text-accent hover:text-accent/80 font-medium">
                  View all activity →
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
