import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants, useCreateTenant, useSuspendTenant, useActivateTenant, useUsage } from '@/hooks/useTenants';
import { toast } from 'sonner';
import { Plus, Building2, Pause, Play, Eye, Search, Trash2 } from 'lucide-react';

export default function TenantsPage() {
  const navigate = useNavigate();
  const { data: tenants = [], isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const suspendTenant = useSuspendTenant();
  const activateTenant = useActivateTenant();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ companyName: '', slug: '', adminEmail: '', adminPassword: '', adminName: '' });

  const filtered = tenants.filter((t: any) => (t.companyName || t.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createTenant.mutateAsync(form);
      toast.success(`Tenant "${form.companyName}" created! Admin: ${result?.adminCredentials?.email}`);
      setShowCreate(false);
      setForm({ companyName: '', slug: '', adminEmail: '', adminPassword: '', adminName: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create tenant'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-slate-900">Tenants</h1><p className="text-slate-500 mt-1">Manage all client accounts</p></div>
        <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />Create Tenant
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>

      {isLoading ? <div className="text-center py-20 text-slate-400">Loading...</div> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Company</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Created</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Building2 className="h-5 w-5 text-indigo-600" /></div>
                      <div>
                        <p className="font-medium text-slate-900">{t.companyName || t.name}</p>
                        <p className="text-xs text-slate-500">{t.adminEmail || t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'active' ? 'bg-green-50 text-green-700' : t.status === 'suspended' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/tenants/${t.id}`)} className="p-1.5 rounded hover:bg-slate-100" title="View Detail"><Eye className="h-4 w-4 text-slate-400" /></button>
                      {t.status === 'active' ? (
                        <button onClick={() => { suspendTenant.mutate(t.id); toast.success('Tenant suspended'); }} className="p-1.5 rounded hover:bg-red-50" title="Suspend"><Pause className="h-4 w-4 text-red-400" /></button>
                      ) : (
                        <button onClick={() => { activateTenant.mutate(t.id); toast.success('Tenant activated'); }} className="p-1.5 rounded hover:bg-green-50" title="Activate"><Play className="h-4 w-4 text-green-500" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500">{filtered.length} tenant(s)</div>
        </div>
      )}

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create New Tenant</h2>
              <p className="text-slate-500 text-sm mt-1">Set up a new client account with admin credentials</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                  <input required value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ABC Corp" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">URL Slug *</label>
                  <input required value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="abc-corp" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Admin Name *</label>
                  <input required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Admin Email *</label>
                  <input required type="email" value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="admin@company.com" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password *</label>
                <input required type="password" minLength={6} value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Min 6 characters" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createTenant.isPending} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {createTenant.isPending ? 'Creating...' : 'Create Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
