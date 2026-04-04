import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  XCircle,
  Package,
  Lock,
  Gauge,
  Tag,
  User,
  CheckCircle2,
  Eye,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useOpenTaskExceptions, useResolveTaskException, useExceptionStats, TaskExceptionWithDetails } from '@/features/operations/hooks/useTaskExceptions';
import { useSLABreachedTasks } from '@/features/operations/hooks/useWorkflowMetrics';
import { TaskWithDetails } from '@/features/operations/hooks/useEnhancedTasks';
import { useState } from 'react';

interface ExceptionsPanelProps {
  onViewTask: (task: TaskWithDetails) => void;
}

const exceptionTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  inventory_not_found: { label: 'Inventory Not Found', icon: Package, color: 'text-destructive' },
  bin_locked: { label: 'Bin Locked', icon: Lock, color: 'text-warning' },
  capacity_exceeded: { label: 'Capacity Exceeded', icon: Gauge, color: 'text-destructive' },
  sku_mismatch: { label: 'SKU Mismatch', icon: Tag, color: 'text-warning' },
  worker_unavailable: { label: 'Worker Unavailable', icon: User, color: 'text-info' },
  task_blocked: { label: 'Task Blocked', icon: XCircle, color: 'text-destructive' },
  other: { label: 'Other', icon: AlertTriangle, color: 'text-muted-foreground' },
};

export function ExceptionsPanel({ onViewTask }: ExceptionsPanelProps) {
  const { data: exceptions, isLoading: exceptionsLoading } = useOpenTaskExceptions();
  const { data: slaBreachedTasks, isLoading: slaLoading } = useSLABreachedTasks();
  const { data: stats } = useExceptionStats();
  const resolveException = useResolveTaskException();

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = () => {
    if (selectedExceptionId && resolutionNotes) {
      resolveException.mutate(
        { id: selectedExceptionId, resolution_notes: resolutionNotes },
        {
          onSuccess: () => {
            setResolveDialogOpen(false);
            setSelectedExceptionId(null);
            setResolutionNotes('');
          },
        }
      );
    }
  };

  const openResolveDialog = (exceptionId: string) => {
    setSelectedExceptionId(exceptionId);
    setResolveDialogOpen(true);
  };

  // Group exceptions by type
  const groupedExceptions = (exceptions || []).reduce((acc, exception) => {
    const type = exception.exception_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(exception);
    return acc;
  }, {} as Record<string, TaskExceptionWithDetails[]>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.open || 0}</p>
              <p className="text-sm text-muted-foreground">Open Exceptions</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{slaBreachedTasks?.length || 0}</p>
              <p className="text-sm text-muted-foreground">SLA Breaches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exception Types */}
      <div className="wms-card p-4">
        <h3 className="font-semibold mb-4">Exceptions by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(exceptionTypeConfig).map(([type, config]) => {
            const count = groupedExceptions[type]?.length || 0;
            const Icon = config.icon;
            return (
              <div
                key={type}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  count > 0 ? 'border-border bg-muted/30' : 'border-dashed opacity-50'
                )}
              >
                <Icon className={cn('h-5 w-5 mx-auto mb-1', config.color)} />
                <p className="text-lg font-semibold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exception List */}
      <div className="wms-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Active Exceptions</h3>
        </div>
        <ScrollArea className="h-[400px]">
          {exceptionsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !exceptions || exceptions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active exceptions</p>
              <p className="text-sm">All tasks are running smoothly</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {exceptions.map((exception) => {
                const config = exceptionTypeConfig[exception.exception_type] || exceptionTypeConfig.other;
                const Icon = config.icon;

                return (
                  <div key={exception.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn('h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center')}>
                          <Icon className={cn('h-5 w-5', config.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{config.label}</p>
                            {exception.severity === 'high' && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                                High Severity
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{exception.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Task: {exception.task?.task_number || exception.task_id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>Reporter: {exception.reporter?.full_name || exception.reporter?.email || 'Unknown'}</span>
                            <span>•</span>
                            <span>Reported {formatDistanceToNow(new Date(exception.reported_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openResolveDialog(exception.id)}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* SLA Breach List */}
      <div className="wms-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-warning flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            SLA Breaches
          </h3>
        </div>
        <ScrollArea className="h-[300px]">
          {slaLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !slaBreachedTasks || slaBreachedTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No SLA breaches</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {slaBreachedTasks.map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{task.task_number}</p>
                        <Badge variant="outline" className="capitalize text-xs">{task.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.warehouse?.name}
                        {task.due_at && (
                          <span className="text-destructive ml-2">
                            (Due {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onViewTask(task)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Resolve Exception Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Exception</DialogTitle>
            <DialogDescription>
              Provide resolution notes to close this exception.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how the exception was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleResolve} 
              disabled={!resolutionNotes || resolveException.isPending}
            >
              {resolveException.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Resolve Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
