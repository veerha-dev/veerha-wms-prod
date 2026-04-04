import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { safeFormatDate } from '@/shared/lib/dateUtils';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  Monitor,
  LogOut,
  Key,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { WMSUser, UserSession, UserRole } from '@/shared/types/users';
import { useWMS } from '@/shared/contexts/WMSContext';
import { toast } from 'sonner';

interface UserProfilePanelProps {
  user: WMSUser | null;
  sessions: UserSession[];
  open: boolean;
  onClose: () => void;
  onStatusChange?: (userId: string, newStatus: 'active' | 'disabled') => void;
  onRoleChange?: (userId: string, newRole: UserRole, reason: string) => void;
  onForceLogout?: (userId: string, sessionId?: string) => void;
}

const roleConfig = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-accent/10 text-accent border-accent/20', desc: 'Full system access' },
  manager: { label: 'Manager', icon: Shield, color: 'bg-info/10 text-info border-info/20', desc: 'Operations access' },
  worker: { label: 'Worker', icon: ShieldAlert, color: 'bg-warning/10 text-warning border-warning/20', desc: 'Task execution only' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20' },
  invited: { label: 'Invited', color: 'bg-warning/10 text-warning border-warning/20' },
  disabled: { label: 'Disabled', color: 'bg-muted text-muted-foreground' },
  suspended: { label: 'Suspended', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const mockWarehouses = [
  { id: 'wh-1', name: 'Mumbai Central' },
  { id: 'wh-2', name: 'Delhi Hub' },
  { id: 'wh-3', name: 'Bangalore DC' },
];

export function UserProfilePanel({
  user,
  sessions,
  open,
  onClose,
  onStatusChange,
  onRoleChange,
  onForceLogout,
}: UserProfilePanelProps) {
  const { currentUser } = useWMS();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | ''>('');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [disableReason, setDisableReason] = useState('');

  if (!user) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isSelf = currentUser?.id === user.id;
  const role = roleConfig[user.role];
  const status = statusConfig[user.status];
  const RoleIcon = role.icon;
  const userSessions = sessions.filter(s => s.userId === user.id);

  const handleRoleChange = () => {
    if (newRole && roleChangeReason) {
      onRoleChange?.(user.id, newRole, roleChangeReason);
      setShowRoleDialog(false);
      setNewRole('');
      setRoleChangeReason('');
      toast.success('Role updated successfully');
    }
  };

  const handleDisable = () => {
    if (disableReason) {
      onStatusChange?.(user.id, 'disabled');
      setShowDisableDialog(false);
      setDisableReason('');
      toast.success('User disabled successfully');
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[540px] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-accent/10 text-accent text-lg font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-lg">{user.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn('gap-1', role.color)}>
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                  </Badge>
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="access"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
                >
                  Access
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
                >
                  Sessions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="p-4 space-y-6 mt-0">
                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Details */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Account Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{safeFormatDate(user.createdAt, 'MMM d, yyyy')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created By</p>
                      <p className="text-sm font-medium">{user.createdBy}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <p className="text-sm font-medium">
                        {user.lastLogin
                          ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium">
                        {user.lastActive
                          ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {user.status === 'invited' && (
                  <>
                    <Separator />
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium text-warning">Pending Invitation</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invite expires {user.inviteExpiresAt
                          ? formatDistanceToNow(new Date(user.inviteExpiresAt), { addSuffix: true })
                          : 'soon'}
                      </p>
                      {isAdmin && (
                        <Button size="sm" variant="outline" className="mt-2">
                          Resend Invite
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="access" className="p-4 space-y-6 mt-0">
                {/* Role */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                    {isAdmin && !isSelf && (
                      <Button variant="ghost" size="sm" onClick={() => setShowRoleDialog(true)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    )}
                  </div>
                  <div className={cn('p-4 rounded-lg border', role.color.replace('text-', 'border-').replace('/10', '/30'))}>
                    <div className="flex items-center gap-3">
                      <RoleIcon className="h-6 w-6" />
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-sm opacity-80">{role.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warehouse Access */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Warehouse Access</h4>
                  {user.warehouseAccess.length > 0 ? (
                    <div className="space-y-2">
                      {user.warehouseAccess.map((wh) => (
                        <div key={wh.warehouseId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{wh.warehouseName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Since {safeFormatDate(wh.assignedAt, 'MMM d, yyyy')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No warehouse access assigned</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="p-4 space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Active Sessions ({userSessions.length})
                  </h4>
                  {isAdmin && !isSelf && userSessions.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onForceLogout?.(user.id)}
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Force Logout All
                    </Button>
                  )}
                </div>

                {userSessions.length > 0 ? (
                  <div className="space-y-3">
                    {userSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Monitor className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{session.device}</p>
                                {session.isCurrent && (
                                  <Badge variant="outline" className="text-xs bg-success/10 text-success">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{session.browser}</p>
                              <p className="text-xs text-muted-foreground">{session.location} • {session.ip}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last active {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          {isAdmin && !session.isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onForceLogout?.(user.id, session.id)}
                            >
                              <LogOut className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active sessions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Actions Footer */}
          {isAdmin && !isSelf && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Key className="h-4 w-4" />
                  Reset Password
                </Button>
                {user.status === 'active' ? (
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setShowDisableDialog(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Disable User
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => onStatusChange?.(user.id, 'active')}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Enable User
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Changing the role will immediately update permissions. The user will be logged out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="manager">Manager - Operations access</SelectItem>
                  <SelectItem value="worker">Worker - Task execution only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason for Change (Required)</Label>
              <Textarea
                placeholder="Enter reason for role change..."
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={!newRole || !roleChangeReason}>
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable User Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable User</DialogTitle>
            <DialogDescription>
              This will prevent the user from logging in. Active sessions will be terminated.
              Tasks assigned to this user will be flagged for reassignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Disabling (Required)</Label>
              <Textarea
                placeholder="Enter reason..."
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDisable} disabled={!disableReason}>
              Disable User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
