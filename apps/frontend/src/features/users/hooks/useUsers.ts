import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/shared/contexts/AuthContext';
import { toast } from 'sonner';

export function useUsers(params?: Record<string, any>) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => { const { data } = await api.get('/api/v1/users', { params }); return data.data || []; },
    enabled: isAuthenticated,
  });
}

export function useUser(id: string | null) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => { const { data } = await api.get(`/api/v1/users/${id}`); return data.data; },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: any) => { const { data } = await api.post('/api/v1/users', user); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => { const { data } = await api.put(`/api/v1/users/${id}`, updates); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/users/${id}/deactivate`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { data } = await api.post(`/api/v1/users/${id}/reactivate`); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User reactivated'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: any) => { const { data } = await api.post('/api/v1/users/invite', user); return data.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User invited successfully'); },
    onError: (e: any) => toast.error(`Failed: ${e.response?.data?.error?.message || e.message}`),
  });
}
