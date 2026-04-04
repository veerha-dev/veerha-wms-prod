import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';

export function useInventoryReport(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-inventory', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/reports/inventory', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useMovementsReport(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-movements', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/reports/movements', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function usePurchaseOrdersReport(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-po', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/reports/purchase-orders', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useSalesOrdersReport(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-so', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/reports/sales-orders', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export function useGRNReport(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-grn', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/reports/grn', { params }); return data.data; },
    enabled: isAuthenticated,
  });
}

export type ReportType = 'inventory' | 'movements' | 'purchase-orders' | 'sales-orders' | 'grn' | 'stock' | 'stock_report' | 'movement_report' | 'purchase_register' | 'sales_register' | 'expiry_report' | 'low_stock_report' | 'warehouse_utilization' | 'audit_trail' | 'grn_report';

export function useReportConfigurations(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['report-configs', params],
    queryFn: async () => { try { const { data } = await api.get('/api/v1/reports/configs', { params }); return data.data || []; } catch { return []; } },
    enabled: isAuthenticated,
  });
}

export function useReportHistory(limit?: number, params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  const queryParams = { ...(params || {}), ...(limit ? { limit } : {}) };
  return useQuery({
    queryKey: ['report-history', queryParams],
    queryFn: async () => { try { const { data } = await api.get('/api/v1/reports/history', { params: queryParams }); return data.data || []; } catch { return []; } },
    enabled: isAuthenticated,
    staleTime: 0,
  });
}

export function useRunReport(reportType: string, filters?: Record<string, any>, page?: number, pageSize?: number) {
  const { isAuthenticated } = useAuth();
  // Map report type names to API endpoints
  const typeMap: Record<string, string> = {
    stock_report: 'stock', inventory_report: 'inventory', movement_report: 'movements',
    purchase_register: 'purchase-register', sales_register: 'sales-register',
    expiry_report: 'expiry', low_stock_report: 'low-stock',
    warehouse_utilization: 'warehouse-utilization', audit_trail: 'audit-trail',
    grn_report: 'grn',
  };
  const endpoint = typeMap[reportType] || reportType;
  const params = { ...filters, page: page || 1, limit: pageSize || 50 };

  return useQuery({
    queryKey: ['report-run', reportType, filters, page, pageSize],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/reports/${endpoint}`, { params });
      const rows = data.data || [];
      return { data: rows, totalCount: data.totalCount || rows.length };
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useCreateReportConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: any) => { const { data } = await api.post('/api/v1/reports/configs', config); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['report-configs'] }); },
  });
}

export function useLogReportExecution() {
  return useMutation({
    mutationFn: async (log: any) => { try { const { data } = await api.post('/api/v1/reports/history', log); return data.data; } catch { return null; } },
  });
}

export function useDeleteReportConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.delete(`/api/v1/reports/configs/${id}`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['report-configs'] }); },
  });
}

export async function fetchAllReportPages(reportType: string, params?: Record<string, any>) {
  const typeMap: Record<string, string> = {
    stock_report: 'stock', inventory_report: 'inventory', movement_report: 'movements',
    purchase_register: 'purchase-register', sales_register: 'sales-register',
    expiry_report: 'expiry', low_stock_report: 'low-stock',
    warehouse_utilization: 'warehouse-utilization', audit_trail: 'audit-trail',
    grn_report: 'grn',
  };
  const endpoint = typeMap[reportType] || reportType;
  const { data } = await api.get(`/api/v1/reports/${endpoint}`, { params: { ...params, limit: 10000 } });
  return data.data || [];
}
