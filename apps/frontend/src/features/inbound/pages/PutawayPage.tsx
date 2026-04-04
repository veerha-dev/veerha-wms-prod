import { useState, useEffect } from 'react';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { Plus, PackageOpen, Clock, PlayCircle, CheckCircle, Boxes, MapPin, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  usePutawayTasks, usePutawayStats, useCreatePutaway, useGenerateFromGrn,
  useSuggestBins, useSuggestBinsPreview, useAssignBin, useStartPutaway, useCompletePutaway, useCancelPutaway,
} from '@/features/inbound/hooks/usePutaway';
import { useGRNs, useGRN } from '@/features/inbound/hooks/useGRN';
import { useSKUs } from '@/features/inventory/hooks/useSKUs';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { useUsers } from '@/features/users/hooks/useUsers';

export default function PutawayPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [assignBinOpen, setAssignBinOpen] = useState<string | null>(null);

  // Auto-scope manager to their warehouse
  useEffect(() => {
    if (isManager && user?.warehouseId) {
      setWarehouseFilter(user.warehouseId);
    }
  }, [isManager, user?.warehouseId]);

  const effectiveWarehouseId = warehouseFilter || undefined;

  const { data: tasksData, isLoading } = usePutawayTasks({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    warehouseId: effectiveWarehouseId,
  });
  const { data: stats } = usePutawayStats(effectiveWarehouseId);
  const { data: warehouses } = useWarehouses();
  const createPutaway = useCreatePutaway();
  const generateFromGrn = useGenerateFromGrn();
  const assignBin = useAssignBin();
  const startPutaway = useStartPutaway();
  const completePutaway = useCompletePutaway();
  const cancelPutaway = useCancelPutaway();

  const tasks = tasksData?.data || [];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      assigned: { variant: 'default', icon: MapPin, label: 'Assigned' },
      in_progress: { variant: 'default', icon: PlayCircle, label: 'In Progress' },
      completed: { variant: 'default', icon: CheckCircle, label: 'Completed' },
      cancelled: { variant: 'destructive', icon: Clock, label: 'Cancelled' },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return <Badge variant={c.variant} className="gap-1"><Icon className="h-3 w-3" />{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return <Badge className={colors[priority] || colors.medium}>{priority}</Badge>;
  };

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout title="Putaway" breadcrumbs={[{ label: 'Inbound', href: '/inbound' }, { label: 'Putaway' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Putaway Management</h1>
            <p className="text-muted-foreground">Assign received goods to storage locations</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Putaway
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Putaways</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.pending || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <PlayCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{stats?.inProgress || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{stats?.completedToday || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items to Putaway</CardTitle>
              <Boxes className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{stats?.itemsToPutaway || 0}</div><p className="text-xs text-muted-foreground">total units</p></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="Search by PA#, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Select value={warehouseFilter || 'all'} onValueChange={(v) => setWarehouseFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Task Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PA #</TableHead>
                    <TableHead>GRN #</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Suggested Bin</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task: any) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.putawayNumber}</TableCell>
                      <TableCell>{task.grn?.grnNumber || task.grnNumber || '-'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-xs">{task.sku?.code || task.skuCode || '-'}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{task.sku?.name || task.skuName || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>{task.quantity}</TableCell>
                      <TableCell>
                        {task.destinationBin?.code ? (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <MapPin className="h-3 w-3" />{task.destinationBin.code}
                          </Badge>
                        ) : task.suggestedBin?.code ? (
                          <span className="text-xs text-muted-foreground">{task.suggestedBin.code}</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{task.assignee?.fullName || task.assignee?.full_name || '-'}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(task.createdAt || task.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {task.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => setAssignBinOpen(task.id)}>
                              <MapPin className="h-3 w-3 mr-1" />Assign
                            </Button>
                          )}
                          {task.status === 'assigned' && (
                            <Button size="sm" onClick={() => startPutaway.mutate(task.id)}>
                              <PlayCircle className="h-3 w-3 mr-1" />Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button size="sm" onClick={() => completePutaway.mutate(task.id)}>
                              <CheckCircle className="h-3 w-3 mr-1" />Complete
                            </Button>
                          )}
                          {['pending', 'assigned'].includes(task.status) && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelPutaway.mutate(task.id)}>Cancel</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {tasks.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium">No putaway tasks</p>
                <p className="text-sm text-muted-foreground mt-1">Create a new putaway task to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Create Putaway Dialog */}
      <CreatePutawayDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={createPutaway}
        onGenerateFromGrn={generateFromGrn}
        defaultWarehouseId={isManager ? user?.warehouseId || '' : ''}
        isManager={isManager}
      />

      {/* Assign Bin Dialog (for existing tasks) */}
      {assignBinOpen && (
        <AssignBinDialog
          taskId={assignBinOpen}
          open={!!assignBinOpen}
          onOpenChange={(open) => !open && setAssignBinOpen(null)}
          onAssign={assignBin}
        />
      )}
    </AppLayout>
  );
}

/* ============================================
   CONSOLIDATED CREATE PUTAWAY DIALOG
   ============================================ */
function CreatePutawayDialog({ open, onOpenChange, onCreate, onGenerateFromGrn, defaultWarehouseId, isManager }: any) {
  const [mode, setMode] = useState<'manual' | 'grn'>('grn');
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [selectedGrnItemIdx, setSelectedGrnItemIdx] = useState<number>(0);
  const [form, setForm] = useState({
    skuId: '', warehouseId: defaultWarehouseId || '', quantity: 1,
    priority: 'medium', notes: '', assignedTo: '', overrideBinId: '',
  });

  const { data: grnsData } = useGRNs({ status: 'completed' });
  const grns = grnsData?.data || [];
  const { data: selectedGrn } = useGRN(selectedGrnId || null);
  const grnItems = selectedGrn?.items || [];
  const { data: skus } = useSKUs();
  const { data: warehouses } = useWarehouses();
  const { data: usersData } = useUsers({ role: 'worker' });
  const workers = usersData?.data || usersData || [];

  // Bin suggestion preview
  const previewSkuId = mode === 'grn' && grnItems[selectedGrnItemIdx] ? grnItems[selectedGrnItemIdx].skuId : form.skuId;
  const previewWhId = mode === 'grn' && selectedGrn ? (selectedGrn.warehouseId || selectedGrn.warehouse_id) : form.warehouseId;
  const { data: suggestedBins } = useSuggestBinsPreview(previewWhId || null, previewSkuId || null);
  const topSuggestion = suggestedBins?.[0];

  // Auto-fill from GRN item
  useEffect(() => {
    if (mode === 'grn' && grnItems[selectedGrnItemIdx]) {
      const item = grnItems[selectedGrnItemIdx];
      setForm(prev => ({
        ...prev,
        skuId: item.skuId,
        quantity: item.quantityReceived || item.quantity_received || item.quantityExpected || 1,
        warehouseId: selectedGrn?.warehouseId || selectedGrn?.warehouse_id || prev.warehouseId,
      }));
    }
  }, [mode, selectedGrnId, selectedGrnItemIdx, grnItems, selectedGrn]);

  const resetForm = () => {
    setMode('grn');
    setSelectedGrnId('');
    setSelectedGrnItemIdx(0);
    setForm({ skuId: '', warehouseId: defaultWarehouseId || '', quantity: 1, priority: 'medium', notes: '', assignedTo: '', overrideBinId: '' });
  };

  const handleSubmit = () => {
    const skuId = previewSkuId;
    const warehouseId = previewWhId;
    if (!skuId || !warehouseId) { toast.error('SKU and Warehouse are required'); return; }

    const payload: any = {
      skuId,
      warehouseId,
      quantity: form.quantity,
      priority: form.priority,
      notes: form.notes || undefined,
      grnId: mode === 'grn' ? selectedGrnId : undefined,
      grnItemId: mode === 'grn' && grnItems[selectedGrnItemIdx] ? grnItems[selectedGrnItemIdx].id : undefined,
      suggestedBinId: topSuggestion?.binId || undefined,
      destinationBinId: form.overrideBinId || topSuggestion?.binId || undefined,
      assignedTo: form.assignedTo || undefined,
    };

    onCreate.mutate(payload, {
      onSuccess: () => { onOpenChange(false); resetForm(); },
    });
  };

  const handleGenerateAll = () => {
    if (!selectedGrnId) return;
    onGenerateFromGrn.mutate(selectedGrnId, {
      onSuccess: () => { onOpenChange(false); resetForm(); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Putaway Task</DialogTitle>
          <DialogDescription>Create a putaway task from a GRN or manually select items</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode Toggle */}
          <div className="flex gap-2 border rounded-lg p-1 bg-muted/30">
            <Button variant={mode === 'grn' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setMode('grn')}>From GRN</Button>
            <Button variant={mode === 'manual' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setMode('manual')}>Manual</Button>
          </div>

          {/* GRN Selection */}
          {mode === 'grn' && (
            <>
              <div className="space-y-2">
                <Label>GRN Reference *</Label>
                <Select value={selectedGrnId} onValueChange={(v) => { setSelectedGrnId(v); setSelectedGrnItemIdx(0); }}>
                  <SelectTrigger><SelectValue placeholder="Select completed GRN" /></SelectTrigger>
                  <SelectContent>
                    {grns.map((g: any) => (
                      <SelectItem key={g.id} value={g.id}>{g.grnNumber || g.grn_number} — {g.purchaseOrder?.poNumber || g.poNumber || 'No PO'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {grnItems.length > 0 && (
                <div className="space-y-2">
                  <Label>SKU (from GRN)</Label>
                  <Select value={String(selectedGrnItemIdx)} onValueChange={(v) => setSelectedGrnItemIdx(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {grnItems.map((item: any, idx: number) => (
                        <SelectItem key={idx} value={String(idx)}>{item.skuCode} — {item.skuName} (Qty: {item.quantityReceived || item.quantity_received})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedGrnId && grnItems.length > 1 && (
                <Button variant="outline" size="sm" onClick={handleGenerateAll} disabled={onGenerateFromGrn.isPending} className="w-full">
                  {onGenerateFromGrn.isPending ? 'Generating...' : `Generate All ${grnItems.length} Items from GRN`}
                </Button>
              )}
            </>
          )}

          {/* Manual SKU Selection */}
          {mode === 'manual' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Select value={form.skuId} onValueChange={(v) => setForm({ ...form, skuId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                  <SelectContent>
                    {(skus || []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse *</Label>
                <Select value={form.warehouseId} onValueChange={(v) => setForm({ ...form, warehouseId: v })} disabled={isManager && !!defaultWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Quantity & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Suggested Bin */}
          {topSuggestion && (
            <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3">
              <Label className="text-xs text-muted-foreground mb-1 block">Suggested Bin</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{topSuggestion.binCode}</span>
                  <span className="text-xs text-muted-foreground">{topSuggestion.zoneName} → {topSuggestion.rackCode}</span>
                </div>
                <Badge variant="outline" className="text-xs">Score: {topSuggestion.score}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{topSuggestion.reason}</p>
            </div>
          )}

          {/* Override Bin */}
          <div className="space-y-2">
            <Label>Override Bin (optional)</Label>
            <Input value={form.overrideBinId} onChange={(e) => setForm({ ...form, overrideBinId: e.target.value })} placeholder="Enter bin ID to override suggestion" />
          </div>

          {/* Assign To */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Assign To (optional)</Label>
            <Select value={form.assignedTo || 'none'} onValueChange={(v) => setForm({ ...form, assignedTo: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {(Array.isArray(workers) ? workers : []).map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.fullName || w.full_name || w.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes for this putaway task" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={onCreate.isPending}>
            {onCreate.isPending ? 'Creating...' : 'Create Putaway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================
   ASSIGN BIN DIALOG (for existing pending tasks)
   ============================================ */
function AssignBinDialog({ taskId, open, onOpenChange, onAssign }: any) {
  const [selectedBin, setSelectedBin] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const { data: suggestions = [], isLoading } = useSuggestBins(taskId);
  const { data: usersData } = useUsers({ role: 'worker' });
  const workers = usersData?.data || usersData || [];

  const handleAssign = () => {
    if (!selectedBin) return;
    onAssign.mutate(
      { taskId, binId: selectedBin, assignedTo: assignedTo && assignedTo !== 'none' ? assignedTo : undefined },
      { onSuccess: () => { onOpenChange(false); setSelectedBin(''); setAssignedTo(''); } },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Bin & Worker</DialogTitle>
          <DialogDescription>Select a storage bin and optionally assign a worker for this task.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-2">
              <Label>Smart Suggestions</Label>
              {suggestions.map((s: any) => (
                <div
                  key={s.binId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBin === s.binId ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedBin(s.binId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{s.binCode}</p>
                        <p className="text-xs text-muted-foreground">{s.zoneName} → {s.rackCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">Score: {s.score}</Badge>
                      <p className="text-[10px] text-muted-foreground">{s.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No suggestions. Select manually below.</p>
          )}
          <div className="space-y-2">
            <Label>Or enter Bin ID manually</Label>
            <Input value={selectedBin} onChange={(e) => setSelectedBin(e.target.value)} placeholder="Bin UUID" />
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2 border-t pt-4">
            <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Assign To Worker (optional)</Label>
            <Select value={assignedTo || 'none'} onValueChange={(v) => setAssignedTo(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {(Array.isArray(workers) ? workers : []).map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.fullName || w.full_name || w.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedBin || onAssign.isPending}>
            {onAssign.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
