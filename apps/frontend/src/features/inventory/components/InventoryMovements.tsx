import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Package,
  Wrench,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { format } from 'date-fns';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { useWMS } from '@/shared/contexts/WMSContext';
import { MovementType } from '@/shared/types/inventory';
import { toast } from 'sonner';

const movementTypeConfig: Record<MovementType, { label: string; icon: any; color: string }> = {
  'stock-in': { label: 'Stock In', icon: ArrowDownToLine, color: 'bg-success/10 text-success border-success/20' },
  'stock-out': { label: 'Stock Out', icon: ArrowUpFromLine, color: 'bg-info/10 text-info border-info/20' },
  'stock_in': { label: 'Stock In', icon: ArrowDownToLine, color: 'bg-success/10 text-success border-success/20' },
  'stock_out': { label: 'Stock Out', icon: ArrowUpFromLine, color: 'bg-info/10 text-info border-info/20' },
  'putaway': { label: 'Putaway', icon: Package, color: 'bg-accent/10 text-accent border-accent/20' },
  'picking': { label: 'Picking', icon: Package, color: 'bg-warning/10 text-warning border-warning/20' },
  'pick': { label: 'Pick', icon: Package, color: 'bg-warning/10 text-warning border-warning/20' },
  'transfer': { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-primary/10 text-primary border-primary/20' },
  'adjustment': { label: 'Adjustment', icon: Wrench, color: 'bg-muted text-muted-foreground' },
  'return': { label: 'Return', icon: RotateCcw, color: 'bg-info/10 text-info border-info/20' },
  'damage': { label: 'Damage', icon: AlertTriangle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  'scrap': { label: 'Scrap', icon: Trash2, color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function InventoryMovements() {
  const { movements, skus, recordMovement } = useInventory();
  const { tenant, currentUser, warehouses } = useWMS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMovement, setSelectedMovement] = useState<typeof movements[0] | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New movement form
  const [newMovement, setNewMovement] = useState({
    type: 'stock_in' as MovementType,
    skuId: '',
    quantity: '',
    sourceWarehouse: '',
    sourceBin: '',
    destinationWarehouse: '',
    destinationBin: '',
    reference: '',
    referenceType: 'order',
    reason: '',
  });

  const maxDailyMovements = tenant?.limits.maxDailyMovements || 100000;
  const todayMovements = movements.filter(m => {
    const today = new Date();
    return m.timestamp.toDateString() === today.toDateString();
  }).length;

  const filteredMovements = movements.filter((mov) => {
    const matchesSearch = mov.movementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.skuName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || mov.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Summary counts - support both legacy and db movement types
  const stockInCount = movements.filter(m => m.type === 'stock-in' || m.type === 'stock_in' || m.type === 'putaway').length;
  const stockOutCount = movements.filter(m => m.type === 'stock-out' || m.type === 'stock_out' || m.type === 'picking' || m.type === 'pick').length;
  const transferCount = movements.filter(m => m.type === 'transfer').length;
  const adjustmentCount = movements.filter(m => m.type === 'adjustment' || m.type === 'damage' || m.type === 'scrap' || m.type === 'return').length;

  const handleRecordMovement = async () => {
    if (!newMovement.skuId || !newMovement.quantity) {
      toast.error('Please fill required fields');
      return;
    }

    const sku = skus.find(s => s.id === newMovement.skuId);
    if (!sku) return;

    // Validate warehouse for movements that require it
    const requiresDestination = ['stock_in', 'stock-in', 'putaway', 'transfer', 'return'].includes(newMovement.type);
    const requiresSource = ['stock_out', 'stock-out', 'pick', 'picking', 'damage', 'transfer'].includes(newMovement.type);
    
    if (requiresDestination && !newMovement.destinationWarehouse) {
      toast.error('Please select destination godown');
      return;
    }
    
    if (requiresSource && !newMovement.sourceWarehouse) {
      toast.error('Please select source godown');
      return;
    }

    setIsLoading(true);
    try {
      const qty = parseInt(newMovement.quantity);
      const isOutbound = ['stock-out', 'stock_out', 'pick', 'picking', 'damage', 'scrap'].includes(newMovement.type);

      await recordMovement({
        type: newMovement.type,
        skuId: sku.id,
        skuCode: sku.code,
        skuName: sku.name,
        quantity: isOutbound ? -Math.abs(qty) : Math.abs(qty),
        sourceWarehouse: newMovement.sourceWarehouse || undefined,
        sourceBin: newMovement.sourceBin || undefined,
        destinationWarehouse: newMovement.destinationWarehouse || undefined,
        destinationBin: newMovement.destinationBin || undefined,
        reference: newMovement.reference || undefined,
        referenceType: newMovement.referenceType as any,
        reason: newMovement.reason || undefined,
        triggeredBy: currentUser?.name || 'Unknown',
        triggeredByRole: currentUser?.role || 'admin',
      });

      setIsRecordOpen(false);
      setNewMovement({
        type: 'stock_in',
        skuId: '',
        quantity: '',
        sourceWarehouse: '',
        sourceBin: '',
        destinationWarehouse: '',
        destinationBin: '',
        reference: '',
        referenceType: 'order',
        reason: '',
      });
    } catch (error) {
      // Error is already handled by the mutation
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stockInCount}</p>
              <p className="text-sm text-muted-foreground">Stock In</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <ArrowUpFromLine className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stockOutCount}</p>
              <p className="text-sm text-muted-foreground">Stock Out</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{transferCount}</p>
              <p className="text-sm text-muted-foreground">Transfers</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adjustmentCount}</p>
              <p className="text-sm text-muted-foreground">Adjustments</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayMovements.toLocaleString('en-IN')} / {maxDailyMovements.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Daily Limit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Ledger Notice */}
      <div className="wms-card p-4 bg-info/5 border-l-4 border-l-info">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-info" />
          <div>
            <p className="font-medium text-info">Immutable Ledger</p>
            <p className="text-sm text-muted-foreground">
              Movement records are append-only and cannot be deleted. Only reversals are allowed.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movement ID or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(movementTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Ledger
            </Button>
            <Button size="sm" onClick={() => setIsRecordOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="wms-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Movement ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Triggered By</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => {
              const typeConfig = movementTypeConfig[movement.type];
              const TypeIcon = typeConfig.icon;

              return (
                <TableRow key={movement.id} className="wms-table-row">
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{movement.movementNumber}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', typeConfig.color)}>
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.skuCode}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{movement.skuName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-semibold',
                      movement.quantity > 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movement.sourceWarehouse && (
                        <p className="text-muted-foreground">
                          From: {movement.sourceWarehouse} {movement.sourceBin && `/ ${movement.sourceBin}`}
                        </p>
                      )}
                      {movement.destinationWarehouse && (
                        <p>
                          To: {movement.destinationWarehouse} {movement.destinationBin && `/ ${movement.destinationBin}`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {movement.reference ? (
                      <div>
                        <p className="font-mono text-sm">{movement.reference}</p>
                        <p className="text-xs text-muted-foreground capitalize">{movement.referenceType}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{movement.triggeredBy}</p>
                        <p className="text-xs text-muted-foreground capitalize">{movement.triggeredByRole}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{format(movement.timestamp, 'MMM dd, yyyy')}</p>
                      <p className="text-muted-foreground">{format(movement.timestamp, 'HH:mm')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedMovement(movement)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredMovements.length} of {movements.length} movements
          </p>
        </div>
      </div>

      {/* Movement Detail Dialog */}
      <Dialog open={!!selectedMovement} onOpenChange={() => setSelectedMovement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Movement Details</DialogTitle>
            <DialogDescription>
              Full details for movement record
            </DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Movement ID</p>
                  <p className="font-mono font-medium">{selectedMovement.movementNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className={movementTypeConfig[selectedMovement.type].color}>
                    {movementTypeConfig[selectedMovement.type].label}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{selectedMovement.skuCode}</p>
                  <p className="text-sm text-muted-foreground">{selectedMovement.skuName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    selectedMovement.quantity > 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {selectedMovement.quantity > 0 ? '+' : ''}{selectedMovement.quantity}
                  </p>
                </div>
              </div>
              {selectedMovement.reason && (
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p>{selectedMovement.reason}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Triggered By</p>
                  <p>{selectedMovement.triggeredBy}</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedMovement.triggeredByRole}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p>{format(selectedMovement.timestamp, 'PPpp')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Movement Dialog */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Movement</DialogTitle>
            <DialogDescription>
              Manually record an inventory movement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Movement Type *</Label>
                <Select 
                  value={newMovement.type} 
                  onValueChange={(value: MovementType) => setNewMovement({ ...newMovement, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock_in">Stock In</SelectItem>
                    <SelectItem value="stock_out">Stock Out</SelectItem>
                    <SelectItem value="putaway">Putaway</SelectItem>
                    <SelectItem value="pick">Pick</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Select 
                  value={newMovement.skuId} 
                  onValueChange={(value) => setNewMovement({ ...newMovement, skuId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    {skus.map((sku) => (
                      <SelectItem key={sku.id} value={sku.id}>{sku.code} - {sku.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input 
                type="number"
                value={newMovement.quantity}
                onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Godown {['stock_out', 'pick', 'transfer', 'damage'].includes(newMovement.type) && '*'}</Label>
                <Select 
                  value={newMovement.sourceWarehouse} 
                  onValueChange={(value) => setNewMovement({ ...newMovement, sourceWarehouse: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination Godown {['stock_in', 'putaway', 'transfer', 'return'].includes(newMovement.type) && '*'}</Label>
                <Select 
                  value={newMovement.destinationWarehouse} 
                  onValueChange={(value) => setNewMovement({ ...newMovement, destinationWarehouse: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input 
                value={newMovement.reference}
                onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                placeholder="Order ID, PO number, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Reason / Notes</Label>
              <Textarea 
                value={newMovement.reason}
                onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                placeholder="Reason for this movement..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecordOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRecordMovement} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record Movement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
