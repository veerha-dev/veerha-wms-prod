// VEERHA WMS User Management Types

export type UserRole = 'admin' | 'manager' | 'worker';

export type UserStatus = 'invited' | 'active' | 'disabled' | 'suspended';

export interface WMSUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  warehouseAccess: WarehouseAccess[];
  avatar?: string;
  createdBy: string;
  createdAt: Date;
  lastLogin?: Date;
  lastActive?: Date;
  activeSessions: number;
  inviteToken?: string;
  inviteExpiresAt?: Date;
}

export interface WarehouseAccess {
  warehouseId: string;
  warehouseName: string;
  assignedAt: Date;
  assignedBy: string;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  startedAt: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

export interface UserAuditLog {
  id: string;
  action: UserAuditAction;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: Date;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export type UserAuditAction = 
  | 'user_created'
  | 'user_invited'
  | 'user_activated'
  | 'user_disabled'
  | 'user_suspended'
  | 'role_changed'
  | 'warehouse_assigned'
  | 'warehouse_removed'
  | 'password_reset'
  | 'session_forced_logout'
  | 'bulk_import'
  | 'login_success'
  | 'login_failed';

export interface RolePermission {
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  admin: boolean;
  manager: boolean;
  worker: boolean;
}

export interface UserManagementSettings {
  requireWarehouseForWorker: boolean;
  requireWarehouseForManager: boolean;
  allowBulkImport: boolean;
  maxUsersPerTenant: number;
  maxAdminsPerTenant: number;
  maxManagersPerTenant: number;
  inviteExpiryHours: number;
  sessionTimeoutMinutes: number;
  forceLogoutOnRoleChange: boolean;
  forceLogoutOnDisable: boolean;
}

export interface UserInvitePayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  warehouseIds: string[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  disabledUsers: number;
  adminCount: number;
  managerCount: number;
  workerCount: number;
  usersNearLimit: boolean;
  maxUsers: number;
}
