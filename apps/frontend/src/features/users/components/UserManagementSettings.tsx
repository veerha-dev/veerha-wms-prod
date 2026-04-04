import { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Bell,
  Lock,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import { useWMS } from '@/shared/contexts/WMSContext';
import { toast } from 'sonner';

export function UserManagementSettings() {
  const { currentUser } = useWMS();
  const isAdmin = currentUser?.role === 'admin';

  const [settings, setSettings] = useState({
    requireWarehouseForWorker: true,
    requireWarehouseForManager: true,
    inviteExpiryHours: 48,
    sessionTimeoutMinutes: 480,
    forceLogoutOnRoleChange: true,
    forceLogoutOnDisable: true,
    allowMultipleSessions: true,
    maxSessionsPerUser: 3,
    notifyOnNewUser: true,
    notifyOnUserDisabled: true,
    notifyOnRoleChange: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  if (!isAdmin) {
    return (
      <div className="wms-card p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="font-semibold mb-2">Admin Access Required</h3>
        <p className="text-sm text-muted-foreground">
          Only administrators can modify user management settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Requirements */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Access Requirements</h3>
            <p className="text-sm text-muted-foreground">Configure mandatory access settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Require Warehouse for Workers</p>
              <p className="text-sm text-muted-foreground">Workers must be assigned to at least one warehouse</p>
            </div>
            <Switch
              checked={settings.requireWarehouseForWorker}
              onCheckedChange={(checked) => setSettings({ ...settings, requireWarehouseForWorker: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Require Warehouse for Managers</p>
              <p className="text-sm text-muted-foreground">Managers must be assigned to at least one warehouse</p>
            </div>
            <Switch
              checked={settings.requireWarehouseForManager}
              onCheckedChange={(checked) => setSettings({ ...settings, requireWarehouseForManager: checked })}
            />
          </div>
        </div>
      </div>

      {/* Invite & Session Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold">Invite & Session Settings</h3>
            <p className="text-sm text-muted-foreground">Configure timeouts and limits</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Invite Expiry (hours)</Label>
            <Input
              type="number"
              value={settings.inviteExpiryHours}
              onChange={(e) => setSettings({ ...settings, inviteExpiryHours: parseInt(e.target.value) || 48 })}
            />
            <p className="text-xs text-muted-foreground">How long invite links remain valid</p>
          </div>
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 480 })}
            />
            <p className="text-xs text-muted-foreground">Inactive session auto-logout time</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Multiple Sessions</p>
              <p className="text-sm text-muted-foreground">Users can log in from multiple devices</p>
            </div>
            <Switch
              checked={settings.allowMultipleSessions}
              onCheckedChange={(checked) => setSettings({ ...settings, allowMultipleSessions: checked })}
            />
          </div>
          {settings.allowMultipleSessions && (
            <div className="space-y-2 pl-4 border-l-2 border-info/30">
              <Label>Max Sessions per User</Label>
              <Input
                type="number"
                value={settings.maxSessionsPerUser}
                onChange={(e) => setSettings({ ...settings, maxSessionsPerUser: parseInt(e.target.value) || 3 })}
                className="w-[100px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">Security Settings</h3>
            <p className="text-sm text-muted-foreground">Configure security behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Force Logout on Role Change</p>
              <p className="text-sm text-muted-foreground">Terminate all sessions when role is changed</p>
            </div>
            <Switch
              checked={settings.forceLogoutOnRoleChange}
              onCheckedChange={(checked) => setSettings({ ...settings, forceLogoutOnRoleChange: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Force Logout on Disable</p>
              <p className="text-sm text-muted-foreground">Terminate all sessions when user is disabled</p>
            </div>
            <Switch
              checked={settings.forceLogoutOnDisable}
              onCheckedChange={(checked) => setSettings({ ...settings, forceLogoutOnDisable: checked })}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="wms-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Admin Notifications</h3>
            <p className="text-sm text-muted-foreground">Notify admins about user events</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'notifyOnNewUser', label: 'New User Created', desc: 'When a new user joins' },
            { key: 'notifyOnUserDisabled', label: 'User Disabled', desc: 'When a user is disabled' },
            { key: 'notifyOnRoleChange', label: 'Role Changed', desc: 'When a user role is modified' },
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
