import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  systemName: string;
  language: string;
  timezone: string;
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  autoRefresh: boolean;
  compactView: boolean;
  refreshIntervalSeconds: number;
  notifEmailLowStock: boolean;
  notifEmailTaskException: boolean;
  notifEmailDailySummary: boolean;
  notifEmailUserActivity: boolean;
  notifEmailSystemUpdates: boolean;
  notifInappRealtime: boolean;
  notifInappSound: boolean;
  sessionTimeoutMinutes: number;
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
}

export interface TenantSettings {
  id: string;
  companyName: string;
  name: string;
  industry: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  gstNumber: string | null;
  planName: string;
  planCode: string;
  maxWarehouses: number;
  maxUsers: number;
  maxSkus: number;
  maxDailyMovements: number;
  maxBatches: number;
  userCount: number;
  warehouseCount: number;
  skuCount: number;
}

export interface Integration {
  key: string;
  name: string;
  description: string;
  connected: boolean;
  connectionDetails?: string | null;
}

const PREFS_DEFAULTS: UserPreferences = {
  systemName: 'VEERHA WMS',
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'dmy',
  autoRefresh: true,
  compactView: false,
  refreshIntervalSeconds: 60,
  notifEmailLowStock: true,
  notifEmailTaskException: true,
  notifEmailDailySummary: true,
  notifEmailUserActivity: false,
  notifEmailSystemUpdates: true,
  notifInappRealtime: true,
  notifInappSound: false,
  sessionTimeoutMinutes: 480,
  theme: 'system',
  primaryColor: '#2B9E8C',
};

// ─── Preferences ─────────────────────────────────────────────────────────────

export function usePreferences() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async (): Promise<UserPreferences> => {
      const { data } = await api.get('/api/v1/settings/preferences');
      return { ...PREFS_DEFAULTS, ...data.data };
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: PREFS_DEFAULTS,
  });
}

export function useUpdateGeneral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<UserPreferences>) =>
      api.patch('/api/v1/settings/preferences/general', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['user-preferences'], (old: any) => ({ ...PREFS_DEFAULTS, ...old, ...data }));
      toast.success('General settings saved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });
}

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<UserPreferences>) =>
      api.patch('/api/v1/settings/preferences/notifications', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['user-preferences'], (old: any) => ({ ...PREFS_DEFAULTS, ...old, ...data }));
      toast.success('Notification preferences saved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });
}

export function useUpdateAppearance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { theme?: string; primaryColor?: string }) =>
      api.patch('/api/v1/settings/preferences/appearance', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['user-preferences'], (old: any) => ({ ...PREFS_DEFAULTS, ...old, ...data }));
      toast.success('Appearance saved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });
}

export function useUpdateSecurityPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { sessionTimeoutMinutes: number }) =>
      api.patch('/api/v1/settings/preferences/security', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['user-preferences'], (old: any) => ({ ...PREFS_DEFAULTS, ...old, ...data }));
      toast.success('Security preferences saved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export function useTenantSettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['settings-tenant'],
    queryFn: async (): Promise<TenantSettings> => {
      const { data } = await api.get('/api/v1/settings/tenant');
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateTenantInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<TenantSettings & { gstNumber: string; industry: string }>) =>
      api.patch('/api/v1/settings/tenant', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['settings-tenant'], data);
      toast.success('Organization info saved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });
}

// ─── Integrations ────────────────────────────────────────────────────────────

export function useIntegrations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['settings-integrations'],
    queryFn: async (): Promise<Integration[]> => {
      const { data } = await api.get('/api/v1/settings/integrations');
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, connected, connectionDetails }: { key: string; connected: boolean; connectionDetails?: string }) =>
      api.patch(`/api/v1/settings/integrations/${key}`, { connected, connectionDetails }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-integrations'] });
      toast.success('Integration updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update integration'),
  });
}

// ─── Test Notification ────────────────────────────────────────────────────────

export function useSendTestNotification() {
  return useMutation({
    mutationFn: () => api.post('/api/v1/settings/notifications/test'),
    onSuccess: () => toast.success('Test notification sent — check your alerts panel'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send notification'),
  });
}

// ─── Profile Update ──────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  return useMutation({
    mutationFn: (dto: { fullName?: string; phone?: string }) =>
      api.put(`/api/v1/users/${user!.id}`, dto).then((r) => r.data.data),
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update profile'),
  });
}

// ─── Change Password ──────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      api.post('/api/v1/auth/change-password', dto).then((r) => r.data),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });
}
