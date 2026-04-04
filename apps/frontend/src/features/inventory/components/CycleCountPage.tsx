import { useState, useEffect } from 'react';
import {
  Plus, Clock, PlayCircle, Eye, CheckCircle, ClipboardList, AlertTriangle,
  Search, Filter, MoreHorizontal, Loader2, Target,
  XCircle, Users, Hash, Warehouse,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useCycleCounts, useCycleCount, useCycleCountStats,
  useCreateCycleCount, useStartCycleCount, useSubmitCycleCount,
  useReviewCycleCount, useCompleteCycleCount, useCancelCycleCount,
} from '@/features/inventory/hooks/useCycleCounts';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { useZones } from '@/features/warehouse/hooks/useZones';
import { useUsers } from '@/features/users/hooks/useUsers';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  scheduled: { color: 'text-muted-foreground', bg: 'bg-muted', icon: Clock, label: 'Scheduled' },
  assigned: { color: 'text-info', bg: 'bg-info/10', icon: Users, label: 'Assigned' },
  in_progress: { color: 'text-warning', bg: 'bg-warning/10', icon: PlayCircle, label: 'In Progress' },
  counted: { color: 'text-accent', bg: 'bg-accent/10', icon: Hash, label: 'Counted' },
  under_review: { color: 'text-warning', bg: 'bg-warning/10', icon: Eye, label: 'Under Review' },
  completed: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'text-destructive', bg: 'bg-destructive/10', icon: XCircle, label: 'Cancelled' },
};

const SCOPE_LABELS: Record<string, string> = {
  full_zone: 'Full Zone',
  specific_rack: 'Specific Rack',
  specific_bin: 'Specific Bin',
  sku_based: 'SKU Based',
};

