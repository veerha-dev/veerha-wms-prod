import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
export const useInvoices = () => useQuery({ queryKey: ['sa-invoices'], queryFn: async () => { const { data } = await api.get('/billing/invoices'); return data.data; } });
export const useCreateInvoice = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (d: any) => { const { data } = await api.post('/billing/invoices', d); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-invoices'] }) }); };
