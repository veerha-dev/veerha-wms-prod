import { useDashboard } from '@/hooks/useDashboard';
import { Building2, Users, Activity, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboard();

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  const cards = [
    { label: 'Total Tenants', value: stats?.totalTenants || 0, icon: Building2, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Tenants', value: stats?.activeTenants || 0, icon: Activity, color: 'bg-green-50 text-green-600' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of all tenants</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="text-sm text-slate-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {stats?.suspendedTenants > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700 font-medium">{stats.suspendedTenants} tenant(s) currently suspended</p>
        </div>
      )}
    </div>
  );
}