export function CycleCountPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [executeId, setExecuteId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'manager' && user?.warehouseId) setWarehouseFilter(user.warehouseId);
  }, [user]);

  const { data: ccData, isLoading } = useCycleCounts({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    warehouseId: warehouseFilter || undefined,
  });
  const { data: stats, isLoading: statsLoading } = useCycleCountStats(warehouseFilter || undefined);
  const { data: warehouses } = useWarehouses();
  const createCC = useCreateCycleCount();
  const startCC = useStartCycleCount();
  const cancelCC = useCancelCycleCount();
  const completeCC = useCompleteCycleCount();

  const counts = ccData?.data || [];

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="space-y-6">
      {/* Summary Cards — matching wms-card pattern */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Scheduled', value: stats?.scheduled || 0, icon: Clock, iconBg: 'bg-muted', iconColor: 'text-muted-foreground' },
          { title: 'In Progress', value: stats?.inProgress || 0, icon: PlayCircle, iconBg: 'bg-info/10', iconColor: 'text-info' },
          { title: 'Pending Review', value: stats?.pendingReview || 0, icon: Eye, iconBg: 'bg-warning/10', iconColor: 'text-warning' },
          { title: 'Completed This Month', value: stats?.completedThisMonth || 0, icon: CheckCircle, iconBg: 'bg-success/10', iconColor: 'text-success' },
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
            <Input placeholder="Search by count #, name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
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
            <Plus className="h-4 w-4" />New Count
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="wms-card overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Count Records</h3>
              <p className="text-sm text-muted-foreground">{ccData?.meta?.total || 0} total counts</p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : counts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No cycle counts yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Schedule your first physical inventory count to verify stock accuracy.
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />Create Your First Count
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Count #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Variance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counts.map((cc: any) => {
                const sc = STATUS_CONFIG[cc.status] || STATUS_CONFIG.scheduled;
                const StatusIcon = sc.icon;
                return (
                  <TableRow key={cc.id}>
                    <TableCell><span className="font-mono font-semibold text-sm">{cc.countNumber}</span></TableCell>
                    <TableCell><p className="font-medium text-sm truncate max-w-[180px]">{cc.name}</p></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cc.warehouseName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {SCOPE_LABELS[cc.countScope] || cc.countScope}
                      </Badge>
                      {cc.zoneName && <span className="text-xs text-muted-foreground ml-1.5">{cc.zoneName}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                        {cc.itemCount || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{cc.assigneeName || <span className="text-muted-foreground italic text-xs">Unassigned</span>}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(cc.scheduledDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${sc.bg} ${sc.color} border-0 gap-1`}>
                        <StatusIcon className="h-3 w-3" />{sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {cc.varianceCount > 0 ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                          <AlertTriangle className="h-3 w-3" />{cc.varianceCount}
                        </Badge>
                      ) : cc.status === 'completed' ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">None</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {['scheduled', 'assigned'].includes(cc.status) && (
                            <DropdownMenuItem onClick={() => startCC.mutate(cc.id)}>
                              <PlayCircle className="h-4 w-4 mr-2" />Start Counting
                            </DropdownMenuItem>
                          )}
                          {cc.status === 'in_progress' && (
                            <DropdownMenuItem onClick={() => setExecuteId(cc.id)}>
                              <Target className="h-4 w-4 mr-2" />Enter Counts
                            </DropdownMenuItem>
                          )}
                          {['counted', 'under_review'].includes(cc.status) && (
                            <DropdownMenuItem onClick={() => setReviewId(cc.id)}>
                              <Eye className="h-4 w-4 mr-2" />Review Variance
                            </DropdownMenuItem>
                          )}
                          {!['completed', 'cancelled'].includes(cc.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => cancelCC.mutate(cc.id)} className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />Cancel Count
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

      {/* Dialogs */}
      <CreateCycleCountDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createCC} />
      {executeId && <CycleCountExecutionDialog id={executeId} open={!!executeId} onOpenChange={o => !o && setExecuteId(null)} />}
      {reviewId && <CycleCountReviewDialog id={reviewId} open={!!reviewId} onOpenChange={o => !o && setReviewId(null)} onComplete={completeCC} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CREATE CYCLE COUNT DIALOG
   ═══════════════════════════════════════════════════════════ */
function CreateCycleCountDialog({ open, onOpenChange, onCreate }: any) {
  const [form, setForm] = useState({ name: '', warehouseId: '', countScope: 'full_zone', zoneId: '', assignedTo: '', scheduledDate: '', priority: 'medium', instructions: '' });
  const { data: warehouses } = useWarehouses();
  const { data: zonesData } = useZones({ warehouseId: form.warehouseId || undefined });
  const zones = zonesData || [];
  const { data: usersData } = useUsers({ role: 'worker' });
  const workers = usersData?.data || usersData || [];

  const handleSubmit = () => {
    if (!form.name || !form.countScope) return;
    onCreate.mutate(form, { onSuccess: () => { onOpenChange(false); setForm({ name: '', warehouseId: '', countScope: 'full_zone', zoneId: '', assignedTo: '', scheduledDate: '', priority: 'medium', instructions: '' }); } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Schedule Cycle Count</DialogTitle>
          <DialogDescription>Create a physical inventory verification task.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Count Name <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g., Zone B Weekly Count" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Warehouse</Label>
              <Select value={form.warehouseId} onValueChange={v => setForm({ ...form, warehouseId: v })}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Count Scope <span className="text-red-500">*</span></Label>
              <Select value={form.countScope} onValueChange={v => setForm({ ...form, countScope: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_zone">Full Zone</SelectItem>
                  <SelectItem value="specific_rack">Specific Rack</SelectItem>
                  <SelectItem value="specific_bin">Specific Bin</SelectItem>
                  <SelectItem value="sku_based">SKU Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.countScope === 'full_zone' && form.warehouseId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Zone</Label>
              <Select value={form.zoneId} onValueChange={v => setForm({ ...form, zoneId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a zone to count" /></SelectTrigger>
                <SelectContent>{(Array.isArray(zones) ? zones : []).map((z: any) => <SelectItem key={z.id} value={z.id}>{z.name} ({z.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assign To</Label>
              <Select value={form.assignedTo || 'none'} onValueChange={v => setForm({ ...form, assignedTo: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Worker" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {(Array.isArray(workers) ? workers : []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.fullName || w.full_name || w.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Scheduled Date</Label>
              <Input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Instructions for Worker</Label>
            <Textarea placeholder="Any special instructions..." value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={onCreate.isPending} className="gap-2">
            {onCreate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {onCreate.isPending ? 'Creating...' : 'Create Count'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════
   COUNT EXECUTION DIALOG
   ═══════════════════════════════════════════════════════════ */
function CycleCountExecutionDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: cc, isLoading } = useCycleCount(id);
  const submitCC = useSubmitCycleCount();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (cc?.items) {
      const initial: Record<string, number> = {};
      cc.items.forEach((item: any) => { initial[item.id] = item.physicalQty ?? item.systemQty; });
      setCounts(initial);
    }
  }, [cc]);

  const handleSubmit = () => {
    const items = Object.entries(counts).map(([itemId, physicalQty]) => ({ id: itemId, physicalQty }));
    submitCC.mutate({ id, items }, { onSuccess: () => onOpenChange(false) });
  };

  const totalItems = cc?.items?.length || 0;
  const countedItems = Object.keys(counts).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-warning" />Physical Count — {cc?.countNumber}</DialogTitle>
          <DialogDescription>Enter the actual physical count for each SKU.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <>
            <div className="flex items-center gap-4 py-2">
              <Badge variant="outline" className="gap-1"><Hash className="h-3 w-3" />{totalItems} items</Badge>
              <Progress value={(countedItems / Math.max(totalItems, 1)) * 100} className="flex-1 h-2" />
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Code</TableHead>
                    <TableHead>SKU Name</TableHead>
                    <TableHead className="text-right">System Qty</TableHead>
                    <TableHead className="text-right">Physical Count</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(cc?.items || []).map((item: any) => {
                    const physical = counts[item.id] ?? 0;
                    const variance = physical - item.systemQty;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium text-sm">{item.skuCode}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.skuName}</TableCell>
                        <TableCell className="text-right font-medium">{item.systemQty}</TableCell>
                        <TableCell className="text-right">
                          <Input type="number" min={0} value={counts[item.id] ?? ''} onChange={e => setCounts({ ...counts, [item.id]: parseInt(e.target.value) || 0 })}
                            className="w-24 h-9 text-right ml-auto font-medium" />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${variance > 0 ? 'text-info' : variance < 0 ? 'text-destructive' : 'text-success'}`}>
                            {variance > 0 ? `+${variance}` : variance}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitCC.isPending} className="gap-2">
            {submitCC.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {submitCC.isPending ? 'Submitting...' : 'Submit Count'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════
   VARIANCE REVIEW DIALOG
   ═══════════════════════════════════════════════════════════ */
function CycleCountReviewDialog({ id, open, onOpenChange, onComplete }: { id: string; open: boolean; onOpenChange: (o: boolean) => void; onComplete: any }) {
  const { data: cc, isLoading } = useCycleCount(id);
  const reviewCC = useReviewCycleCount();
  const [actions, setActions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cc?.items) {
      const initial: Record<string, string> = {};
      cc.items.forEach((item: any) => { initial[item.id] = item.action || (item.variance === 0 ? 'approved' : ''); });
      setActions(initial);
    }
  }, [cc]);

  const handleReview = () => {
    const items = Object.entries(actions).filter(([_, a]) => a).map(([itemId, action]) => ({ id: itemId, action }));
    reviewCC.mutate({ id, items });
  };

  const handleComplete = () => {
    onComplete.mutate(id, { onSuccess: () => onOpenChange(false) });
  };

  const allReviewed = cc?.items?.every((item: any) => actions[item.id]);
  const varianceItems = (cc?.items || []).filter((i: any) => i.variance !== null && i.variance !== 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-accent" />Variance Review — {cc?.countNumber}</DialogTitle>
          <DialogDescription>
            {varianceItems.length} item(s) have variance. Review each: Approve, Reject (recount), or Escalate.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="border rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">System</TableHead>
                  <TableHead className="text-right">Counted</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(cc?.items || []).map((item: any) => (
                  <TableRow key={item.id} className={item.variance && item.variance !== 0 ? 'bg-destructive/5' : ''}>
                    <TableCell>
                      <p className="font-mono font-medium text-sm">{item.skuCode}</p>
                      <p className="text-[10px] text-muted-foreground">{item.skuName}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.systemQty}</TableCell>
                    <TableCell className="text-right font-medium">{item.physicalQty ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${item.variance && item.variance !== 0 ? 'text-destructive' : 'text-success'}`}>
                        {item.variance !== null ? (item.variance > 0 ? `+${item.variance}` : item.variance) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{item.variancePercent !== null ? `${item.variancePercent}%` : '-'}</TableCell>
                    <TableCell>
                      {item.variance !== null && item.variance !== 0 ? (
                        <Select value={actions[item.id] || 'pending'} onValueChange={v => setActions({ ...actions, [item.id]: v === 'pending' ? '' : v })}>
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Action" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approve</SelectItem>
                            <SelectItem value="rejected">Reject (Recount)</SelectItem>
                            <SelectItem value="escalated">Escalate</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Match</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="outline" onClick={handleReview} disabled={reviewCC.isPending} className="gap-2">
            {reviewCC.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save Review
          </Button>
          <Button onClick={handleComplete} disabled={!allReviewed || onComplete.isPending} className="gap-2">
            {onComplete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {onComplete.isPending ? 'Completing...' : 'Complete Count'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
