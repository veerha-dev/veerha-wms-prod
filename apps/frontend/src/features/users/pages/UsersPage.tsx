import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Key,
  Eye,
  UserPlus,
  History,
  LogOut,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useUsers, useUpdateUser, useInviteUser } from '@/features/users/hooks/useUsers';
import { WMSUser } from '@/shared/types/users';
import { UserProfilePanel } from '@/features/users/components/UserProfilePanel';
import { InviteUserDialog } from '@/features/users/components/InviteUserDialog';
import { PermissionsMatrix } from '@/features/users/components/PermissionsMatrix';
import { UserAuditLogs } from '@/features/users/components/UserAuditLogs';
import { UserManagementSettings } from '@/features/users/components/UserManagementSettings';

const roleConfig = {
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-accent/10 text-accent border-accent/20' },
  manager: { label: 'Manager', icon: Shield, color: 'bg-info/10 text-info border-info/20' },
  worker: { label: 'Worker', icon: ShieldAlert, color: 'bg-warning/10 text-warning border-warning/20' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20' },
  invited: { label: 'Invited', color: 'bg-warning/10 text-warning border-warning/20' },
  disabled: { label: 'Disabled', color: 'bg-muted text-muted-foreground' },
  suspended: { label: 'Suspended', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const warehouses = [
  { id: 'wh-1', name: 'Mumbai Central' },
  { id: 'wh-2', name: 'Delhi Hub' },
  { id: 'wh-3', name: 'Bangalore DC' },
];

export default function UsersPage() {
  const { currentUser } = useWMS();
  const { data: users = [], isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const inviteUser = useInviteUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WMSUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  
  // Convert real users to WMSUser format
  const convertedUsers: WMSUser[] = users.map((user: any) => ({
    id: user.id,
    name: user.fullName || user.full_name || user.email,
    email: user.email,
    phone: user.phone || '',
    role: user.role || 'worker',
    status: (user.isActive ?? user.is_active) ? 'active' : 'disabled',
    warehouseAccess: [],
    createdBy: 'System',
    createdAt: new Date(user.createdAt || user.created_at),
    lastLogin: (user.lastActiveAt || user.last_active_at) ? new Date(user.lastActiveAt || user.last_active_at) : new Date(),
    lastActive: (user.lastActiveAt || user.last_active_at) ? new Date(user.lastActiveAt || user.last_active_at) : new Date(),
    activeSessions: 1,
  }));

  // Simple stats calculation
  const stats = {
    totalUsers: convertedUsers.length,
    activeUsers: convertedUsers.filter(u => u.status === 'active').length,
    invitedUsers: convertedUsers.filter(u => u.status === 'invited').length,
    disabledUsers: convertedUsers.filter(u => u.status === 'disabled').length,
    adminCount: convertedUsers.filter(u => u.role === 'admin').length,
    managerCount: convertedUsers.filter(u => u.role === 'manager').length,
    workerCount: convertedUsers.filter(u => u.role === 'worker').length,
    maxUsers: 999999, // From unlimited plan
  };

  const filteredUsers = convertedUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewProfile = (user: WMSUser) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  return (
    <AppLayout
      title="User & Role Management"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Users' }]}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.invitedUsers}</p>
              <p className="text-xs text-muted-foreground">Invited</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.disabledUsers}</p>
              <p className="text-xs text-muted-foreground">Disabled</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.adminCount}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.managerCount}</p>
              <p className="text-xs text-muted-foreground">Managers</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.workerCount}</p>
              <p className="text-xs text-muted-foreground">Workers</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
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

        <TabsContent value="users">
          {/* Filters */}
          <div className="wms-card mb-6">
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAdmin && (
                <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Create User
                </Button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="wms-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Warehouse Access</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = roleConfig[user.role];
                  const status = statusConfig[user.status];
                  const RoleIcon = role.icon;

                  return (
                    <TableRow key={user.id} className="wms-table-row cursor-pointer" onClick={() => handleViewProfile(user)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-accent/10 text-accent font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1', role.color)}>
                          <RoleIcon className="h-3 w-3" />
                          {role.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{user.warehouseAccess.length} warehouses</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {user.lastActive ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true }) : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                              <Eye className="h-4 w-4 mr-2" />View Profile
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem><Key className="h-4 w-4 mr-2" />Reset Password</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === 'active' ? (
                                  <DropdownMenuItem><XCircle className="h-4 w-4 mr-2" />Disable</DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem><CheckCircle2 className="h-4 w-4 mr-2" />Enable</DropdownMenuItem>
                                )}
                                {user.activeSessions > 0 && (
                                  <DropdownMenuItem className="text-destructive">
                                    <LogOut className="h-4 w-4 mr-2" />Force Logout
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="p-3 border-t border-border text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {convertedUsers.length} users • {stats.totalUsers}/{stats.maxUsers} limit
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsMatrix permissions={[]} />
        </TabsContent>

        <TabsContent value="activity">
          <UserAuditLogs logs={[]} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <UserManagementSettings />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <InviteUserDialog
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={(payload) => inviteUser.mutate(payload)}
        warehouses={warehouses}
        userStats={stats}
      />

      <UserProfilePanel
        user={selectedUser}
        sessions={[]}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </AppLayout>
  );
}
