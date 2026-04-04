import { useState, useEffect } from 'react';
import {
  Plus, Clock, Truck, CheckCircle, ArrowLeftRight, ArrowRight,
  Search, Filter, MoreHorizontal, Loader2, XCircle, Warehouse,
  MapPin, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useStockTransfers, useStockTransferStats, useCreateStockTransfer,
  useApproveStockTransfer, useStartTransit, useCompleteStockTransfer, useCancelStockTransfer,
} from '@/features/inventory/hooks/useStockTransfers';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { useZones } from '@/features/warehouse/hooks/useZones';
import { useSKUs } from '@/features/inventory/hooks/useSKUs';
import { useUsers } from '@/features/users/hooks/useUsers';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  requested: { color: 'text-warning', bg: 'bg-warning/10', icon: Clock, label: 'Requested' },
  approved: { color: 'text-info', bg: 'bg-info/10', icon: ShieldCheck, label: 'Approved' },
  in_transit: { color: 'text-warning', bg: 'bg-warning/10', icon: Truck, label: 'In Transit' },
  completed: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle, label: 'Cancelled' },
};

const REASONS = ['Rebalancing', 'Replenishment', 'Damaged Relocation', 'Customer Order', 'Other'];

export function StockTransferPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'manager' && user?.warehouseId) setWarehouseFilter(user.warehouseId);
  }, [user]);

  const { data: tfData, isLoading } = useStockTransfers({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    warehouseId: warehouseFilter || undefined,
  });
  const { data: stats, isLoading: statsLoading } = useStockTransferStats(warehouseFilter || undefined);
  const { data: warehouses } = useWarehouses();
  const approveTf = useApproveStockTransfer();
  const startTf = useStartTransit();
  const completeTf = useCompleteStockTransfer();
  const cancelTf = useCancelStockTransfer();

  const transfers = tfData?.data || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards — matching wms-card pattern */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Pending Transfers', value: stats?.pending || 0, icon: Clock, iconBg: 'bg-warning/10', iconColor: 'text-warning' },
          { title: 'In Transit', value: stats?.inTransit || 0, icon: Truck, iconBg: 'bg-info/10', iconColor: 'text-info' },
          { title: 'Completed Today', value: stats?.completedToday || 0, icon: CheckCircle, iconBg: 'bg-success/10', iconColor: 'text-success' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="wms-card p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by transfer #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Select value={warehouseFilter || 'all'} onValueChange={v => setWarehouseFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]"><Warehouse className="h-3.5 w-3.5 mr-2 text-muted-foreground" /><SelectValue placeholder="All Warehouses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => setCreateOpen(true)} className="gap-2 ml-auto">
            <Plus className="h-4 w-4" />New Transfer
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Transfer Records</h3>
              <p className="text-sm text-muted-foreground">{tfData?.meta?.total || 0} total transfers</p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No stock transfers yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Transfer inventory between warehouses or relocate within the same warehouse.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />Create Your First Transfer
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead className="text-center w-8"><ArrowRight className="h-3.5 w-3.5 mx-auto" /></TableHead>
                <TableHead>To</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((tf: any) => {
                const sc = STATUS_CONFIG[tf.status] || STATUS_CONFIG.requested;
                const StatusIcon = sc.icon;
                return (
                  <TableRow key={tf.id}>
                    <TableCell><span className="font-mono font-semibold text-sm">{tf.transferNumber}</span></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tf.transferType === 'inter-warehouse' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-info/10 text-info border-info/20'}>
                        {tf.transferType === 'inter-warehouse' ? 'Inter-WH' : 'Intra-WH'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-destructive/60" />
                        <div>
                          <p className="text-sm font-medium">{tf.sourceWarehouseName || '-'}</p>
                          {tf.sourceBinCode && <p className="text-[10px] text-muted-foreground">Bin: {tf.sourceBinCode}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center"><ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-success/60" />
                        <div>
                          <p className="text-sm font-medium">{tf.destWarehouseName || tf.sourceWarehouseName || '-'}</p>
                          {tf.destBinCode && <p className="text-[10px] text-muted-foreground">Bin: {tf.destBinCode}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">{tf.skuCode || '-'}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{tf.skuName || ''}</p>
                    </TableCell>
                    <TableCell className="text-right font-bold">{tf.quantity}</TableCell>
                    <TableCell>
                      {tf.reason ? <Badge variant="outline" className="text-xs font-normal">{tf.reason}</Badge> : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${sc.bg} ${sc.color} border-0 gap-1`}>
                        <StatusIcon className="h-3 w-3" />{sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {tf.status === 'requested' && (
                            <DropdownMenuItem onClick={() => approveTf.mutate(tf.id)}>
                              <ShieldCheck className="h-4 w-4 mr-2" />Approve
                            </DropdownMenuItem>
                          )}
                          {tf.status === 'approved' && (
                            <DropdownMenuItem onClick={() => startTf.mutate(tf.id)}>
                              <Truck className="h-4 w-4 mr-2" />Start Transit
                            </DropdownMenuItem>
                          )}
                          {tf.status === 'in_transit' && (
                            <DropdownMenuItem onClick={() => completeTf.mutate(tf.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />Mark Completed
                            </DropdownMenuItem>
                          )}
                          {!['completed', 'cancelled'].includes(tf.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => cancelTf.mutate(tf.id)} className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />Cancel Transfer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateTransferDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CREATE TRANSFER DIALOG
   ═══════════════════════════════════════════════════════════ */
function CreateTransferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({
    transferType: 'intra-warehouse', sourceWarehouseId: '', sourceZoneId: '', destWarehouseId: '', destZoneId: '',
    skuId: '', quantity: 1, reason: '', priority: 'medium', assignedTo: '', notes: '',
  });
  const { data: warehouses } = useWarehouses();
  const { data: srcZones } = useZones({ warehouseId: form.sourceWarehouseId || undefined });
  const { data: destZones } = useZones({ warehouseId: (form.transferType === 'inter-warehouse' ? form.destWarehouseId : form.sourceWarehouseId) || undefined });
  const { data: skusData } = useSKUs();
  const { data: usersData } = useUsers({ role: 'worker' });
  const createTf = useCreateStockTransfer();
  const skus = skusData || [];
  const workers = usersData?.data || usersData || [];

  const handleSubmit = () => {
    if (!form.sourceWarehouseId || !form.skuId || form.quantity < 1) return;
    createTf.mutate(form, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-primary" />New Stock Transfer</DialogTitle>
          <DialogDescription>Move inventory between locations.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
            <Button variant={form.transferType === 'intra-warehouse' ? 'default' : 'ghost'} size="sm" className="flex-1 gap-2" onClick={() => setForm({ ...form, transferType: 'intra-warehouse' })}>
              <ArrowLeftRight className="h-3.5 w-3.5" />Within Warehouse
            </Button>
            <Button variant={form.transferType === 'inter-warehouse' ? 'default' : 'ghost'} size="sm" className="flex-1 gap-2" onClick={() => setForm({ ...form, transferType: 'inter-warehouse' })}>
              <Truck className="h-3.5 w-3.5" />Between Warehouses
            </Button>
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Source Warehouse <span className="text-red-500">*</span></Label>
              <Select value={form.sourceWarehouseId} onValueChange={v => setForm({ ...form, sourceWarehouseId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Source Zone</Label>
              <Select value={form.sourceZoneId} onValueChange={v => setForm({ ...form, sourceZoneId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{(srcZones || []).map((z: any) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Destination */}
          <div className="grid grid-cols-2 gap-3">
            {form.transferType === 'inter-warehouse' && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Dest Warehouse <span className="text-red-500">*</span></Label>
                <Select value={form.destWarehouseId} onValueChange={v => setForm({ ...form, destWarehouseId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm">Dest Zone</Label>
              <Select value={form.destZoneId} onValueChange={v => setForm({ ...form, destZoneId: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{(destZones || []).map((z: any) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">SKU <span className="text-red-500">*</span></Label>
              <Select value={form.skuId} onValueChange={v => setForm({ ...form, skuId: v })}>
                <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                <SelectContent>{(Array.isArray(skus) ? skus : []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Quantity <span className="text-red-500">*</span></Label>
              <Input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Reason</Label>
              <Select value={form.reason || 'none'} onValueChange={v => setForm({ ...form, reason: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select reason</SelectItem>
                  {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Assign To</Label>
              <Select value={form.assignedTo || 'none'} onValueChange={v => setForm({ ...form, assignedTo: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Worker" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {(Array.isArray(workers) ? workers : []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.fullName || w.full_name || w.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createTf.isPending} className="gap-2">
            {createTf.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            {createTf.isPending ? 'Creating...' : 'Create Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
