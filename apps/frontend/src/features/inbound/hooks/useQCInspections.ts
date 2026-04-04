import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useQCInspections(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['qc-inspections', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/qc', { params }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useQCInspection(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['qc-inspection', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/qc/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateQCInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inspection: any) => { const { data } = await api.post('/api/v1/qc', inspection); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('QC inspection created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function usePassQCInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/qc/${id}/pass`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('QC inspection passed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useFailQCInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: any) => { const { data } = await api.post(`/api/v1/qc/${id}/fail`, body); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('QC inspection failed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function usePendingQCInspections(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['qc-inspections', 'pending', params],
    queryFn: async () => { 
      const { data } = await api.get('/api/v1/qc', { params: { ...params, status: 'pending' } }); 
      return { data: data.data || [], meta: data.meta || {} }; 
    },
    enabled: isAuthenticated,
  });
}

export function useStartInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/qc/${id}/start`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('Inspection started'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useCompleteInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, result, notes }: { id: string; result: string; notes?: string }) => {
      const { data } = await api.post(`/api/v1/qc/${id}/complete`, { result, notes }); return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('Inspection completed'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useAddDefect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...defect }: { id: string; [key: string]: any }) => {
      const { data } = await api.post(`/api/v1/qc/${id}/defects`, defect); return data.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['qc-inspections'] }); toast.success('Defect recorded'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
