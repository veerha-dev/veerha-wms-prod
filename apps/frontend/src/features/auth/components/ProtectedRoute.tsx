import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { usePermissions, ROUTE_PERMISSION_MAP } from '@/shared/hooks/usePermissions';
import { Loader2, ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
  requiredModule?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireManager = false,
  requiredModule,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, isManager } = useAuth();
  const { canAccess, canAccessRoute } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/" replace />;
  }

  // Check module-level permission (from the permissions matrix)
  if (requiredModule && !canAccess(requiredModule, 'view')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the <strong>{requiredModule}</strong> module.
            Contact your administrator to request access.
          </p>
          <a href="/" className="text-primary hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  // Auto-detect module from route path if no requiredModule specified
  if (!requiredModule) {
    const detectedModule = ROUTE_PERMISSION_MAP[location.pathname];
    if (detectedModule && detectedModule !== 'Dashboard' && !canAccess(detectedModule, 'view')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this module.
              Contact your administrator to request access.
            </p>
            <a href="/" className="text-primary hover:underline">← Back to Dashboard</a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
