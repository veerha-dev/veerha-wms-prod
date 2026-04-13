import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  User,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useEnhancedTasks, TaskWithDetails } from '@/features/operations/hooks/useEnhancedTasks';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { TaskStatus, TaskPriority, TaskType, STATUS_DISPLAY, PRIORITY_DISPLAY, TYPE_DISPLAY } from '@/shared/types/workflow';

interface TaskQueueProps {
  onSelectTask: (task: TaskWithDetails) => void;
  onAssignTask?: (task: TaskWithDetails) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: any }> = {
  created: { label: 'Created', color: 'bg-muted text-muted-foreground', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-info/10 text-info border-info/20', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-warning/10 text-warning border-warning/20', icon: Play },
  on_hold: { label: 'On Hold', color: 'bg-secondary text-secondary-foreground', icon: Pause },
  blocked: { label: 'Blocked', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground line-through', icon: XCircle },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-info/10 text-info border-info/20' },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/20' },
  urgent: { label: 'Urgent', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const workflowTypeConfig: Record<TaskType, { label: string; color: string }> = {
  putaway: { label: 'Putaway', color: 'bg-success/10 text-success' },
  pick: { label: 'Picking', color: 'bg-warning/10 text-warning' },
  pack: { label: 'Packing', color: 'bg-info/10 text-info' },
  transfer: { label: 'Transfer', color: 'bg-accent/10 text-accent' },
  cycle_count: { label: 'Cycle Count', color: 'bg-secondary text-secondary-foreground' },
  replenishment: { label: 'Replenishment', color: 'bg-accent/10 text-accent' },
  return_processing: { label: 'Returns', color: 'bg-destructive/10 text-destructive' },
};

export function TaskQueue({ onSelectTask, onAssignTask }: TaskQueueProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'due_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: warehouses } = useWarehouses();
  const { data: tasks, isLoading } = useEnhancedTasks({
    status: statusFilter !== 'all' ? statusFilter as TaskStatus : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as TaskPriority : undefined,
    type: typeFilter !== 'all' ? typeFilter as TaskType : undefined,
    warehouseId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
    slaBreached: showOverdueOnly ? true : undefined,
    search: search || undefined,
  });

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'due_at') {
        const aTime = a.due_at ? new Date(a.due_at).getTime() : Infinity;
        const bTime = b.due_at ? new Date(b.due_at).getTime() : Infinity;
        comparison = aTime - bTime;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortBy, sortOrder]);

  const toggleSort = (column: 'created_at' | 'priority' | 'due_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, orders, SKUs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="putaway">Putaway</SelectItem>
              <SelectItem value="pick">Picking</SelectItem>
              <SelectItem value="pack">Packing</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="cycle_count">Cycle Count</SelectItem>
              <SelectItem value="replenishment">Replenishment</SelectItem>
              <SelectItem value="return_processing">Returns</SelectItem>
            </SelectContent>
          </Select>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses?.map(wh => (
                <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showOverdueOnly ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Overdue
          </Button>
        </div>
      </div>

      {/* Task Table */}
      <div className="wms-card">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm">Create a task from a workflow template to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[140px]">Task Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('due_at')} className="gap-1 -ml-3">
                      Due Time
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('priority')} className="gap-1 -ml-3">
                      Priority
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('created_at')} className="gap-1 -ml-3">
                      Created
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map((task) => {
                  const status = statusConfig[task.status];
                  const priority = priorityConfig[task.priority];
                  const type = workflowTypeConfig[task.type];
                  const StatusIcon = status.icon;

                  return (
                    <TableRow
                      key={task.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        task.sla_breached && 'bg-destructive/5'
                      )}
                      onClick={() => onSelectTask(task)}
                    >
                      <TableCell className="font-mono text-sm">{task.task_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={type?.color}>
                          {type?.label || task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">{task.sku?.name || '-'}</div>
                          <div className="text-xs text-muted-foreground">{task.sku?.sku_code || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{task.warehouse?.name || '-'}</TableCell>
                      <TableCell>
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-accent" />
                            </div>
                            <span className="text-sm">{task.assignee.full_name || task.assignee.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.due_at ? (
                          <span className={cn(task.sla_breached && 'text-destructive font-medium')}>
                            {format(new Date(task.due_at), 'MMM dd, HH:mm')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.linkedSoNumber ? (
                          <Badge variant="outline" className="text-xs">SO: {task.linkedSoNumber}</Badge>
                        ) : task.linkedGrnNumber ? (
                          <Badge variant="outline" className="text-xs">GRN: {task.linkedGrnNumber}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.sourceBinCode ? (
                          <span>Bin: {task.sourceBinCode}</span>
                        ) : task.destinationBinCode ? (
                          <span>Bin: {task.destinationBinCode}</span>
                        ) : task.binCode ? (
                          <span>Bin: {task.binCode}</span>
                        ) : task.zoneName ? (
                          <span>Zone: {task.zoneName}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priority.color}>
                          {priority.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1', status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.due_at ? (
                          <div className={cn(
                            'text-sm',
                            task.sla_breached && 'text-destructive font-medium'
                          )}>
                            {task.sla_breached && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                            {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        <div className="p-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {sortedTasks.length} tasks</span>
          <span>Auto-refreshing every 30s</span>
        </div>
      </div>
    </div>
  );
}
