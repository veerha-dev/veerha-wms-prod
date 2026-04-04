import { useState } from 'react';
import { useTenants, useFeatureFlags, useUpdateFeatureFlags } from '@/hooks/useTenants';
import { usePlans } from '@/hooks/usePlans';
import { ToggleLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  { key: 'single_order_picking', label: 'Single Order Picking', starter: true, pro: true, enterprise: true },
  { key: 'batch_picking', label: 'Batch Picking', starter: false, pro: true, enterprise: true },
  { key: 'wave_picking', label: 'Wave Picking', starter: false, pro: false, enterprise: true },
  { key: 'zone_picking', label: 'Zone Picking', starter: false, pro: false, enterprise: true },
  { key: 'serial_tracking', label: 'Serial Tracking', starter: false, pro: true, enterprise: true },
  { key: 'cycle_count', label: 'Cycle Count', starter: false, pro: true, enterprise: true },
  { key: 'stock_transfer', label: 'Stock Transfer', starter: true, pro: true, enterprise: true },
  { key: 'api_access', label: 'API Access', starter: false, pro: true, enterprise: true },
  { key: 'custom_reports', label: 'Custom Reports', starter: false, pro: false, enterprise: true },
];

export default function FeatureFlagsPage() {
  const { data: tenants } = useTenants();
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const { data: flags } = useFeatureFlags(selectedTenantId);
  const updateFlags = useUpdateFeatureFlags();

  const toggleFlag = (key: string) => {
    if (!selectedTenantId) return;
    const newFlags = { ...flags, [key]: !flags?.[key] };
    updateFlags.mutate({ id: selectedTenantId, flags: newFlags }, {
      onSuccess: () => toast.success(`${key} ${newFlags[key] ? 'enabled' : 'disabled'}`),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ToggleLeft className="h-6 w-6" />Feature Flags</h1>
          <p className="text-sm text-slate-500">Control which features are available per plan and per client</p>
        </div>
      </div>

      {/* Plan matrix */}
      <div className="bg-white rounded-xl border mb-6 overflow-hidden">
        <div className="p-4 border-b bg-slate-50"><h3 className="font-semibold text-sm">Feature Matrix by Plan</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b">
            <th className="text-left p-3 font-medium">Feature</th>
            <th className="text-center p-3 font-medium">Starter</th>
            <th className="text-center p-3 font-medium">Professional</th>
            <th className="text-center p-3 font-medium">Enterprise</th>
          </tr></thead>
          <tbody>
            {FEATURES.map(f => (
              <tr key={f.key} className="border-b last:border-0">
                <td className="p-3">{f.label}</td>
                <td className="p-3 text-center">{f.starter ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                <td className="p-3 text-center">{f.pro ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
                <td className="p-3 text-center">{f.enterprise ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-client override */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Client Override</h3>
          <select value={selectedTenantId} onChange={e => setSelectedTenantId(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="">Select a client...</option>
            {(tenants || []).map((t: any) => (
              <option key={t.id} value={t.id}>{t.companyName || t.name || t.slug}</option>
            ))}
          </select>
        </div>
        {selectedTenantId ? (
          <div className="p-4 space-y-3">
            {FEATURES.map(f => (
              <div key={f.key} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{f.label}</span>
                <button onClick={() => toggleFlag(f.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${flags?.[f.key] ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${flags?.[f.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-400 text-sm">Select a client to manage feature overrides</p>
        )}
      </div>
    </div>
  );
}
