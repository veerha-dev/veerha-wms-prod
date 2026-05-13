import { useQuery } from '@tanstack/react-query';
import { onboardingApi, OnboardingStatus } from '../api/onboarding.api';
import { useAuth } from '@/shared/contexts/AuthContext';

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';

export function useOnboardingStatus() {
  const { user, isAuthenticated } = useAuth();

  return useQuery<OnboardingStatus>({
    queryKey: ['onboarding-status'],
    queryFn: () => onboardingApi.getStatus(),
    // Only relevant for admins in real-API mode
    enabled:
      API_MODE === 'real' &&
      isAuthenticated &&
      !!user &&
      user.role === 'admin' &&
      !user.mustChangePassword,
    staleTime: 30_000,
    retry: 1,
  });
}
