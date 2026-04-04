import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTenant, useUsage, useTenantUsers, useTenantWarehouses, useTenantNotes, useAddTenantNote } from '@/hooks/useTenants';
import { ArrowLeft, Building2, Users, Package, MessageSquare, Loader2 } from 'lucide-react';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenant, isLoading } = useTenant(id!);
  const { data: usage } = useUsage(id!);
  const { data: users } = useTenantUsers(id!);
  const { data: warehouses } = useTenantWarehouses(id!);
  const { data: notes } = useTenantNotes(id!);
  const addNote = useAddTenantNote();
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (!tenant) return <div className="text-center py-20 text-slate-500">Tenant not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'warehouses', label: 'Warehouses', icon: Package },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];

  const usageItems = usage ? [
    { label: 'SKUs', used: usage.skuCount, max: tenant.maxSkus },
    { label: 'Users', used: usage.userCount, max: tenant.maxUsers },
    { label: 'Warehouses', used: usage.warehouseCount, max: tenant.maxWarehouses },
    { label: 'Workers', used: usage.workerCount, max: tenant.maxWorkers },
  ] : [];

  return (
    <div>
      <Link to="/tenants" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" />Back to Clients
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tenant.companyName || tenant.name || 'Client'}</h1>
            <p className="text-sm text-slate-500">{tenant.adminEmail} | {tenant.slug}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {tenant.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg border p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Company Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Company</span><span>{tenant.companyName || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Admin Email</span><span>{tenant.adminEmail || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span>{tenant.phone || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">City</span><span>{tenant.city || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">GST</span><span>{tenant.gstNumber || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span>{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Usage</h3>
            <div className="space-y-4">
              {usageItems.map(item => {
                const pct = item.max > 0 ? Math.round((item.used / item.max) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className={pct > 90 ? 'text-red-600 font-medium' : ''}>{item.used} / {item.max}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b"><h3 className="font-semibold">Users ({(users || []).length})</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left p-3 font-medium">Name</th><th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th><th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Last Login</th>
            </tr></thead>
            <tbody>
              {(users || []).map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-slate-100">{u.role}</span></td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-3 text-slate-500">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.length === 0) && <p className="text-center py-8 text-slate-400">No users found</p>}
        </div>
      )}

      {activeTab === 'warehouses' && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b"><h3 className="font-semibold">Warehouses ({(warehouses || []).length})</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left p-3 font-medium">Name</th><th className="text-left p-3 font-medium">City</th>
              <th className="text-left p-3 font-medium">Type</th><th className="text-left p-3 font-medium">Utilization</th>
              <th className="text-left p-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {(warehouses || []).map((w: any) => (
                <tr key={w.id} className="border-t">
                  <td className="p-3 font-medium">{w.name}</td>
                  <td className="p-3 text-slate-500">{w.city || '-'}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-slate-100 capitalize">{w.type}</span></td>
                  <td className="p-3">{w.utilization}%</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">{w.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!warehouses || warehouses.length === 0) && <p className="text-center py-8 text-slate-400">No warehouses found</p>}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Internal Notes</h3>
          <div className="flex gap-2 mb-4">
            <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm" onKeyDown={e => {
                if (e.key === 'Enter' && noteText.trim()) { addNote.mutate({ id: id!, text: noteText }); setNoteText(''); }
              }} />
            <button onClick={() => { if (noteText.trim()) { addNote.mutate({ id: id!, text: noteText }); setNoteText(''); } }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Add Note</button>
          </div>
          <div className="space-y-3">
            {(notes || []).slice().reverse().map((note: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm">{note.text}</p>
                <p className="text-[10px] text-slate-400 mt-1">{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</p>
              </div>
            ))}
            {(!notes || notes.length === 0) && <p className="text-sm text-slate-400">No notes yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}
