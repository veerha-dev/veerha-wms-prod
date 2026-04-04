// Mock Authentication Data

export const MOCK_TENANT = {
  id: 'tenant-001',
  name: 'Veerha Demo Company',
  slug: 'veerha-demo',
  plan: 'enterprise',
  maxWarehouses: 10,
  maxSkus: 5000,
  maxUsers: 100,
  maxDailyMovements: 10000,
  isActive: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_USER = {
  id: 'user-001',
  email: 'admin@veerha.com',
  fullName: 'Demo Admin',
  phone: '+91 9876543210',
  avatarUrl: null,
  role: 'admin',
  tenantId: MOCK_TENANT.id,
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_TOKENS = {
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
};

export function createMockUser(email: string, fullName?: string) {
  return {
    ...MOCK_USER,
    id: 'user-' + Date.now(),
    email,
    fullName: fullName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  };
}
