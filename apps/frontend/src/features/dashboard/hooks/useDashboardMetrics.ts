import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePreferences } from '@/features/settings/hooks/useSettings';

function useRefetchInterval(fallback = 60000): number | false {
  const { data: prefs } = usePreferences();
  if (prefs?.autoRefresh === false) return false;
  return (prefs?.refreshIntervalSeconds ?? fallback / 1000) * 1000;
}

export function useDashboardStats() {
  const { isAuthenticated } = useAuth();
  const interval = useRefetchInterval(60000);
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const { data } = await api.get('/api/v1/dashboard/stats'); return data.data; },
    enabled: isAuthenticated,
    refetchInterval: interval,
  });
}

export function useDashboardInventoryOverview() {
  const { isAuthenticated } = useAuth();
  const interval = useRefetchInterval(60000);
  return useQuery({
    queryKey: ['dashboard-inventory-overview'],
    queryFn: async () => { const { data } = await api.get('/api/v1/dashboard/inventory-overview'); return data.data; },
    enabled: isAuthenticated,
    refetchInterval: interval,
  });
}

export function useDashboardOrdersSummary() {
  const { isAuthenticated } = useAuth();
  const interval = useRefetchInterval(60000);
  return useQuery({
    queryKey: ['dashboard-orders-summary'],
    queryFn: async () => { const { data } = await api.get('/api/v1/dashboard/orders-summary'); return data.data; },
    enabled: isAuthenticated,
    refetchInterval: interval,
  });
}

export function useDashboardMetrics() {
  const stats = useDashboardStats();
  const inventory = useDashboardInventoryOverview();
  const orders = useDashboardOrdersSummary();
  return {
    stats: stats.data,
    inventory: inventory.data,
    orders: orders.data,
    isLoading: stats.isLoading || inventory.isLoading || orders.isLoading,
    error: stats.error || inventory.error || orders.error,
  };
}

export function useDashboardRealtime() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['dashboard-realtime'],
    queryFn: async () => { const { data } = await api.get('/api/v1/dashboard/realtime'); return data.data; },
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });
}

export function useDashboardTrend(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  const interval = useRefetchInterval(60000);
  return useQuery({
    queryKey: ['dashboard-trend', params],
    queryFn: async () => { try { const { data } = await api.get('/api/v1/dashboard/trend', { params }); return data.data; } catch { return null; } },
    enabled: isAuthenticated,
    refetchInterval: interval,
  });
}
