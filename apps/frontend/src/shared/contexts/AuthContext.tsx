import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

const ACCESS_TOKEN_KEY = 'wms_access_token';
const REFRESH_TOKEN_KEY = 'wms_refresh_token';
const USER_KEY = 'wms_mock_user';

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  tenantId: string;
  warehouseId: string | null;
  isActive: boolean;
  lastLogin?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  tenantId: string | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function createMockUser(email: string, fullName?: string): AuthUser {
  return {
    id: 'user-' + Date.now(),
    email,
    fullName: fullName || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    phone: '+91 9876543210',
    avatarUrl: null,
    role: 'admin',
    tenantId: 'tenant-001',
    warehouseId: null,
    isActive: true,
  };
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function mapBackendUser(backendUser: any): AuthUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    fullName: backendUser.fullName,
    phone: backendUser.phone || null,
    avatarUrl: backendUser.avatarUrl || null,
    role: backendUser.role,
    tenantId: backendUser.tenantId,
    warehouseId: backendUser.warehouseId || null,
    isActive: backendUser.isActive ?? true,
    lastLogin: backendUser.lastLogin || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRealMode = API_MODE === 'real';

  const loadStoredUser = () => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        const authUser = mapBackendUser(data.data);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
      }
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      if (isRealMode) {
        fetchProfile().finally(() => setIsLoading(false));
      } else {
        loadStoredUser();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    try {
      if (isRealMode) {
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, {
          email, password, fullName, companyName,
        });

        if (data.success && data.data) {
          setTokens(data.data.accessToken, data.data.refreshToken);
          const authUser = mapBackendUser(data.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(authUser));
          setUser(authUser);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockUser = createMockUser(email, fullName);
        const mockToken = 'mock-token-' + Date.now();
        setTokens(mockToken, mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
      }
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      return { error: new Error(message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isRealMode) {
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
          email, password,
        });

        if (data.success && data.data) {
          setTokens(data.data.accessToken, data.data.refreshToken);
          const authUser = mapBackendUser(data.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(authUser));
          setUser(authUser);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockUser = createMockUser(email);
        const mockToken = 'mock-token-' + Date.now();
        setTokens(mockToken, mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
      }
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    if (isRealMode) {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore logout API errors
      }
    }
    clearTokens();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (isRealMode) {
      await fetchProfile();
    } else {
      loadStoredUser();
    }
  };

  const value: AuthContextType = {
    user,
    tenantId: user?.tenantId ?? null,
    role: user?.role ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin',
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
