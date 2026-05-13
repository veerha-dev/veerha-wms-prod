import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { History, RefreshCw, Search } from 'lucide-react';
import { api } from '@/shared/lib/api';

interface AuditRow {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  httpMethod: string | null;
  httpPath: string | null;
  statusCode: number | null;
  requestBody: any;
  responseBody: any;
  before: any;
  after: any;
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700 border-green-300',
  update: 'bg-blue-100 text-blue-700 border-blue-300',
  delete: 'bg-red-100 text-red-700 border-red-300',
  approve: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  reject: 'bg-rose-100 text-rose-700 border-rose-300',
  complete: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  cancel: 'bg-gray-100 text-gray-700 border-gray-300',
  invite: 'bg-purple-100 text-purple-700 border-purple-300',
  force_logout: 'bg-orange-100 text-orange-700 border-orange-300',
  login: 'bg-cyan-100 text-cyan-700 border-cyan-300',
};

export default function SystemAuditLogPage() {
  const [search, setSearch] = useState('');
  const [module, setModule] = useState<string>('all');
  const [action, setAction] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<AuditRow | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', search, module, action, startDate, endDate],
    queryFn: async () => {
      const params: any = { limit: 200 };
      if (search) params.search = search;
      if (module !== 'all') params.module = module;
      if (action !== 'all') params.action = action;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/api/v1/audit-logs', { params });
      return res.data as { data: AuditRow[]; meta: any };
    },
  });

  const rows = data?.data || [];

  return (
    <AppLayout title="Audit Log" breadcrumbs={[{ label: 'Reports' }, { label: 'Audit Log' }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <History className="h-7 w-7" /> System Audit Log
            </h1>
            <p className="text-muted-foreground">Every mutation across the tenant, captured automatically</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search user, module, entity…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={module} onValueChange={setModule}>
              <SelectTrigger><SelectValue placeholder="All modules" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                {['skus', 'warehouses', 'users', 'invoices', 'grn', 'sales-orders', 'pick-lists', 'shipments', 'putaway', 'adjustments', 'stock-transfers', 'tasks', 'auth', 'onboarding', 'settings'].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {['create', 'update', 'delete', 'approve', 'reject', 'complete', 'cancel', 'invite', 'login', 'signup', 'force_logout', 'reset_password'].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{isLoading ? 'Loading…' : `${rows.length} entries`}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelected(r)}
                  >
                    <TableCell className="font-mono text-xs">
                      {r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy HH:mm:ss') : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium">{r.userName || r.userEmail || '—'}</div>
                      <div className="text-[10px] text-muted-foreground">{r.userRole}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{r.module}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ACTION_COLORS[r.action] || ''}>{r.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.entityType && <div className="text-muted-foreground">{r.entityType}</div>}
                      {r.entityId && <div className="font-mono">{r.entityId.slice(0, 8)}…</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.statusCode && r.statusCode < 300 ? 'outline' : 'destructive'}>
                        {r.statusCode || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{r.ipAddress || '—'}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No audit entries match the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full max-w-2xl overflow-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Audit entry</SheetTitle>
            <SheetDescription>{selected?.httpMethod} {selected?.httpPath}</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4 text-sm">
              <KV label="Timestamp" value={selected.createdAt ? format(new Date(selected.createdAt), 'dd MMM yyyy HH:mm:ss') : '-'} />
              <KV label="User" value={`${selected.userName || ''} <${selected.userEmail || '—'}> · ${selected.userRole || ''}`} />
              <KV label="Module / action" value={`${selected.module} · ${selected.action}`} />
              <KV label="Entity" value={`${selected.entityType || '-'} · ${selected.entityId || '-'}`} />
              <KV label="Status / duration" value={`${selected.statusCode || '-'} · ${selected.durationMs ?? '-'} ms`} />
              <KV label="IP / UA" value={`${selected.ipAddress || '-'} · ${selected.userAgent || '-'}`} />
              <CollapsibleJson title="Request body" value={selected.requestBody} />
              <CollapsibleJson title="Response body" value={selected.responseBody} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-all">{value}</div>
    </div>
  );
}

function CollapsibleJson({ title, value }: { title: string; value: any }) {
  if (value == null) return null;
  return (
    <details className="rounded border bg-muted/30 p-2">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</summary>
      <pre className="mt-2 overflow-auto rounded bg-background p-2 text-[11px]">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
