import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Pause, ArrowUpRight, ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { useTasks } from '@/features/operations/hooks/useTasks';
import { Link } from 'react-router-dom';

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

export function TasksWidget() {
  const { data: tasks = [] } = useTasks();

  // Get only active tasks (not completed or cancelled)
  const activeTasks = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  const displayTasks = activeTasks.slice(0, 4);

  const totalTasks = activeTasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;

  const hasTasks = tasks.length > 0;

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Active Tasks</h2>
            <p className="text-sm text-muted-foreground">Today's operations</p>
          </div>
          {hasTasks && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/workflows">View All</Link>
            </Button>
          )}
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-info/5">
            <p className="text-2xl font-bold text-info">{inProgressTasks}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5">
            <p className="text-2xl font-bold text-success">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      {!hasTasks ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Create workflow tasks to track operations and assignments
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/workflows">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Link>
          </Button>
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No active tasks at the moment
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayTasks.map((task) => {
            const config = statusConfig[task.status] || statusConfig.created;
            const StatusIcon = config.icon;
            const progress = task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0;
            
            return (
              <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-md flex items-center justify-center',
                        config.bg
                      )}
                    >
                      <StatusIcon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.task_number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{task.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border capitalize',
                      priorityConfig[task.priority] || priorityConfig.medium
                    )}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex-1 mr-4">
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {progress}%
                    </span>
                    {task.due_at && (
                      <span className="text-xs text-muted-foreground">
                        Due {new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
