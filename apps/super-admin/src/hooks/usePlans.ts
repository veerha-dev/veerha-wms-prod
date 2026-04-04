import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
export const usePlans = () => useQuery({ queryKey: ['sa-plans'], queryFn: async () => { const { data } = await api.get('/plans'); return data.data; } });
