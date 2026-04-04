import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { useReturns, useCreateReturn, useProcessReturn } from '@/features/outbound/hooks/useReturns';
import { useWMS } from '@/shared/contexts/WMSContext';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  Trash2,
  Clock,
  TrendingDown,
  Camera,
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
  DialogTrigger,
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
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { toast } from 'sonner';

interface ReturnItem {
  id: string;
  rmaNumber: string;
  orderId: string;
  sku: string;
  productName: string;
  quantity: number;
  reason: string;
  condition: 'new' | 'good' | 'damaged' | 'defective';
  decision: 'restock' | 'refurbish' | 'scrap' | 'pending';
  status: 'pending' | 'inspecting' | 'processed' | 'completed';
  receivedDate: string;
  processedDate?: string;
  value: number;
}

const conditionConfig = {
  new: { label: 'New', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  good: { label: 'Good', color: 'bg-info/10 text-info border-info/20', icon: CheckCircle2 },
  damaged: { label: 'Damaged', color: 'bg-warning/10 text-warning border-warning/20', icon: AlertTriangle },
  defective: { label: 'Defective', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

const decisionConfig = {
  restock: { label: 'Restock', color: 'bg-success/10 text-success border-success/20', icon: Package },
  refurbish: { label: 'Refurbish', color: 'bg-warning/10 text-warning border-warning/20', icon: Wrench },
  scrap: { label: 'Scrap', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: Trash2 },
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  inspecting: { label: 'Inspecting', color: 'bg-warning/10 text-warning border-warning/20' },
  processed: { label: 'Processed', color: 'bg-info/10 text-info border-info/20' },
  completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/20' },
};

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: returnsResponse, isLoading } = useReturns();
  const dbReturns = Array.isArray(returnsResponse) ? returnsResponse : (returnsResponse?.data || []);
  const createReturn = useCreateReturn();
  const processReturn = useProcessReturn();
  const { selectedWarehouse } = useWMS();

  // Create form state
  const [newReturn, setNewReturn] = useState({
    order_reference: '',
    sku_id: '',
    quantity: '1',
    reason: '',
    condition: 'good',
    notes: '',
  });
  
  // Convert DB returns to UI format
  const returns: ReturnItem[] = useMemo(() => {
    return dbReturns.map((r: any) => ({
      id: r.id,
      rmaNumber: r.returnNumber || r.return_number || 'N/A',
      orderId: r.salesOrder?.orderNumber || r.salesOrder?.soNumber || r.order_reference || 'N/A',
      sku: r.customer?.name || r.sku_id || 'N/A',
      productName: r.returnReason || r.reason || 'Return',
      quantity: r._count?.items || r.quantity || 0,
      reason: r.returnReason || r.reason || '',
      condition: (r.condition as any) || 'good',
      decision: (r.decision as any) || 'pending',
      status: r.status === 'pending' ? 'pending' : r.status === 'inspected' ? 'inspecting' : r.status === 'restocked' || r.status === 'refurbished' || r.status === 'scrapped' ? 'completed' : 'processed',
      receivedDate: r.returnDate ? new Date(r.returnDate).toLocaleDateString('en-GB') : r.received_at ? new Date(r.received_at).toLocaleDateString('en-GB') : new Date(r.createdAt || r.created_at).toLocaleDateString('en-GB'),
      processedDate: r.decided_at ? new Date(r.decided_at).toLocaleDateString('en-GB') : undefined,
      value: Number(r.totalRefund || 0),
    }));
  }, [dbReturns]);

  const filteredReturns = returns.filter((r) => {
    const matchesSearch = r.rmaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const processedToday = returns.filter(r => r.status === 'completed' || r.status === 'processed').length;
  const totalValue = returns.reduce((acc, r) => acc + r.value, 0);
  const completedWithDecision = returns.filter(r => r.decision !== 'pending');
  const restockRate = completedWithDecision.length > 0 
    ? Math.round((completedWithDecision.filter(r => r.decision === 'restock').length / completedWithDecision.length) * 100) 
    : 0;

  const handleCreateReturn = () => {
    if (!newReturn.order_reference || !newReturn.sku_id || !newReturn.quantity || !newReturn.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse');
      return;
    }

    createReturn.mutate({
      order_reference: newReturn.order_reference,
      warehouse_id: selectedWarehouse.id,
      sku_id: newReturn.sku_id,
      quantity: Number(newReturn.quantity),
      reason: newReturn.reason,
      condition: newReturn.condition,
    });
    
    setNewReturn({ order_reference: '', sku_id: '', quantity: '1', reason: '', condition: 'good', notes: '' });
    setIsCreateOpen(false);
  };

  const handleUpdateDecision = (id: string, decision: 'restock' | 'refurbish' | 'scrap') => {
    processReturn.mutate({ id, decision, inspection_notes: `Processed as ${decision}` });
  };

  return (
    <AppLayout
      title="Returns & Damaged Goods"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Returns' }]}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">{pendingCount > 0 ? 'Pending Returns' : 'No pending'}</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processedToday}</p>
              <p className="text-sm text-muted-foreground">{processedToday > 0 ? 'Processed' : 'None processed'}</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{restockRate}%</p>
              <p className="text-sm text-muted-foreground">Restock Rate</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">{totalValue > 0 ? 'Total Return Value' : 'No returns yet'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="wms-card mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RMA, SKU, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inspecting">Inspecting</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Process New Return</DialogTitle>
                <DialogDescription>
                  Create a new return intake record.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order Reference *</Label>
                    <Input 
                      placeholder="ORD-XXXXX" 
                      value={newReturn.order_reference}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, order_reference: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU ID *</Label>
                    <Input 
                      placeholder="SKU ID" 
                      value={newReturn.sku_id}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, sku_id: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input 
                      type="number" 
                      placeholder="1" 
                      value={newReturn.quantity}
                      onChange={(e) => setNewReturn(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Return Reason *</Label>
                    <Select value={newReturn.reason} onValueChange={(v) => setNewReturn(prev => ({ ...prev, reason: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wrong size">Wrong Size</SelectItem>
                        <SelectItem value="Defective">Defective</SelectItem>
                        <SelectItem value="Damaged in transit">Damaged in Transit</SelectItem>
                        <SelectItem value="Wrong item received">Wrong Item</SelectItem>
                        <SelectItem value="Changed mind">Changed Mind</SelectItem>
                        <SelectItem value="Not as described">Not as Described</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Item Condition *</Label>
                  <RadioGroup 
                    value={newReturn.condition} 
                    onValueChange={(v) => setNewReturn(prev => ({ ...prev, condition: v as ReturnItem['condition'] }))}
                    className="grid grid-cols-4 gap-4"
                  >
                    {Object.entries(conditionConfig).map(([key, config]) => (
                      <div key={key}>
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <config.icon className="mb-2 h-5 w-5" />
                          <span className="text-sm">{config.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Additional notes about the return..." 
                    value={newReturn.notes}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateReturn}>Create Return</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="wms-card overflow-hidden">
        {returns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Returns</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              Process your first return by clicking the "New Return" button above.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Process First Return
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>RMA #</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((item) => {
                  const condition = conditionConfig[item.condition];
                  const decision = decisionConfig[item.decision];
                  const status = statusConfig[item.status];
                  const ConditionIcon = condition.icon;
                  const DecisionIcon = decision.icon;

                  return (
                    <TableRow key={item.id} className="wms-table-row">
                      <TableCell>
                        <div>
                          <p className="font-mono font-medium">{item.rmaNumber}</p>
                          <p className="text-xs text-muted-foreground">{item.orderId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-sm">{item.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1', condition.color)}>
                          <ConditionIcon className="h-3 w-3" />
                          {condition.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('gap-1', decision.color)}>
                          <DecisionIcon className="h-3 w-3" />
                          {decision.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{item.value.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                            <DropdownMenuItem><Camera className="h-4 w-4 mr-2" />Add Photos</DropdownMenuItem>
                            <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Update Decision</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateDecision(item.id, 'restock')}>
                              <Package className="h-4 w-4 mr-2" />Process Restock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDecision(item.id, 'refurbish')}>
                              <Wrench className="h-4 w-4 mr-2" />Send to Refurbish
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateDecision(item.id, 'scrap')}>
                              <Trash2 className="h-4 w-4 mr-2" />Mark as Scrap
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
                Showing {filteredReturns.length} of {returns.length} returns
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}