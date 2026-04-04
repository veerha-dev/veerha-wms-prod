import { useState, useEffect } from 'react';
import api, { setToken, clearToken, getToken } from '@/lib/api';
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (getToken()) setUser({ loggedIn: true }); setLoading(false); }, []);
  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) { setToken(data.data.accessToken); setUser(data.data.user); return data.data; }
    throw new Error('Login failed');
  };
  const logout = () => { clearToken(); setUser(null); };
  return { user, loading, login, logout, isAuthenticated: !!getToken() };
}
