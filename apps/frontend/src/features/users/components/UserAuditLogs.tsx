import { useState } from 'react';
import { safeFormatDate, safeFormatDistanceToNow } from '@/shared/lib/dateUtils';
import {
  History,
  Search,
  Filter,
  Download,
  User,
  UserPlus,
  UserMinus,
  Shield,
  Building2,
  LogIn,
  LogOut,
  Key,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { UserAuditLog, UserAuditAction } from '@/shared/types/users';

interface UserAuditLogsProps {
  logs: UserAuditLog[];
}

const actionConfig: Record<UserAuditAction, { label: string; icon: any; color: string }> = {
  user_created: { label: 'User Created', icon: UserPlus, color: 'bg-success/10 text-success' },
  user_invited: { label: 'User Invited', icon: UserPlus, color: 'bg-info/10 text-info' },
  user_activated: { label: 'User Activated', icon: User, color: 'bg-success/10 text-success' },
  user_disabled: { label: 'User Disabled', icon: UserMinus, color: 'bg-destructive/10 text-destructive' },
  user_suspended: { label: 'User Suspended', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
  role_changed: { label: 'Role Changed', icon: Shield, color: 'bg-accent/10 text-accent' },
  warehouse_assigned: { label: 'Warehouse Assigned', icon: Building2, color: 'bg-info/10 text-info' },
  warehouse_removed: { label: 'Warehouse Removed', icon: Building2, color: 'bg-warning/10 text-warning' },
  password_reset: { label: 'Password Reset', icon: Key, color: 'bg-muted text-muted-foreground' },
  session_forced_logout: { label: 'Forced Logout', icon: LogOut, color: 'bg-destructive/10 text-destructive' },
  bulk_import: { label: 'Bulk Import', icon: Upload, color: 'bg-accent/10 text-accent' },
  login_success: { label: 'Login', icon: LogIn, color: 'bg-success/10 text-success' },
  login_failed: { label: 'Login Failed', icon: LogIn, color: 'bg-destructive/10 text-destructive' },
};

export function UserAuditLogs({ logs }: UserAuditLogsProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !log.actorName.toLowerCase().includes(searchLower) &&
        !log.targetUserName?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user_created">User Created</SelectItem>
              <SelectItem value="user_invited">User Invited</SelectItem>
              <SelectItem value="user_disabled">User Disabled</SelectItem>
              <SelectItem value="role_changed">Role Changed</SelectItem>
              <SelectItem value="warehouse_assigned">Warehouse Assigned</SelectItem>
              <SelectItem value="session_forced_logout">Forced Logout</SelectItem>
              <SelectItem value="login_success">Login</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Log List */}
      <div className="wms-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Audit Trail</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredLogs.length} records
          </span>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const config = actionConfig[log.action];
              const Icon = config.icon;

              return (
                <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{config.label}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.actorRole}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        <span className="font-medium text-foreground">{log.actorName}</span>
                        {log.targetUserName && (
                          <>
                            <span> → </span>
                            <span className="font-medium text-foreground">{log.targetUserName}</span>
                          </>
                        )}
                      </p>
                      {(log.oldValue || log.newValue) && (
                        <div className="mt-1 text-sm">
                          {log.oldValue && (
                            <span className="text-muted-foreground line-through mr-2">{log.oldValue}</span>
                          )}
                          {log.oldValue && log.newValue && <span className="text-muted-foreground">→</span>}
                          {log.newValue && (
                            <span className="ml-2 font-medium">{log.newValue}</span>
                          )}
                        </div>
                      )}
                      {log.reason && (
                        <p className="mt-1 text-sm text-muted-foreground italic">"{log.reason}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{safeFormatDate(log.timestamp, 'HH:mm')}</p>
                      <p className="text-xs text-muted-foreground">
                        {safeFormatDistanceToNow(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
