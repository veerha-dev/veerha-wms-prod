import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { safeFormatDate } from '@/shared/lib/dateUtils';
import {
  X,
  Clock,
  User,
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  XCircle,
  ArrowRight,
  MessageSquare,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { TaskWithDetails, useUpdateTaskStatus, useAssignEnhancedTask, useCancelTask } from '@/features/operations/hooks/useEnhancedTasks';
import { useExceptionsByTask } from '@/features/operations/hooks/useTaskExceptions';
import { useAuditLogsByEntity } from '@/features/operations/hooks/useWorkflowAuditLogs';
import { TaskStatus, STATUS_DISPLAY, TYPE_DISPLAY } from '@/shared/types/workflow';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

interface TaskDetailPanelProps {
  task: TaskWithDetails | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  created: { label: 'Created', color: 'bg-muted text-muted-foreground', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-info/10 text-info', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-warning/10 text-warning', icon: Play },
  on_hold: { label: 'On Hold', color: 'bg-secondary text-secondary-foreground', icon: Pause },
  blocked: { label: 'Blocked', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

export function TaskDetailPanel({ task, open, onClose }: TaskDetailPanelProps) {
  const { currentUser } = useWMS();
  const { tenantId } = useAuth();
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reassignTo, setReassignTo] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [note, setNote] = useState('');

  // Mutations
  const updateStatus = useUpdateTaskStatus();
  const assignTask = useAssignEnhancedTask();
  const cancelTask = useCancelTask();

  // Fetch task exceptions
  const { data: exceptions } = useExceptionsByTask(task?.id || null);

  // Fetch task audit logs
  const { data: auditLogs } = useAuditLogsByEntity('task', task?.id || null);

  // Fetch users for reassignment
  const { data: users } = useQuery({
    queryKey: ['users', 'active'],
    queryFn: async () => { const { data } = await api.get('/api/v1/users', { params: { isActive: true } }); return data.data || []; },
    enabled: !!tenantId,
  });

  if (!task) return null;

  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const isAdmin = currentUser.role === 'admin';
  const canModify = task.status !== 'completed' && task.status !== 'cancelled';

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateStatus.mutate({ id: task.id, status: newStatus });
  };

  const handleReassign = () => {
    if (reassignTo) {
      assignTask.mutate({ id: task.id, assigned_to: reassignTo });
      setShowReassignDialog(false);
      setReassignTo('');
      setReassignReason('');
    }
  };

  const handleCancel = () => {
    if (cancelReason) {
      cancelTask.mutate({ id: task.id, reason: cancelReason });
      setShowCancelDialog(false);
      setCancelReason('');
      onClose();
    }
  };

  const openException = exceptions?.find(e => !e.resolved_at);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[540px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-lg">{task.task_number}</SheetTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {TYPE_DISPLAY[task.type] || task.type} Task
                </p>
              </div>
              <Badge variant="outline" className={cn('gap-1', status.color)}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4 space-y-6">
              {/* SLA Warning */}
              {task.sla_breached && (
                <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">SLA Breached</p>
                    <p className="text-sm text-destructive/80">
                      {task.due_at ? `Deadline was ${formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}` : 'Deadline passed'}
                    </p>
                  </div>
                </div>
              )}

              {/* Active Exception */}
              {openException && (
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <XCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning capitalize">
                      {openException.exception_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-warning/80">{openException.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reported {formatDistanceToNow(new Date(openException.reported_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}

              {/* Task Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">SKU</p>
                  <p className="font-medium">{task.sku?.name || '-'}</p>
                  {task.sku?.sku_code && (
                    <p className="text-xs text-muted-foreground">{task.sku.sku_code}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
                  <Badge variant="outline" className="capitalize">{task.priority}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Warehouse</p>
                  <p className="font-medium">{task.warehouse?.name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned To</p>
                  <p className="font-medium">{task.assignee?.full_name || task.assignee?.email || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                  <p className="font-medium">{task.quantity || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                  <p className="text-sm">{safeFormatDate(task.created_at || task.createdAt, 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">SLA Deadline</p>
                  <p className={cn('text-sm', task.sla_breached && 'text-destructive font-medium')}>
                    {safeFormatDate(task.due_at || task.dueAt, 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                {task.started_at && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Started</p>
                    <p className="text-sm">{safeFormatDate(task.started_at || task.startedAt, 'MMM d, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>

              {task.instructions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Instructions</h4>
                    <p className="text-sm text-muted-foreground">{task.instructions}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Activity Timeline from Audit Logs */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline
                </h4>
                {auditLogs && auditLogs.length > 0 ? (
                  <div className="space-y-3">
                    {auditLogs.slice(0, 10).map((log, idx) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            idx === 0 ? 'bg-accent' : 'bg-muted-foreground/30'
                          )} />
                          {idx < Math.min(auditLogs.length - 1, 9) && (
                            <div className="w-px h-full bg-border my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-sm font-medium capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{log.user?.full_name || log.user?.email || 'System'}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                          </div>
                          {log.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">"{log.reason}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                )}
              </div>

              {task.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{task.notes}</p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Actions Footer */}
          {canModify && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                {(task.status === 'created' || task.status === 'assigned') && (
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start Task
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <>
                    <Button 
                      className="flex-1 gap-2" 
                      variant="outline" 
                      onClick={() => handleStatusChange('on_hold')}
                      disabled={updateStatus.isPending}
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      className="flex-1 gap-2" 
                      onClick={() => handleStatusChange('completed')}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Complete
                    </Button>
                  </>
                )}
                {task.status === 'on_hold' && (
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updateStatus.isPending}
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                {task.status === 'blocked' && (
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updateStatus.isPending}
                  >
                    <Play className="h-4 w-4" />
                    Unblock
                  </Button>
                )}
                
                <Button variant="outline" size="icon" onClick={() => setShowReassignDialog(true)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
                
                {isAdmin && (
                  <Button variant="destructive" size="icon" onClick={() => setShowCancelDialog(true)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Assign this task to a different user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    ?.filter(u => u.id !== task.assigned_to)
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason for Reassignment (Optional)</Label>
              <Textarea
                placeholder="Enter reason..."
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassignDialog(false)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={!reassignTo || assignTask.isPending}>
              {assignTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Task</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancellation Reason</Label>
              <Textarea
                placeholder="Enter reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Go Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason || cancelTask.isPending}>
              {cancelTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cancel Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
