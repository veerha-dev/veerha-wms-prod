import { useAuth } from '@/shared/contexts/AuthContext';

export function useTenant() {
  const { tenantId, user } = useAuth();
  return { tenantId, tenant: user ? { id: user.tenantId } : null };
}
