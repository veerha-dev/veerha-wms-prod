import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
export const useDashboard = () => useQuery({ queryKey: ['sa-dashboard'], queryFn: async () => { const { data } = await api.get('/dashboard'); return data.data; }, refetchInterval: 30000 });
