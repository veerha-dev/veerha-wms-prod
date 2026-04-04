import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('wms_theme') as Theme) || 'system',
  );
  const [primaryColor, setPrimaryColorState] = useState<string>(
    () => localStorage.getItem('wms_primary_color') || '#2B9E8C',
  );

  // Load preferences from server
  const { data: prefs } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/settings/preferences');
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Sync from server once loaded
  useEffect(() => {
    if (prefs?.theme) {
      setThemeState(prefs.theme as Theme);
      localStorage.setItem('wms_theme', prefs.theme);
    }
    if (prefs?.primaryColor) {
      setPrimaryColorState(prefs.primaryColor);
      localStorage.setItem('wms_primary_color', prefs.primaryColor);
    }
  }, [prefs]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (getSystemDark() ? 'dark' : 'light') : theme;

  // Apply theme class to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Apply primary color CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', primaryColor);
  }, [primaryColor]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mq.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const updateAppearanceMutation = useMutation({
    mutationFn: (dto: { theme?: string; primaryColor?: string }) =>
      api.patch('/api/v1/settings/preferences/appearance', dto).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(['user-preferences'], (old: any) => old ? { ...old, ...data } : data);
    },
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('wms_theme', t);
    if (isAuthenticated) updateAppearanceMutation.mutate({ theme: t });
  }, [isAuthenticated, updateAppearanceMutation]);

  const setPrimaryColor = useCallback((hex: string) => {
    setPrimaryColorState(hex);
    localStorage.setItem('wms_primary_color', hex);
    if (isAuthenticated) updateAppearanceMutation.mutate({ primaryColor: hex });
  }, [isAuthenticated, updateAppearanceMutation]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
