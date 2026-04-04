import { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { api } from '@/shared/lib/api';
import { toast } from 'sonner';
import { RolePermission } from '@/shared/types/users';

interface PermissionsMatrixProps {
  permissions?: RolePermission[];
}

export function PermissionsMatrix({ permissions: initialPermissions }: PermissionsMatrixProps) {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/v1/users/permissions');
      if (data.data && data.data.length > 0) {
        setPermissions(data.data);
      } else if (initialPermissions && initialPermissions.length > 0) {
        setPermissions(initialPermissions);
      }
    } catch {
      if (initialPermissions && initialPermissions.length > 0) {
        setPermissions(initialPermissions);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (module: string, action: string, role: 'admin' | 'manager' | 'worker') => {
    if (role === 'admin') return;

    setPermissions(prev => prev.map(p => {
      if (p.module === module && p.action === action) {
        return { ...p, [role]: !p[role] };
      }
      return p;
    }));
    setHasChanges(true);
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      await api.put('/api/v1/users/permissions', { permissions });
      toast.success('Permissions saved successfully');
      setHasChanges(false);
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const modules = [...new Set(permissions.map(p => p.module))];

  const getModulePermissions = (module: string) => permissions.filter(p => p.module === module);

  const renderToggle = (perm: RolePermission, role: 'admin' | 'manager' | 'worker') => {
    const allowed = perm[role];
    if (role === 'admin') {
      return <CheckCircle2 className="h-4 w-4 text-success mx-auto" />;
    }
    return (
      <Switch
        checked={allowed}
        onCheckedChange={() => togglePermission(perm.module, perm.action, role)}
        className="mx-auto"
      />
    );
  };

  if (loading) {
    return (
      <div className="wms-card p-8 flex justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="wms-card p-8 text-center">
        <p className="text-muted-foreground">No permissions configured. Run database migrations to seed default permissions.</p>
      </div>
    );
  }

  return (
    <div className="wms-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Role Permissions Matrix</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle module access for Manager and Worker roles. Admin always has full access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={fetchPermissions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={savePermissions} disabled={!hasChanges || saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[200px]">Module</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead className="w-[100px] text-center">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-accent">Admin</span>
                  <span className="text-[10px] text-muted-foreground">Full Access</span>
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-center">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-info">Manager</span>
                  <span className="text-[10px] text-muted-foreground">Editable</span>
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-center">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-warning">Worker</span>
                  <span className="text-[10px] text-muted-foreground">Editable</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((module, moduleIndex) => {
              const modulePerms = getModulePermissions(module);
              return modulePerms.map((perm, permIndex) => (
                <TableRow
                  key={`${module}-${perm.action}`}
                  className={cn(moduleIndex % 2 === 0 ? 'bg-muted/20' : '')}
                >
                  <TableCell className="font-medium">
                    {permIndex === 0 ? module : ''}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground text-sm">
                    {perm.action}
                  </TableCell>
                  <TableCell className="text-center">{renderToggle(perm, 'admin')}</TableCell>
                  <TableCell className="text-center">{renderToggle(perm, 'manager')}</TableCell>
                  <TableCell className="text-center">{renderToggle(perm, 'worker')}</TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
