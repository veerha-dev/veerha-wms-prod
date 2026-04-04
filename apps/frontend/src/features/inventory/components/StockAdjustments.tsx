import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { format } from 'date-fns';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { useWMS } from '@/shared/contexts/WMSContext';
import { toast } from 'sonner';

const defaultSettings = {
  stockLockingEnabled: true,
  negativeStockAllowed: false,
  fifoPreference: 'fifo' as const,
  autoBlockExpired: true,
  lowStockThreshold: 10,
  expiryAlertDays: 30,
  overstockThreshold: 90,
  adjustmentApprovalRequired: true,
  maxAdjustmentWithoutApproval: 100,
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  approved: { label: 'Approved', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

const reasonCategories = [
  { value: 'count-mismatch', label: 'Physical Count Mismatch' },
  { value: 'data-correction', label: 'Data Correction' },
  { value: 'audit', label: 'Audit Adjustment' },
  { value: 'damage', label: 'Damage Write-off' },
  { value: 'other', label: 'Other' },
];

export function StockAdjustments() {
  const { adjustments, stockLevels, skus, createAdjustment, approveAdjustment, rejectAdjustment } = useInventory();
  const { currentUser, warehouses } = useWMS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<typeof adjustments[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  
  // New adjustment form
  const [newAdjustment, setNewAdjustment] = useState({
    skuId: '',
    warehouseId: '',
    stockLevelId: '',
    currentQty: 0,
    newQty: '',
    reasonCategory: '',
    reason: '',
  });

  const isAdmin = currentUser?.role === 'admin';
  const settings = defaultSettings;

  const filteredAdjustments = adjustments.filter((adj) => {
    const matchesSearch = adj.adjustmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adj.skuCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || adj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = adjustments.filter(a => a.status === 'pending').length;
  const approvedCount = adjustments.filter(a => a.status === 'approved').length;
  const rejectedCount = adjustments.filter(a => a.status === 'rejected').length;

  const handleSelectSKU = (skuId: string) => {
    const stockLevel = stockLevels.find(s => s.skuId === skuId);
    setNewAdjustment({
      ...newAdjustment,
      skuId,
      warehouseId: stockLevel?.warehouseId || '',
      stockLevelId: stockLevel?.id || '',
      currentQty: stockLevel?.quantityAvailable || 0,
    });
  };

  const handleCreateAdjustment = async () => {
    if (!newAdjustment.skuId || !newAdjustment.newQty || !newAdjustment.reasonCategory || !newAdjustment.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const sku = skus.find(s => s.id === newAdjustment.skuId);
    if (!sku) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newQty = parseInt(newAdjustment.newQty);
    const adjustmentQty = newQty - newAdjustment.currentQty;

    createAdjustment({
      skuId: sku.id,
      skuCode: sku.code,
      skuName: sku.name,
      location: newAdjustment.warehouseId, // Use warehouse UUID
      quantityBefore: newAdjustment.currentQty,
      quantityAfter: newQty,
      adjustmentQty,
      reason: newAdjustment.reason,
      reasonCategory: newAdjustment.reasonCategory as 'count-mismatch' | 'data-correction' | 'audit' | 'damage' | 'other',
      requestedBy: currentUser?.name || 'Unknown',
    });

    setIsLoading(false);
    setIsCreateOpen(false);
    setNewAdjustment({
      skuId: '',
      warehouseId: '',
      stockLevelId: '',
      currentQty: 0,
      newQty: '',
      reasonCategory: '',
      reason: '',
    });
    
    toast.success('Adjustment submitted', {
      description: 'Pending admin approval',
    });
  };

  const handleApprove = async () => {
    if (!selectedAdjustment) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    approveAdjustment(selectedAdjustment.id, currentUser?.name || 'Admin');

    setIsLoading(false);
    setIsApproveOpen(false);
    setSelectedAdjustment(null);
    setApprovalNotes('');
    
    toast.success('Adjustment approved', {
      description: 'Stock levels have been updated',
    });
  };

  const handleReject = async () => {
    if (!selectedAdjustment) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    rejectAdjustment(selectedAdjustment.id, currentUser?.name || 'Admin');

    setIsLoading(false);
    setIsApproveOpen(false);
    setSelectedAdjustment(null);
    setApprovalNotes('');
    
    toast.success('Adjustment rejected');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adjustments.length}</p>
              <p className="text-sm text-muted-foreground">Total Adjustments</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Workflow Info */}
      {settings.adjustmentApprovalRequired && (
        <div className="wms-card p-4 flex items-center gap-4 border-l-4 border-l-info bg-info/5">
          <AlertTriangle className="h-5 w-5 text-info" />
          <div className="flex-1">
            <p className="font-medium">Approval Required</p>
            <p className="text-sm text-muted-foreground">
              Adjustments exceeding {settings.maxAdjustmentWithoutApproval} units require Admin approval.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search adjustment or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Adjustment
          </Button>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="wms-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Adjustment #</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Before</TableHead>
              <TableHead className="text-right">After</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdjustments.map((adj) => {
              const status = statusConfig[adj.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={adj.id} className="wms-table-row">
                  <TableCell>
                    <span className="font-mono font-medium">{adj.adjustmentNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{adj.skuCode}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{adj.skuName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{adj.location}</TableCell>
                  <TableCell className="text-right font-medium">
                    {(adj.quantityBefore ?? adj.previousQty ?? 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(adj.quantityAfter ?? adj.newQty ?? 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-semibold',
                      (adj.adjustmentQty ?? 0) > 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {(adj.adjustmentQty ?? 0) > 0 ? '+' : ''}{adj.adjustmentQty ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {(adj.reasonCategory ?? adj.adjustmentType ?? 'adjustment').replace('-', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{adj.reason}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    {adj.approvedBy && (
                      <p className="text-xs text-muted-foreground mt-1">by {adj.approvedBy}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(adj.requestedAt, 'MMM dd, yyyy')}</p>
                      <p className="text-muted-foreground">by {adj.requestedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                        {adj.status === 'pending' && isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-success"
                              onClick={() => {
                                setSelectedAdjustment(adj);
                                setIsApproveOpen(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedAdjustment(adj);
                                setIsApproveOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />Reject
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

        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAdjustments.length} adjustment records
          </p>
        </div>
      </div>

      {/* Create Adjustment Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Stock Adjustment</DialogTitle>
            <DialogDescription>
              Adjust inventory quantities with mandatory reason documentation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Select value={newAdjustment.skuId} onValueChange={handleSelectSKU}>
                  <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                  <SelectContent>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={sku.id}>{sku.code} - {sku.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Warehouse Location</Label>
                <Select value={newAdjustment.warehouseId} disabled>
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Select SKU to see location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Qty</Label>
                <Input value={newAdjustment.currentQty} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>New Qty *</Label>
                <Input 
                  type="number" 
                  value={newAdjustment.newQty}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, newQty: e.target.value })}
                  placeholder="Enter new quantity" 
                />
              </div>
              <div className="space-y-2">
                <Label>Difference</Label>
                <Input 
                  value={newAdjustment.newQty ? parseInt(newAdjustment.newQty) - newAdjustment.currentQty : 0} 
                  disabled 
                  className={cn(
                    "bg-muted font-semibold",
                    newAdjustment.newQty && parseInt(newAdjustment.newQty) > newAdjustment.currentQty 
                      ? 'text-success' 
                      : 'text-destructive'
                  )} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason Category *</Label>
              <Select 
                value={newAdjustment.reasonCategory}
                onValueChange={(value) => setNewAdjustment({ ...newAdjustment, reasonCategory: value })}
              >
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  {reasonCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason Details *</Label>
              <Textarea 
                value={newAdjustment.reason}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                placeholder="Provide detailed explanation for this adjustment..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdjustment} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Stock Adjustment</DialogTitle>
            <DialogDescription>
              Approve or reject this inventory adjustment.
            </DialogDescription>
          </DialogHeader>
          {selectedAdjustment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{selectedAdjustment.skuCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{selectedAdjustment.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change:</span>
                  <span className={cn(
                    'font-semibold',
                    (selectedAdjustment.adjustmentQty ?? 0) > 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {selectedAdjustment.quantityBefore ?? selectedAdjustment.previousQty ?? 0} → {selectedAdjustment.quantityAfter ?? selectedAdjustment.newQty ?? 0} ({(selectedAdjustment.adjustmentQty ?? 0) > 0 ? '+' : ''}{selectedAdjustment.adjustmentQty ?? 0})
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Reason:</Label>
                <p className="mt-1">{selectedAdjustment.reason}</p>
              </div>
              <div className="space-y-2">
                <Label>Approval Notes</Label>
                <Textarea 
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Optional notes..." 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
