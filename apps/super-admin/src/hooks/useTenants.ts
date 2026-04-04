import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useTenants = () => useQuery({ queryKey: ['sa-tenants'], queryFn: async () => { const { data } = await api.get('/tenants'); return data.data; } });
export const useTenant = (id: string) => useQuery({ queryKey: ['sa-tenant', id], queryFn: async () => { const { data } = await api.get("/tenants/" + id); return data.data; }, enabled: !!id });
export const useCreateTenant = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (d: any) => { const { data } = await api.post('/tenants', d); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }) }); };
export const useSuspendTenant = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { const { data } = await api.post("/tenants/" + id + "/suspend"); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }) }); };
export const useActivateTenant = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (id: string) => { const { data } = await api.post("/tenants/" + id + "/activate"); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }) }); };
export const useUsage = (id: string) => useQuery({ queryKey: ['sa-usage', id], queryFn: async () => { const { data } = await api.get("/usage/" + id); return data.data; }, enabled: !!id });

// New hooks for Module 9
export const useTenantUsers = (id: string) => useQuery({ queryKey: ['sa-tenant-users', id], queryFn: async () => { const { data } = await api.get(`/tenants/${id}/users`); return data.data; }, enabled: !!id });
export const useTenantWarehouses = (id: string) => useQuery({ queryKey: ['sa-tenant-warehouses', id], queryFn: async () => { const { data } = await api.get(`/tenants/${id}/warehouses`); return data.data; }, enabled: !!id });
export const useFeatureFlags = (id: string) => useQuery({ queryKey: ['sa-feature-flags', id], queryFn: async () => { const { data } = await api.get(`/tenants/${id}/feature-flags`); return data.data; }, enabled: !!id });
export const useUpdateFeatureFlags = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, flags }: { id: string; flags: any }) => { const { data } = await api.put(`/tenants/${id}/feature-flags`, flags); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-feature-flags'] }) }); };
export const useTenantNotes = (id: string) => useQuery({ queryKey: ['sa-tenant-notes', id], queryFn: async () => { const { data } = await api.get(`/tenants/${id}/notes`); return data.data; }, enabled: !!id });
export const useAddTenantNote = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({ id, text }: { id: string; text: string }) => { const { data } = await api.post(`/tenants/${id}/notes`, { text }); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenant-notes'] }) }); };
export const useAuditLogs = () => useQuery({ queryKey: ['sa-audit-logs'], queryFn: async () => { const { data } = await api.get('/audit-logs'); return data.data; } });
