import { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Clock,
  Users,
  Shield,
  Zap,
  Save,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useWorkflowSettings, useUpdateWorkflowSettings, WorkflowSettings as WorkflowSettingsType } from '@/features/operations/hooks/useWorkflowSettings';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function WorkflowSettings() {
  const { currentUser } = useWMS();
  const isAdmin = currentUser.role === 'admin';

  const { data: savedSettings, isLoading } = useWorkflowSettings();
  const updateSettings = useUpdateWorkflowSettings();

  const [settings, setSettings] = useState<Partial<WorkflowSettingsType>>({
    auto_assignment: true,
    assignment_mode: 'round_robin',
    default_sla_minutes: 30,
    sla_warning_threshold: 15,
    exception_auto_escalate: true,
    escalation_timeout_minutes: 15,
    notify_on_assignment: true,
    notify_on_complete: true,
    notify_on_sla_breach: true,
    notify_on_exception: true,
    max_tasks_per_worker: 5,
    require_cancel_reason: true,
    require_reassign_reason: true,
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  const handleSave = () => {
    updateSettings.mutate(settings);
  };

  if (!isAdmin) {
    return (
      <div className="wms-card p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold mb-2">Admin Access Required</h3>
        <p className="text-sm text-muted-foreground">
          Only administrators can modify workflow settings.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Assignment Settings</h3>
            <p className="text-sm text-muted-foreground">Configure task assignment behavior</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Assignment</p>
              <p className="text-sm text-muted-foreground">Automatically assign tasks to workers</p>
            </div>
            <Switch
              checked={settings.auto_assignment}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_assignment: checked })}
            />
          </div>

          {settings.auto_assignment && (
            <div className="space-y-2 pl-4 border-l-2 border-accent/30">
              <Label>Assignment Mode</Label>
              <Select
                value={settings.assignment_mode}
                onValueChange={(value: any) => setSettings({ ...settings, assignment_mode: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="least_loaded">Least Loaded</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Active Tasks per Worker</Label>
              <Input
                type="number"
                value={settings.max_tasks_per_worker}
                onChange={(e) => setSettings({ ...settings, max_tasks_per_worker: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SLA Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">SLA Configuration</h3>
            <p className="text-sm text-muted-foreground">Service level agreement settings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Default SLA (minutes)</Label>
            <Input
              type="number"
              value={settings.default_sla_minutes}
              onChange={(e) => setSettings({ ...settings, default_sla_minutes: parseInt(e.target.value) || 30 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Warning Threshold (minutes before)</Label>
            <Input
              type="number"
              value={settings.sla_warning_threshold}
              onChange={(e) => setSettings({ ...settings, sla_warning_threshold: parseInt(e.target.value) || 15 })}
            />
          </div>
        </div>
      </div>

      {/* Exception Handling */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Exception Handling</h3>
            <p className="text-sm text-muted-foreground">Configure exception behavior</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Escalate Exceptions</p>
              <p className="text-sm text-muted-foreground">Automatically escalate unresolved exceptions</p>
            </div>
            <Switch
              checked={settings.exception_auto_escalate}
              onCheckedChange={(checked) => setSettings({ ...settings, exception_auto_escalate: checked })}
            />
          </div>

          {settings.exception_auto_escalate && (
            <div className="space-y-2 pl-4 border-l-2 border-destructive/30">
              <Label>Escalation Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.escalation_timeout_minutes}
                onChange={(e) => setSettings({ ...settings, escalation_timeout_minutes: parseInt(e.target.value) || 15 })}
                className="w-[200px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">Configure notification triggers</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'notify_on_assignment', label: 'Task Assignment', desc: 'Notify when tasks are assigned' },
            { key: 'notify_on_complete', label: 'Task Completion', desc: 'Notify when tasks are completed' },
            { key: 'notify_on_sla_breach', label: 'SLA Breach', desc: 'Notify when SLA is breached' },
            { key: 'notify_on_exception', label: 'Exception Raised', desc: 'Notify when exceptions occur' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={(settings as any)[item.key]}
                onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Audit Requirements */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Audit Requirements</h3>
            <p className="text-sm text-muted-foreground">Mandatory documentation settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Cancellation Reason</p>
              <p className="text-sm text-muted-foreground">Mandatory reason when cancelling tasks</p>
            </div>
            <Switch
              checked={settings.require_cancel_reason}
              onCheckedChange={(checked) => setSettings({ ...settings, require_cancel_reason: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Reassignment Reason</p>
              <p className="text-sm text-muted-foreground">Mandatory reason when reassigning tasks</p>
            </div>
            <Switch
              checked={settings.require_reassign_reason}
              onCheckedChange={(checked) => setSettings({ ...settings, require_reassign_reason: checked })}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
