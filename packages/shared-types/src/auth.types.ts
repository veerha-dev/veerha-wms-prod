// Authentication and tenant types

import { BaseEntity, TenantScopedEntity } from './common.types';

// --- Enums ---

export type UserRole = 'admin' | 'manager' | 'worker';

export type UserStatus = 'invited' | 'active' | 'disabled' | 'suspended';

// --- Entities ---

export interface Tenant extends BaseEntity {
  name: string;
  code: string;
  plan: string;
  status: 'active' | 'inactive';
  enabledModules: string[];
  limits: TenantLimits;
}

export interface TenantLimits {
  maxWarehouses: number;
  maxSKUs: number;
  maxUsers: number;
  maxDailyMovements: number;
  maxBatches: number;
  reportRetentionDays: number;
}

export interface User extends TenantScopedEntity {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLogin?: string;
  lastActive?: string;
  activeSessions: number;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

// --- DTOs ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupRequest {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

export interface UserInvitePayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  warehouseIds: string[];
}

// --- Stats ---

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
