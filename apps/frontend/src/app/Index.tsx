import Dashboard from '@/features/dashboard/pages/Dashboard';
import ManagerDashboard from '@/features/dashboard/pages/ManagerDashboard';
import { useAuth } from '@/shared/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  // Admin sees global dashboard; manager/worker sees warehouse-scoped dashboard
  if (user?.role === 'admin') return <Dashboard />;
  return <ManagerDashboard />;
};

export default Index;
