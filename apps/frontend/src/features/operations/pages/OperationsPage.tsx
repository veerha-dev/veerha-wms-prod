import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import { cn } from '@/shared/lib/utils';
import { api } from '@/shared/lib/api';
import { toast } from '@/shared/hooks/use-toast';
import { Badge } from '@/shared/components/ui/badge';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  User,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  Package,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface Task {
  id: string;
  tenant_id: string;
  task_number: string;
  template_id?: string;
  type: 'putaway' | 'pick' | 'pack' | 'transfer' | 'cycle_count' | 'replenishment' | 'return_processing';
  status: 'created' | 'assigned' | 'in_progress' | 'on_hold' | 'blocked' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  warehouse_id?: string;
  warehouse?: { id: string; name: string; code: string };
  assigned_to?: string;
  assignee?: { id: string; full_name: string; email: string };
  sku_id?: string;
  sku?: { id: string; sku_code: string; name: string };
  quantity?: number;
  instructions?: string;
  notes?: string;
  due_at?: string;
  sla_breached: boolean;
  created_by?: string;
  creator?: { id: string; full_name: string; email: string };
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  assigned_at?: string;
}

interface TaskException {
  id: string;
  tenant_id: string;
  task_id: string;
  exception_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  reported_by?: string;
  reporter?: { id: string; full_name: string; email: string };
  reported_at: string;
  resolved_by?: string;
  resolver?: { id: string; full_name: string; email: string };
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface TaskComment {
  id: string;
  tenant_id: string;
  task_id: string;
  comment: string;
  commented_by?: string;
  commenter?: { id: string; full_name: string; email: string };
  commented_at: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowTemplate {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  type: 'putaway' | 'pick' | 'pack' | 'transfer' | 'cycle_count' | 'replenishment' | 'return_processing';
  steps: any[];
  default_priority: 'low' | 'medium' | 'high' | 'urgent';
  sla_minutes?: number;
  auto_assign: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const typeConfig = {
  putaway: { color: 'bg-blue-10 text-blue border-blue/20', icon: Layers },
  pick: { color: 'bg-green-10 text-green border-green/20', icon: ClipboardList },
  pack: { color: 'bg-purple-10 text-purple border-purple/20', icon: Package },
  transfer: { color: 'bg-orange-10 text-orange border-orange/20', icon: ArrowUpDown },
  cycle_count: { color: 'bg-cyan-10 text-cyan border-cyan/20', icon: RefreshCw },
  replenishment: { color: 'bg-indigo-10 text-indigo border-indigo/20', icon: Plus },
  return_processing: { color: 'bg-red-10 text-red border-red/20', icon: AlertTriangle },
};

const statusConfig = {
  pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
  created: { color: 'bg-gray-100 text-gray-700', label: 'Created' },
  assigned: { color: 'bg-blue-100 text-blue-700', label: 'Assigned' },
  in_progress: { color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
  on_hold: { color: 'bg-orange-100 text-orange-700', label: 'On Hold' },
  blocked: { color: 'bg-red-100 text-red-700', label: 'Blocked' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
  cancelled: { color: 'bg-gray-100 text-gray-700', label: 'Cancelled' },
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
  medium: { color: 'bg-blue-100 text-blue-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
};

export default function OperationsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [exceptions, setExceptions] = useState<TaskException[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState({
    type: 'pick' as const,
    priority: 'medium' as const,
    quantity: 1,
    instructions: '',
    notes: '',
  });

  // Real-time data fetching
  useEffect(() => {
    fetchTasks();
    fetchTemplates();
    fetchExceptions();
    
    const interval = setInterval(() => { fetchTasks(); fetchExceptions(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      // Start with a simple query to get basic task data
      const { data } = await api.get('/api/v1/tasks', { params: { limit: 100 } });
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplates([]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchExceptions = async () => {
    try {
      // Start with a simple query to get basic exception data
      const { data } = await api.get('/api/v1/tasks', { params: { status: 'cancelled', limit: 50 } });
      setExceptions(data.data || []);
    } catch (error) {
      console.error('Error fetching exceptions:', error);
    }
  };

  const createTask = async () => {
    try {
      await api.post('/api/v1/tasks', { type: newTask.type, priority: newTask.priority, quantity: newTask.quantity, instructions: newTask.instructions, notes: newTask.notes });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      setShowCreateDialog(false);
      setNewTask({
        type: 'pick',
        priority: 'medium',
        quantity: 1,
        instructions: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === 'in_progress') await api.post(`/api/v1/tasks/${taskId}/start`);
      else if (newStatus === 'completed') await api.post(`/api/v1/tasks/${taskId}/complete`);
      else if (newStatus === 'cancelled') await api.post(`/api/v1/tasks/${taskId}/cancel`);
      else await api.put(`/api/v1/tasks/${taskId}`, { status: newStatus });
      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/v1/tasks/${taskId}`);
      toast({
        title: 'Success',
        description: 'Task deleted',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    const taskNum = task.taskNumber || task.task_number || '';
    const matchesSearch = taskNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesType = selectedType === 'all' || task.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Clock className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'on_hold': return <Pause className="w-4 h-4" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeConfig[type as keyof typeof typeConfig]?.icon || Layers;
    return <Icon className="w-4 h-4" />;
  };
  return (
    <AppLayout 
      title="Operations"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Operations' }]}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Operations</h1>
            <p className="text-muted-foreground">Manage warehouse operations and tasks</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{exceptions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="putaway">Putaway</SelectItem>
              <SelectItem value="pick">Pick</SelectItem>
              <SelectItem value="pack">Pack</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Real-time task management with {filteredTasks.length} tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{(task as any).taskNumber || task.task_number}</TableCell>
                      <TableCell>
                        <Badge className={typeConfig[task.type]?.color}>
                          {getTypeIcon(task.type)}
                          <span className="ml-1">{task.type}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[task.status]?.color}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{statusConfig[task.status]?.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityConfig[task.priority]?.color}>
                          {priorityConfig[task.priority]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{((task as any).assignedToId || task.assigned_to) ? 'Assigned' : 'Unassigned'}</TableCell>
                      <TableCell>{(task as any).warehouse?.name || task.warehouse_id || 'N/A'}</TableCell>
                      <TableCell>{new Date((task as any).createdAt || task.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowTaskDetail(task)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'completed')}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Task Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Create a new task for warehouse operations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={newTask.type} onValueChange={(value: any) => setNewTask({...newTask, type: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="putaway">Putaway</SelectItem>
                    <SelectItem value="pick">Pick</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newTask.quantity}
                  onChange={(e) => setNewTask({...newTask, quantity: safeParseInt(e.target.value, 1)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructions" className="text-right">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  value={newTask.instructions}
                  onChange={(e) => setNewTask({...newTask, instructions: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newTask.notes}
                  onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                {(showTaskDetail as any)?.taskNumber || showTaskDetail?.task_number}
              </DialogDescription>
            </DialogHeader>
            {showTaskDetail && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground">{showTaskDetail.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="text-sm text-muted-foreground">{showTaskDetail.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <p className="text-sm text-muted-foreground">{showTaskDetail.priority}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantity</Label>
                    <p className="text-sm text-muted-foreground">{showTaskDetail.quantity}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Instructions</Label>
                  <p className="text-sm text-muted-foreground">{showTaskDetail.instructions}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{showTaskDetail.notes}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date((showTaskDetail as any).createdAt || showTaskDetail.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assignee</Label>
                    <p className="text-sm text-muted-foreground">{(showTaskDetail as any).assignedTo?.fullName || showTaskDetail.assigned_to || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTaskDetail(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
