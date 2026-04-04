import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useAlerts(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/alerts', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });
}

export function useAlertsSummary() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['alerts-summary'],
    queryFn: async () => { const { data } = await api.get('/api/v1/alerts/summary'); return data.data; },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/alerts/${id}/acknowledge`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); queryClient.invalidateQueries({ queryKey: ['alerts-summary'] }); toast.success('Alert acknowledged'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useAcknowledgeAllAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => { const { data } = await api.post('/api/v1/alerts/acknowledge-all'); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); queryClient.invalidateQueries({ queryKey: ['alerts-summary'] }); toast.success('All alerts acknowledged'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
