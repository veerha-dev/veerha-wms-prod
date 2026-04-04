import { ReactNode } from 'react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ShieldX } from 'lucide-react';

interface ModuleGuardProps {
  module: string;
  action?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({ module, action = 'view', children, fallback }: ModuleGuardProps) {
  const { canAccess } = usePermissions();

  if (!canAccess(module, action)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldX className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Access Restricted</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don't have permission to access the {module} module. Contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
