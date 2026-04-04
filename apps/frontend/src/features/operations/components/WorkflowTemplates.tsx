import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Package,
  ClipboardCheck,
  ArrowRight,
  Settings2,
  Zap,
  GitBranch,
  Loader2,
  RotateCcw,
  Repeat,
  Calculator,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { WorkflowTemplate, TaskType, TaskPriority, TYPE_DISPLAY } from '@/shared/types/workflow';
import { useWMS } from '@/shared/contexts/WMSContext';
import { 
  useCreateWorkflowTemplate, 
  useToggleWorkflowTemplate, 
  useDeleteWorkflowTemplate 
} from '@/features/operations/hooks/useWorkflowTemplates';
import { toast } from 'sonner';

interface WorkflowTemplatesProps {
  templates: WorkflowTemplate[];
}

const workflowTypeConfig: Record<TaskType, { icon: any; color: string }> = {
  putaway: { icon: Package, color: 'bg-success/10 text-success' },
  pick: { icon: ClipboardCheck, color: 'bg-warning/10 text-warning' },
  pack: { icon: Package, color: 'bg-info/10 text-info' },
  transfer: { icon: ArrowRight, color: 'bg-accent/10 text-accent' },
  cycle_count: { icon: Calculator, color: 'bg-secondary text-secondary-foreground' },
  replenishment: { icon: Repeat, color: 'bg-accent/10 text-accent' },
  return_processing: { icon: RotateCcw, color: 'bg-destructive/10 text-destructive' },
};

export function WorkflowTemplates({ templates }: WorkflowTemplatesProps) {
  const { currentUser } = useWMS();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showStepsDialog, setShowStepsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<TaskType>('pick');
  const [formDescription, setFormDescription] = useState('');
  const [formSLA, setFormSLA] = useState('30');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formAutoAssign, setFormAutoAssign] = useState(false);

  const createTemplate = useCreateWorkflowTemplate();
  const toggleTemplate = useToggleWorkflowTemplate();
  const deleteTemplate = useDeleteWorkflowTemplate();

  const isAdmin = currentUser.role === 'admin';

  const activeTemplates = templates.filter(t => t.isActive).length;
  const totalSteps = templates.reduce((acc, t) => acc + (t.steps?.length || 0), 0);

  const resetForm = () => {
    setFormName('');
    setFormType('pick');
    setFormDescription('');
    setFormSLA('30');
    setFormPriority('medium');
    setFormAutoAssign(false);
  };

  const handleCreate = () => {
    if (!formName.trim()) {
      toast.error('Template name is required');
      return;
    }

    createTemplate.mutate(
      {
        name: formName,
        type: formType,
        description: formDescription || null,
        sla_minutes: parseInt(formSLA) || null,
        default_priority: formPriority,
        auto_assign: formAutoAssign,
        steps: [],
        is_active: true,
      },
      {
        onSuccess: () => {
          setShowCreateDialog(false);
          resetForm();
        },
      }
    );
  };

  const handleToggle = (templateId: string, isActive: boolean) => {
    toggleTemplate.mutate({ id: templateId, is_active: isActive });
  };

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplate.mutate(templateToDelete, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setTemplateToDelete(null);
        },
      });
    }
  };

  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{templates.length}</p>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Play className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeTemplates}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSteps}</p>
              <p className="text-sm text-muted-foreground">Total Steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="wms-card p-8 text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No Workflow Templates</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first workflow template to automate warehouse operations.
          </p>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((template) => {
            const config = workflowTypeConfig[template.type] || workflowTypeConfig.pick;
            const Icon = config.icon;

            return (
              <div key={template.id} className="wms-card-interactive p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedTemplate(template); setShowStepsDialog(true); }}>
                          <GitBranch className="h-4 w-4 mr-2" />View Steps
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => openDeleteDialog(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className="capitalize">
                    {TYPE_DISPLAY[template.type] || template.type}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    template.autoAssign ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'
                  )}>
                    {template.autoAssign ? 'Auto-Assign' : 'Manual'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-lg font-semibold">{template.steps?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-lg font-semibold capitalize">{template.defaultPriority}</p>
                    <p className="text-xs text-muted-foreground">Priority</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-lg font-semibold">{template.slaMinutes || '-'}m</p>
                    <p className="text-xs text-muted-foreground">SLA</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Code: {template.code}</p>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={(checked) => handleToggle(template.id, checked)}
                        disabled={toggleTemplate.isPending}
                      />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      template.isActive ? 'text-success' : 'text-muted-foreground'
                    )}>
                      {template.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Workflow Template</DialogTitle>
            <DialogDescription>
              Design a new automated workflow for warehouse operations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name *</Label>
                <Input 
                  placeholder="e.g., Priority Picking" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Workflow Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as TaskType)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="putaway">Putaway</SelectItem>
                    <SelectItem value="pick">Picking</SelectItem>
                    <SelectItem value="pack">Packing</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="cycle_count">Cycle Count</SelectItem>
                    <SelectItem value="replenishment">Replenishment</SelectItem>
                    <SelectItem value="return_processing">Returns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe the workflow purpose..." 
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Priority</Label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as TaskPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SLA (minutes)</Label>
                <Input 
                  type="number" 
                  placeholder="30" 
                  value={formSLA}
                  onChange={(e) => setFormSLA(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Auto-Assign Tasks</p>
                <p className="text-sm text-muted-foreground">Automatically assign to available workers</p>
              </div>
              <Switch 
                checked={formAutoAssign} 
                onCheckedChange={setFormAutoAssign}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createTemplate.isPending}>
              {createTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Steps Dialog */}
      <Dialog open={showStepsDialog} onOpenChange={setShowStepsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name} - Steps</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.steps?.length || 0} steps in this workflow
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
            {selectedTemplate?.steps && selectedTemplate.steps.length > 0 ? (
              selectedTemplate.steps.map((step, idx) => (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                      step.autoExecute ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                    )}>
                      {step.order}
                    </div>
                    {idx < selectedTemplate.steps.length - 1 && (
                      <div className="w-px h-full bg-border my-1 min-h-[20px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{step.name}</p>
                      {step.autoExecute && (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success">Auto</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description || 'No description'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No steps defined for this template yet.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTemplate.isPending}>
              {deleteTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
