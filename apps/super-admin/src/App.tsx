import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TenantsPage from '@/pages/TenantsPage';
import TenantDetailPage from '@/pages/TenantDetailPage';
import AuditLogPage from '@/pages/AuditLogPage';
import { Building2, LayoutDashboard, LogOut, Shield, ScrollText } from 'lucide-react';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } });

function Sidebar() {
  const loc = useLocation();
  const { logout } = useAuth();
  const nav = useNavigate();

  const sections = [
    { label: '', links: [{ path: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
    { label: 'CLIENTS', links: [
      { path: '/tenants', icon: Building2, label: 'All Clients' },
    ]},
    { label: 'SYSTEM', links: [
      { path: '/audit-log', icon: ScrollText, label: 'Audit Log' },
    ]},
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">VEERHA</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && <p className="text-[10px] text-slate-500 uppercase tracking-widest px-3 mb-1">{section.label}</p>}
            <div className="space-y-0.5">
              {section.links.map(l => {
                const active = l.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(l.path);
                return (
                  <Link key={l.path} to={l.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <l.icon className="h-4 w-4" />{l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button onClick={() => { logout(); nav('/login'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </div>
    </aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen p-8 bg-slate-50">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/tenants" element={<Layout><TenantsPage /></Layout>} />
          <Route path="/tenants/:id" element={<Layout><TenantDetailPage /></Layout>} />
          <Route path="/audit-log" element={<Layout><AuditLogPage /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
