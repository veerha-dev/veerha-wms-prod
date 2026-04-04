import { useState } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import { cn } from '@/shared/lib/utils';
import {
  Calendar,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Lock,
  Trash2,
  Edit,
  Unlock,
  CalendarIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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
import { Label } from '@/shared/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Calendar as CalendarComponent } from '@/shared/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { Batch } from '@/shared/types/inventory';
import { toast } from '@/shared/hooks/use-toast';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  quarantine: { label: 'Blocked', color: 'bg-warning/10 text-warning border-warning/20', icon: Lock },
  blocked: { label: 'Blocked', color: 'bg-warning/10 text-warning border-warning/20', icon: Lock },
  expired: { label: 'Expired', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  depleted: { label: 'Depleted', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

interface BatchFormData {
  batchNumber: string;
  skuId: string;
  manufactureDate: Date | undefined;
  expiryDate: Date | undefined;
  quantity: number;
  supplierReference: string;
}

const initialFormData: BatchFormData = {
  batchNumber: '',
  skuId: '',
  manufactureDate: undefined,
  expiryDate: undefined,
  quantity: 0,
  supplierReference: '',
};

export function BatchExpiry() {
  const { tenant } = useWMS();
  const { batches, skus, addBatch, updateBatch } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<BatchFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const maxBatches = tenant?.limits.maxBatches || 500;
  const currentBatchCount = batches.length;

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.skuCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringBatches = batches.filter(b => {
    if (!b.expiryDate) return false;
    const daysUntilExpiry = differenceInDays(b.expiryDate, new Date());
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const expiredBatches = batches.filter(b => b.status === 'expired');

  const getExpiryInfo = (batch: Batch) => {
    if (!batch.expiryDate) return null;
    const daysUntilExpiry = differenceInDays(batch.expiryDate, new Date());
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'bg-destructive/10 text-destructive', days: Math.abs(daysUntilExpiry) };
    }
    if (daysUntilExpiry <= 7) {
      return { label: 'Critical', color: 'bg-destructive/10 text-destructive', days: daysUntilExpiry };
    }
    if (daysUntilExpiry <= 30) {
      return { label: 'Warning', color: 'bg-warning/10 text-warning', days: daysUntilExpiry };
    }
    return { label: 'OK', color: 'bg-success/10 text-success', days: daysUntilExpiry };
  };

  const handleCreate = async () => {
    if (!formData.batchNumber || !formData.skuId || !formData.manufactureDate || formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const sku = skus.find(s => s.id === formData.skuId);
    if (!sku) return;

    setIsLoading(true);
    try {
      await addBatch({
        skuId: formData.skuId,
        skuCode: sku.code,
        batchNumber: formData.batchNumber,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        supplierReference: formData.supplierReference || undefined,
        quantity: formData.quantity,
        status: 'active',
        fifoRank: batches.length + 1,
      });

      toast({
        title: "Batch Created",
        description: `Batch ${formData.batchNumber} has been created successfully.`,
      });

      setFormData(initialFormData);
      setIsCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedBatch) return;

    setIsLoading(true);
    try {
      await updateBatch(selectedBatch.id, {
        batchNumber: formData.batchNumber,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        quantity: formData.quantity,
        supplierReference: formData.supplierReference || undefined,
      });

      toast({
        title: "Batch Updated",
        description: `Batch ${formData.batchNumber} has been updated.`,
      });

      setIsEditOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockBatch = (batch: Batch) => {
    updateBatch(batch.id, { status: 'quarantine' as any });
    toast({
      title: "Batch Blocked",
      description: `Batch ${batch.batchNumber} has been blocked.`,
      variant: "destructive",
    });
  };

  const handleUnblockBatch = (batch: Batch) => {
    updateBatch(batch.id, { status: 'active' });
    toast({
      title: "Batch Unblocked",
      description: `Batch ${batch.batchNumber} is now active.`,
    });
  };

  const handleScrapBatch = (batch: Batch) => {
    updateBatch(batch.id, { status: 'expired', quantity: 0 });
    toast({
      title: "Batch Scrapped",
      description: `Batch ${batch.batchNumber} has been moved to scrap.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      batchNumber: batch.batchNumber,
      skuId: batch.skuId,
      manufactureDate: batch.manufactureDate,
      expiryDate: batch.expiryDate,
      quantity: batch.quantity,
      supplierReference: batch.supplierReference || '',
    });
    setIsEditOpen(true);
  };

  const openDetailDialog = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{batches.length}</p>
              <p className="text-sm text-muted-foreground">Total Batches</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{batches.filter(b => b.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Active Batches</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiringBatches.length}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiredBatches.length}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0) && (
        <div className={cn(
          'wms-card p-4 flex items-center gap-4 border-l-4',
          expiredBatches.length > 0 ? 'border-l-destructive bg-destructive/5' : 'border-l-warning bg-warning/5'
        )}>
          <AlertTriangle className={cn(
            'h-5 w-5',
            expiredBatches.length > 0 ? 'text-destructive' : 'text-warning'
          )} />
          <div className="flex-1">
            <p className="font-medium">Batch Expiry Alert</p>
            <p className="text-sm text-muted-foreground">
              {expiredBatches.length > 0 && `${expiredBatches.length} batch(es) have expired. `}
              {expiringBatches.length > 0 && `${expiringBatches.length} batch(es) expiring within 30 days.`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStatusFilter('expired')}>Review All</Button>
        </div>
      )}

      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batch number or SKU..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            size="sm" 
            className="gap-2" 
            disabled={currentBatchCount >= maxBatches}
            onClick={() => {
              setFormData(initialFormData);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Batch Table */}
      <div className="wms-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Batch Number</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Manufacture Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Until Expiry</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>FIFO Rank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch) => {
              const status = statusConfig[batch.status];
              const StatusIcon = status.icon;
              const expiryInfo = getExpiryInfo(batch);

              return (
                <TableRow key={batch.id} className="wms-table-row">
                  <TableCell>
                    <span className="font-mono font-medium">{batch.batchNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{batch.skuCode}</span>
                  </TableCell>
                  <TableCell>
                    {format(batch.manufactureDate, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {batch.expiryDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(batch.expiryDate, 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {expiryInfo ? (
                      <Badge variant="outline" className={expiryInfo.color}>
                        {expiryInfo.label === 'Expired' 
                          ? `${expiryInfo.days}d overdue`
                          : `${expiryInfo.days} days`
                        }
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {batch.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">#{batch.fifoRank}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailDialog(batch)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(batch)}>
                          <Edit className="h-4 w-4 mr-2" />Edit Batch
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {batch.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleBlockBatch(batch)}>
                            <Lock className="h-4 w-4 mr-2" />Block Batch
                          </DropdownMenuItem>
                        )}
                        {(batch.status === 'blocked' || batch.status === 'quarantine') && (
                          <DropdownMenuItem onClick={() => handleUnblockBatch(batch)}>
                            <Unlock className="h-4 w-4 mr-2" />Unblock Batch
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleScrapBatch(batch)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Move to Scrap
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBatches.length} of {batches.length} batches
          </p>
          <p className="text-sm text-muted-foreground">
            Plan limit: {currentBatchCount} / {maxBatches}
          </p>
        </div>
      </div>

      {/* Create Batch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
            <DialogDescription>
              Create a new batch for inventory tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Number *</Label>
                <Input 
                  placeholder="BAT-YYYY-XXX" 
                  value={formData.batchNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Select 
                  value={formData.skuId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, skuId: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                  <SelectContent className="z-50 bg-background border">
                    {skus.length === 0 ? (
                      <SelectItem value="no-skus" disabled>
                        No SKUs available
                      </SelectItem>
                    ) : (
                      skus.map(sku => (
                        <SelectItem key={sku.id} value={sku.id}>
                          {sku.code} - {sku.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacture Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.manufactureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.manufactureDate ? format(formData.manufactureDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.manufactureDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, manufactureDate: date }))}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: safeParseInt(e.target.value, 0) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier Reference</Label>
                <Input 
                  placeholder="Optional" 
                  value={formData.supplierReference}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierReference: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input 
                  value={formData.batchNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={selectedBatch?.skuCode || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacture Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.manufactureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.manufactureDate ? format(formData.manufactureDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.manufactureDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, manufactureDate: date }))}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-background border" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: safeParseInt(e.target.value, 0) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier Reference</Label>
                <Input 
                  placeholder="Optional" 
                  value={formData.supplierReference}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierReference: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
            <DialogDescription>
              Complete information about this batch.
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-mono font-medium">{selectedBatch.batchNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{selectedBatch.skuCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Manufacture Date</p>
                  <p>{format(selectedBatch.manufactureDate, 'PPP')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p>{selectedBatch.expiryDate ? format(selectedBatch.expiryDate, 'PPP') : 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">{selectedBatch.quantity.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">FIFO Rank</p>
                  <Badge variant="secondary">#{selectedBatch.fifoRank}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusConfig[selectedBatch.status].color}>
                    {statusConfig[selectedBatch.status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Supplier Reference</p>
                  <p>{selectedBatch.supplierReference || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p>{format(selectedBatch.createdAt, 'PPP')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            <Button onClick={() => {
              if (selectedBatch) {
                openEditDialog(selectedBatch);
                setIsDetailOpen(false);
              }
            }}>Edit Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}