import React, { createContext, useContext, ReactNode } from 'react';
import { useTenantModules, useIsModuleEnabled } from '@/shared/hooks/useModuleRegistry';

interface ModuleContextType {
  enabledModules: string[];
  isModuleEnabled: (moduleCode: string) => boolean;
  isLoading: boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { data: tenantModules, isLoading } = useTenantModules();
  
  const enabledModules = React.useMemo(() => {
    if (!tenantModules) return [];
    return tenantModules
      .filter(m => m.is_enabled)
      .map(m => m.module_code);
  }, [tenantModules]);

  const isModuleEnabled = React.useCallback((moduleCode: string) => {
    return enabledModules.includes(moduleCode);
  }, [enabledModules]);

  return (
    <ModuleContext.Provider value={{ enabledModules, isModuleEnabled, isLoading }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModuleContext() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModuleContext must be used within a ModuleProvider');
  }
  return context;
}
