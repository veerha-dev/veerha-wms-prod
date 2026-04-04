import { usePlans } from '@/hooks/usePlans';
import { Package, Users, Building2, Boxes, BarChart3, Check } from 'lucide-react';

export default function PlansPage() {
  const { data: plans = [], isLoading } = usePlans();

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Plans</h1>
        <p className="text-slate-500 mt-1">Subscription tiers and pricing</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p: any) => (
          <div key={p.id} className={`bg-white rounded-2xl border-2 ${p.code === 'enterprise' ? 'border-indigo-600 shadow-lg' : 'border-slate-200'} p-6 relative`}>
            {p.code === 'enterprise' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{p.description}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">₹{(p.monthlyPrice || 0).toLocaleString('en-IN')}</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">₹{(p.yearlyPrice || 0).toLocaleString('en-IN')}/year (save {Math.round(100 - (p.yearlyPrice / (p.monthlyPrice * 12)) * 100)}%)</p>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-4">
              {[
                { icon: Building2, label: `${p.maxWarehouses >= 999 ? 'Unlimited' : p.maxWarehouses} Warehouses` },
                { icon: Boxes, label: `${p.maxSkus >= 50000 ? '50,000' : p.maxSkus.toLocaleString()} SKUs` },
                { icon: Users, label: `${p.maxUsers} Users (${p.maxManagers} Mgrs + ${p.maxWorkers} Workers)` },
                { icon: BarChart3, label: `${p.maxDailyMovements.toLocaleString()} Daily Movements` },
                { icon: Package, label: `${p.reportRetentionDays} Days Report Retention` },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-600">{f.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Modules: {(p.enabledModules || []).length}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
