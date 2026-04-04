import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { WorkflowDashboard } from '@/features/operations/components/WorkflowDashboard';
import { TaskQueue } from '@/features/operations/components/TaskQueue';
import { TaskDetailPanel } from '@/features/operations/components/TaskDetailPanel';
import { WorkflowTemplates } from '@/features/operations/components/WorkflowTemplates';
import { ExceptionsPanel } from '@/features/operations/components/ExceptionsPanel';
import { WorkflowAuditLog } from '@/features/operations/components/WorkflowAuditLog';
import { WorkflowSettings } from '@/features/operations/components/WorkflowSettings';
import { TaskWithDetails } from '@/features/operations/hooks/useEnhancedTasks';
import { useWorkflowMetrics } from '@/features/operations/hooks/useWorkflowMetrics';
import { useWorkflowTemplates } from '@/features/operations/hooks/useWorkflowTemplates';
import { useWorkflowAuditLogs } from '@/features/operations/hooks/useWorkflowAuditLogs';
import { useWMS } from '@/shared/contexts/WMSContext';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  LayoutDashboard,
  ListTodo,
  GitBranch,
  AlertTriangle,
  History,
  Settings,
} from 'lucide-react';

export default function WorkflowsPage() {
  const { currentUser } = useWMS();
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  // Live data hooks
  const { data: metrics, isLoading: metricsLoading } = useWorkflowMetrics();
  const { data: templates, isLoading: templatesLoading } = useWorkflowTemplates();
  const { data: auditLogs, isLoading: logsLoading } = useWorkflowAuditLogs();

  const isAdmin = currentUser?.role === 'admin';

  const handleSelectTask = (task: TaskWithDetails) => {
    setSelectedTask(task);
    setTaskPanelOpen(true);
  };

  return (
    <AppLayout
      title="Workflow Management"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Workflows' }]}
    >
      {/* Production Status Label */}
      <div className="mb-4">
        <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm font-medium">
          Purf Mode (Need to push Production)
        </Badge>
      </div>
      
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Task Queue</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Exceptions</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          {metricsLoading || !metrics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-lg" />
            </div>
          ) : (
            <WorkflowDashboard metrics={metrics} />
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <TaskQueue onSelectTask={handleSelectTask} />
        </TabsContent>

        <TabsContent value="templates">
          {templatesLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : (
            <WorkflowTemplates templates={templates || []} />
          )}
        </TabsContent>

        <TabsContent value="exceptions">
          <ExceptionsPanel onViewTask={handleSelectTask} />
        </TabsContent>

        <TabsContent value="audit">
          {logsLoading ? (
            <Skeleton className="h-96 rounded-lg" />
          ) : (
            <WorkflowAuditLog />
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <WorkflowSettings />
          </TabsContent>
        )}
      </Tabs>

      <TaskDetailPanel
        task={selectedTask}
        open={taskPanelOpen}
        onClose={() => setTaskPanelOpen(false)}
      />
    </AppLayout>
  );
}
