import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Package,
  Search,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  ArrowLeftRight,
  MapPin,
  Building2,
  Loader2,
  Plus,
  Hash,
  History,
  AlertTriangle,
  Check,
  Grid3X3,
  Box,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { SerialRegistry } from '@/features/inventory/components/SerialRegistry';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useZonesByWarehouse } from '@/features/warehouse/hooks/useZones';
import { useRacksByZone } from '@/features/warehouse/hooks/useRacks';
import { useBinsByRack } from '@/features/warehouse/hooks/useBins';
import { toast } from 'sonner';
import type { StockLevel } from '@/shared/types/inventory';

export function StockLevels() {
  const { stockLevels, skus, movements, batches, moveStock, lockStock, releaseStock, addStockLevel, updateStockLevel } = useInventory();
  const { warehouses } = useWMS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false);
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [serialRegistrySkuId, setSerialRegistrySkuId] = useState<string | null>(null);
  const [serialRegistrySkuCode, setSerialRegistrySkuCode] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [moveQuantity, setMoveQuantity] = useState('');
  const [lockQuantity, setLockQuantity] = useState('');
  const [addStockQuantity, setAddStockQuantity] = useState('');
  const [editStockForm, setEditStockForm] = useState({
    quantityAvailable: '',
    quantityReserved: '',
    quantityInTransit: '',
    quantityDamaged: '',
  });
  const [toWarehouse, setToWarehouse] = useState('');
  const [toBin, setToBin] = useState('');
  const [lockAction, setLockAction] = useState<'lock' | 'release'>('lock');

  // Create Stock Form State
  const [createForm, setCreateForm] = useState({
    skuId: '',
    warehouseId: '',
    zoneId: '',
    rackId: '',
    binId: '',
    quantityAvailable: '',
    quantityReserved: '',
    quantityInTransit: '',
    quantityDamaged: '',
  });

  // Cascading data for location selection
  const { data: zones = [] } = useZonesByWarehouse(createForm.warehouseId || null);
  const { data: racks = [] } = useRacksByZone(createForm.zoneId || null);
  const { data: bins = [] } = useBinsByRack(createForm.rackId || null);

  // Reset dependent fields when parent changes
  const handleWarehouseChange = (value: string) => {
    setCreateForm(prev => ({ 
      ...prev, 
      warehouseId: value, 
      zoneId: '', 
      rackId: '', 
      binId: '' 
    }));
  };

  const handleZoneChange = (value: string) => {
    setCreateForm(prev => ({ 
      ...prev, 
      zoneId: value, 
      rackId: '', 
      binId: '' 
    }));
  };

  const handleRackChange = (value: string) => {
    setCreateForm(prev => ({ 
      ...prev, 
      rackId: value, 
      binId: '' 
    }));
  };

  const filteredStock = stockLevels.filter((stock) => {
    const matchesSearch = stock.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.binCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'all' || stock.warehouseId === warehouseFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low') matchesStatus = stock.quantityAvailable < 100;
    if (statusFilter === 'reserved') matchesStatus = stock.quantityReserved > 0;
    if (statusFilter === 'damaged') matchesStatus = stock.quantityDamaged > 0;
    
    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  const totalAvailable = filteredStock.reduce((acc, s) => acc + (s.quantityAvailable || 0), 0);
  const totalReserved = filteredStock.reduce((acc, s) => acc + (s.quantityReserved || 0), 0);
  const totalDamaged = filteredStock.reduce((acc, s) => acc + (s.quantityDamaged || 0), 0);
  const totalInTransit = filteredStock.reduce((acc, s) => acc + (s.quantityInTransit || 0), 0);

  // Get movements related to a specific stock
  const getStockMovements = (stock: StockLevel) => {
    return movements.filter(m => 
      m.skuId === stock.skuId && 
      (m.sourceWarehouse === stock.warehouseName || m.destinationWarehouse === stock.warehouseName)
    ).slice(0, 5);
  };

  // Get batches related to a specific stock
  const getStockBatches = (stock: StockLevel) => {
    return batches.filter(b => b.skuId === stock.skuId);
  };

  const handleViewDetails = (stock: StockLevel) => {
    setSelectedStock(stock);
    setIsViewDetailOpen(true);
  };

  const handleCreateStock = async () => {
    if (!createForm.skuId || !createForm.warehouseId || !createForm.quantityAvailable) {
      toast.error('Please fill all required fields');
      return;
    }

    const qtyAvailable = parseInt(createForm.quantityAvailable) || 0;
    const qtyReserved = parseInt(createForm.quantityReserved) || 0;
    const qtyInTransit = parseInt(createForm.quantityInTransit) || 0;
    const qtyDamaged = parseInt(createForm.quantityDamaged) || 0;
    const totalQty = qtyAvailable + qtyReserved + qtyInTransit + qtyDamaged;

    if (qtyAvailable < 0 || qtyReserved < 0 || qtyInTransit < 0 || qtyDamaged < 0) {
      toast.error('Quantities cannot be negative');
      return;
    }

    if (totalQty <= 0) {
      toast.error('Total quantity must be greater than 0');
      return;
    }

    const selectedSKU = skus.find(s => s.id === createForm.skuId);
    const selectedWarehouse = warehouses.find(w => w.id === createForm.warehouseId);
    
    if (!selectedSKU || !selectedWarehouse) {
      toast.error('Invalid SKU or Warehouse');
      return;
    }

    setIsLoading(true);
    
    try {
      await addStockLevel({
        skuId: selectedSKU.id,
        skuCode: selectedSKU.code,
        skuName: selectedSKU.name,
        warehouseId: selectedWarehouse.id,
        warehouseName: selectedWarehouse.name || '',
        binId: createForm.binId || undefined,
        batchId: undefined,
        quantityAvailable: qtyAvailable,
        quantityReserved: qtyReserved,
        quantityInTransit: qtyInTransit,
        quantityDamaged: qtyDamaged,
        totalQuantity: qtyAvailable + qtyReserved + qtyInTransit + qtyDamaged,
      });

      setIsCreateDialogOpen(false);
      setCreateForm({
        skuId: '',
        warehouseId: '',
        zoneId: '',
        rackId: '',
        binId: '',
        quantityAvailable: '',
        quantityReserved: '',
        quantityInTransit: '',
        quantityDamaged: '',
      });
    } catch (error) {
      // Error is handled by the mutation hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveStock = async () => {
    if (!selectedStock || !moveQuantity || !toWarehouse) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const qty = parseInt(moveQuantity);
    if (qty <= 0 || qty > selectedStock.quantityAvailable) {
      toast.error('Invalid quantity');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    moveStock(selectedStock.id, toWarehouse, toBin, qty);
    
    setIsLoading(false);
    setIsMoveDialogOpen(false);
    setSelectedStock(null);
    setMoveQuantity('');
    setToWarehouse('');
    setToBin('');
    
    toast.success('Stock moved successfully', {
      description: `${qty} units of ${selectedStock.skuCode} transferred`,
    });
  };

  const handleLockUnlock = async () => {
    if (!selectedStock || !lockQuantity) {
      toast.error('Please enter quantity');
      return;
    }
    
    const qty = parseInt(lockQuantity);
    if (qty <= 0) {
      toast.error('Invalid quantity');
      return;
    }

    if (lockAction === 'lock' && qty > selectedStock.quantityAvailable) {
      toast.error('Cannot lock more than available quantity');
      return;
    }
    
    if (lockAction === 'release' && qty > selectedStock.quantityReserved) {
      toast.error('Cannot release more than reserved quantity');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (lockAction === 'lock') {
      lockStock(selectedStock.id, qty);
    } else {
      releaseStock(selectedStock.id, qty);
    }
    
    setIsLoading(false);
    setIsLockDialogOpen(false);
    setSelectedStock(null);
    setLockQuantity('');
    
    toast.success(`Stock ${lockAction === 'lock' ? 'locked' : 'released'} successfully`);
  };

  // Handle Add Stock to existing entry
  const handleAddStock = async () => {
    if (!selectedStock || !addStockQuantity) {
      toast.error('Please enter quantity to add');
      return;
    }
    
    const qty = parseInt(addStockQuantity);
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      await updateStockLevel(selectedStock.id, {
        quantityAvailable: selectedStock.quantityAvailable + qty,
      });
      
      toast.success('Stock added successfully', {
        description: `Added ${qty} units to ${selectedStock.skuCode}`,
      });
      
      setIsAddStockDialogOpen(false);
      setSelectedStock(null);
      setAddStockQuantity('');
    } catch (error) {
      toast.error('Failed to add stock');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Edit Stock Levels
  const handleEditStockLevels = async () => {
    if (!selectedStock) return;

    const qtyAvailable = parseInt(editStockForm.quantityAvailable) || 0;
    const qtyReserved = parseInt(editStockForm.quantityReserved) || 0;
    const qtyInTransit = parseInt(editStockForm.quantityInTransit) || 0;
    const qtyDamaged = parseInt(editStockForm.quantityDamaged) || 0;

    if (qtyAvailable < 0 || qtyReserved < 0 || qtyInTransit < 0 || qtyDamaged < 0) {
      toast.error('Quantities cannot be negative');
      return;
    }

    setIsLoading(true);
    try {
      await updateStockLevel(selectedStock.id, {
        quantityAvailable: qtyAvailable,
        quantityReserved: qtyReserved,
        quantityInTransit: qtyInTransit,
        quantityDamaged: qtyDamaged,
      });
      
      toast.success('Stock levels updated successfully');
      
      setIsEditStockDialogOpen(false);
      setSelectedStock(null);
      setEditStockForm({
        quantityAvailable: '',
        quantityReserved: '',
        quantityInTransit: '',
        quantityDamaged: '',
      });
    } catch (error) {
      toast.error('Failed to update stock levels');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Stock dialog with current values
  const openEditStockDialog = (stock: StockLevel) => {
    setSelectedStock(stock);
    setEditStockForm({
      quantityAvailable: stock.quantityAvailable.toString(),
      quantityReserved: stock.quantityReserved.toString(),
      quantityInTransit: stock.quantityInTransit.toString(),
      quantityDamaged: stock.quantityDamaged.toString(),
    });
    setIsEditStockDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAvailable.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReserved.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Reserved</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalInTransit.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDamaged.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Damaged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="wms-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKU, bin code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Godowns</SelectItem>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="reserved">Has Reserved</SelectItem>
                <SelectItem value="damaged">Has Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock Entry
          </Button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="wms-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">In Transit</TableHead>
              <TableHead className="text-right">Damaged</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.map((stock) => {
              const sku = skus.find(s => s.id === stock.skuId);
              const isLowStock = sku && stock.quantityAvailable < sku.minStock;

              return (
                <TableRow key={stock.id} className="wms-table-row">
                  <TableCell>
                    <div>
                      <p className="font-mono font-medium">{stock.skuCode}</p>
                      <p className="text-sm text-muted-foreground">{stock.skuName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{stock.warehouseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {stock.zoneName} {stock.binCode && `• ${stock.binCode}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className={cn(
                        'font-semibold',
                        isLowStock && 'text-destructive'
                      )}>
                        {(stock.quantityAvailable || 0).toLocaleString('en-IN')}
                      </span>
                      {isLowStock && (
                        <Badge variant="outline" className="ml-2 text-xs bg-destructive/10 text-destructive border-destructive/20">
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(stock.quantityReserved || 0) > 0 ? (
                      <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                        {(stock.quantityReserved || 0).toLocaleString('en-IN')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(stock.quantityInTransit || 0) > 0 ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {(stock.quantityInTransit || 0).toLocaleString('en-IN')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(stock.quantityDamaged || 0) > 0 ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {(stock.quantityDamaged || 0).toLocaleString('en-IN')}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {(stock.totalQuantity || 0).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(stock)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        {stock.serialTracking && (
                          <DropdownMenuItem onClick={() => {
                            setSerialRegistrySkuId(stock.skuId || stock.sku_id);
                            setSerialRegistrySkuCode(stock.skuCode || stock.sku_code || '');
                          }}>
                            <Hash className="h-4 w-4 mr-2" />View Serials
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedStock(stock);
                            setAddStockQuantity('');
                            setIsAddStockDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />Add Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditStockDialog(stock)}>
                          <Package className="h-4 w-4 mr-2" />Edit Stock Levels
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedStock(stock);
                            setIsMoveDialogOpen(true);
                          }}
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />Move Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedStock(stock);
                            setLockAction('lock');
                            setIsLockDialogOpen(true);
                          }}
                        >
                          <Lock className="h-4 w-4 mr-2" />Lock Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedStock(stock);
                            setLockAction('release');
                            setIsLockDialogOpen(true);
                          }}
                          disabled={stock.quantityReserved === 0}
                        >
                          <Unlock className="h-4 w-4 mr-2" />Release Stock
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
            Showing {filteredStock.length} stock entries
          </p>
        </div>
      </div>

      {/* View Details Sheet */}
      <Sheet open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Stock Details</SheetTitle>
            <SheetDescription>
              Complete information about this stock entry
            </SheetDescription>
          </SheetHeader>
          {selectedStock && (
            <div className="mt-6 space-y-6">
              {/* SKU Info */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-lg font-semibold">{selectedStock.skuCode}</p>
                    <p className="text-muted-foreground">{selectedStock.skuName}</p>
                  </div>
                  {skus.find(s => s.id === selectedStock.skuId) && 
                   selectedStock.quantityAvailable < (skus.find(s => s.id === selectedStock.skuId)?.minStock || 0) && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="movements">Movements</TabsTrigger>
                  <TabsTrigger value="batches">Batches</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  {/* Location */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{selectedStock.warehouseName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Zone:</span> {selectedStock.zoneName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bin:</span> {selectedStock.binCode || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantities */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Quantities</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-success">{(selectedStock.quantityAvailable || 0).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Available</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-info">{(selectedStock.quantityReserved || 0).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Reserved</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-warning">{(selectedStock.quantityInTransit || 0).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">In Transit</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-destructive">{(selectedStock.quantityDamaged || 0).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Damaged</p>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold">{(selectedStock.totalQuantity || 0).toLocaleString('en-IN')}</p>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                    </div>
                  </div>

                  {/* SKU Details */}
                  {(() => {
                    const sku = skus.find(s => s.id === selectedStock.skuId);
                    if (!sku) return null;
                    return (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">SKU Details</h4>
                        <div className="p-3 border rounded-lg space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span>{sku.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit</span>
                            <span>{sku.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Min Stock</span>
                            <span>{sku.minStock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Stock</span>
                            <span>{sku.maxStock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reorder Point</span>
                            <span>{sku.reorderPoint}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Batch Tracking</span>
                            <span>{sku.batchTracking ? <Check className="h-4 w-4 text-success" /> : '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expiry Tracking</span>
                            <span>{sku.expiryTracking ? <Check className="h-4 w-4 text-success" /> : '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Last updated: {selectedStock.lastUpdated ? selectedStock.lastUpdated.toLocaleString() : 'N/A'}
                  </div>
                </TabsContent>

                <TabsContent value="movements" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <History className="h-4 w-4" />
                      Recent movements for this stock
                    </div>
                    {getStockMovements(selectedStock).length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground border rounded-lg">
                        No recent movements found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getStockMovements(selectedStock).map((movement) => (
                          <div key={movement.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="capitalize">
                                {movement.type.replace('-', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {movement.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">
                              <span className="font-semibold">{movement.quantity}</span> units
                              {movement.sourceWarehouse && ` from ${movement.sourceWarehouse}`}
                              {movement.destinationWarehouse && ` to ${movement.destinationWarehouse}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {movement.triggeredBy}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="batches" className="mt-4">
                  <div className="space-y-3">
                    {getStockBatches(selectedStock).length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground border rounded-lg">
                        No batches found for this SKU
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getStockBatches(selectedStock).map((batch) => (
                          <div key={batch.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-medium">{batch.batchNumber}</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  batch.status === 'active' && 'bg-success/10 text-success border-success/20',
                                  batch.status === 'blocked' && 'bg-warning/10 text-warning border-warning/20',
                                  batch.status === 'expired' && 'bg-destructive/10 text-destructive border-destructive/20',
                                )}
                              >
                                {batch.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Qty:</span> {batch.quantity}
                              </div>
                              <div>
                                <span className="text-muted-foreground">FIFO Rank:</span> {batch.fifoRank}
                              </div>
                              {batch.expiryDate && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Expires:</span>{' '}
                                  {batch.expiryDate.toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Stock Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock Entry</DialogTitle>
            <DialogDescription>
              Create a new stock entry by selecting an SKU and assigning it to a warehouse location.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Select 
                value={createForm.skuId} 
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, skuId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SKU" />
                </SelectTrigger>
                <SelectContent>
                  {skus.filter(s => s.status === 'active').map((sku) => (
                    <SelectItem key={sku.id} value={sku.id}>
                      <span className="font-mono">{sku.code}</span> - {sku.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Godown *</Label>
                <Select 
                  value={createForm.warehouseId} 
                  onValueChange={handleWarehouseChange}
                >
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select Godown" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select 
                  value={createForm.zoneId} 
                  onValueChange={handleZoneChange}
                  disabled={!createForm.warehouseId}
                >
                  <SelectTrigger>
                    <Grid3X3 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={createForm.warehouseId ? "Select Zone" : "Select godown first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <span className="font-mono text-xs mr-2">{zone.code}</span>
                        {zone.name}
                      </SelectItem>
                    ))}
                    {zones.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No zones in this godown
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rack and Bin Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rack</Label>
                <Select 
                  value={createForm.rackId} 
                  onValueChange={handleRackChange}
                  disabled={!createForm.zoneId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={createForm.zoneId ? "Select Rack" : "Select zone first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {racks.map((rack) => (
                      <SelectItem key={rack.id} value={rack.id}>
                        <span className="font-mono text-xs mr-2">{rack.code}</span>
                        {rack.name}
                      </SelectItem>
                    ))}
                    {racks.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No racks in this zone
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bin</Label>
                <Select 
                  value={createForm.binId} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, binId: value }))}
                  disabled={!createForm.rackId}
                >
                  <SelectTrigger>
                    <Box className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={createForm.rackId ? "Select Bin" : "Select rack first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bins.filter(bin => !(bin.isLocked || bin.is_locked) && (bin.isActive !== false && bin.is_active !== false)).map((bin) => (
                      <SelectItem key={bin.id} value={bin.id}>
                        <span className="font-mono">{bin.code}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          L{bin.level}-P{bin.position}
                        </span>
                      </SelectItem>
                    ))}
                    {bins.filter(bin => !(bin.isLocked || bin.is_locked) && (bin.isActive !== false && bin.is_active !== false)).length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No available bins in this rack
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Quantity Fields */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Stock Quantities</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Available *</Label>
                  <Input 
                    type="number" 
                    value={createForm.quantityAvailable}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                    placeholder="0" 
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Reserved</Label>
                  <Input 
                    type="number" 
                    value={createForm.quantityReserved}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, quantityReserved: e.target.value }))}
                    placeholder="0" 
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">In Transit</Label>
                  <Input 
                    type="number" 
                    value={createForm.quantityInTransit}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, quantityInTransit: e.target.value }))}
                    placeholder="0" 
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Damaged</Label>
                  <Input 
                    type="number" 
                    value={createForm.quantityDamaged}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, quantityDamaged: e.target.value }))}
                    placeholder="0" 
                    min="0"
                  />
                </div>
              </div>
              
              {/* Auto-calculated Total */}
              <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">Total Quantity</span>
                <span className="text-lg font-bold">
                  {(
                    (parseInt(createForm.quantityAvailable) || 0) +
                    (parseInt(createForm.quantityReserved) || 0) +
                    (parseInt(createForm.quantityInTransit) || 0) +
                    (parseInt(createForm.quantityDamaged) || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateStock} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Stock Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Stock</DialogTitle>
            <DialogDescription>
              Transfer stock from one location to another.
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedStock.skuCode}</p>
                <p className="text-sm text-muted-foreground">{selectedStock.skuName}</p>
                <p className="text-sm mt-1">Available: <span className="font-semibold">{selectedStock.quantityAvailable}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Location</Label>
                  <Input value={`${selectedStock.warehouseName} / ${selectedStock.binCode}`} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Quantity to Move *</Label>
                  <Input 
                    type="number" 
                    value={moveQuantity}
                    onChange={(e) => setMoveQuantity(e.target.value)}
                    placeholder="0" 
                    max={selectedStock.quantityAvailable} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>To Godown *</Label>
                  <Select value={toWarehouse} onValueChange={setToWarehouse}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Bin</Label>
                  <Input 
                    value={toBin}
                    onChange={(e) => setToBin(e.target.value)}
                    placeholder="e.g., A1-001"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleMoveStock} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Move Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock/Release Dialog */}
      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lockAction === 'lock' ? 'Lock Stock' : 'Release Stock'}</DialogTitle>
            <DialogDescription>
              {lockAction === 'lock' 
                ? 'Reserve stock for specific orders or purposes.'
                : 'Release reserved stock back to available inventory.'}
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedStock.skuCode}</p>
                <p className="text-sm text-muted-foreground">{selectedStock.skuName}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>Available: <span className="font-semibold text-success">{selectedStock.quantityAvailable}</span></span>
                  <span>Reserved: <span className="font-semibold text-info">{selectedStock.quantityReserved}</span></span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quantity to {lockAction === 'lock' ? 'Lock' : 'Release'} *</Label>
                <Input 
                  type="number" 
                  value={lockQuantity}
                  onChange={(e) => setLockQuantity(e.target.value)}
                  placeholder="0" 
                  max={lockAction === 'lock' ? selectedStock.quantityAvailable : selectedStock.quantityReserved} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLockDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleLockUnlock} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lockAction === 'lock' ? 'Lock Stock' : 'Release Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-success" />
              Add Stock
            </DialogTitle>
            <DialogDescription>
              Add more stock to this existing inventory entry.
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedStock.skuCode}</p>
                <p className="text-sm text-muted-foreground">{selectedStock.skuName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedStock.warehouseName} {selectedStock.zoneName && `/ ${selectedStock.zoneName}`} {selectedStock.binCode && `/ ${selectedStock.binCode}`}
                </p>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-success/5 rounded-lg border border-success/20">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Current Available</p>
                  <p className="text-xl font-bold">{selectedStock.quantityAvailable.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-2xl text-muted-foreground">+</div>
                <div className="flex-1">
                  <Label>Quantity to Add *</Label>
                  <Input 
                    type="number" 
                    value={addStockQuantity}
                    onChange={(e) => setAddStockQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              {addStockQuantity && parseInt(addStockQuantity) > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium">New Available Quantity</span>
                  <span className="text-lg font-bold text-success">
                    {(selectedStock.quantityAvailable + parseInt(addStockQuantity)).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={isLoading || !addStockQuantity}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Levels Dialog */}
      <Dialog open={isEditStockDialogOpen} onOpenChange={setIsEditStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Edit Stock Levels
            </DialogTitle>
            <DialogDescription>
              Adjust the stock quantities for this inventory entry.
            </DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium">{selectedStock.skuCode}</p>
                <p className="text-sm text-muted-foreground">{selectedStock.skuName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedStock.warehouseName} {selectedStock.zoneName && `/ ${selectedStock.zoneName}`} {selectedStock.binCode && `/ ${selectedStock.binCode}`}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available *</Label>
                  <Input 
                    type="number" 
                    value={editStockForm.quantityAvailable}
                    onChange={(e) => setEditStockForm(prev => ({ ...prev, quantityAvailable: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reserved</Label>
                  <Input 
                    type="number" 
                    value={editStockForm.quantityReserved}
                    onChange={(e) => setEditStockForm(prev => ({ ...prev, quantityReserved: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>In Transit</Label>
                  <Input 
                    type="number" 
                    value={editStockForm.quantityInTransit}
                    onChange={(e) => setEditStockForm(prev => ({ ...prev, quantityInTransit: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Damaged</Label>
                  <Input 
                    type="number" 
                    value={editStockForm.quantityDamaged}
                    onChange={(e) => setEditStockForm(prev => ({ ...prev, quantityDamaged: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Auto-calculated Total */}
              <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium">Total Quantity</span>
                <span className="text-lg font-bold">
                  {(
                    (parseInt(editStockForm.quantityAvailable) || 0) +
                    (parseInt(editStockForm.quantityReserved) || 0) +
                    (parseInt(editStockForm.quantityInTransit) || 0) +
                    (parseInt(editStockForm.quantityDamaged) || 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStockDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditStockLevels} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Serial Registry Dialog */}
      <SerialRegistry
        open={!!serialRegistrySkuId}
        onOpenChange={(open) => { if (!open) { setSerialRegistrySkuId(null); setSerialRegistrySkuCode(''); } }}
        skuId={serialRegistrySkuId || undefined}
        skuCode={serialRegistrySkuCode || undefined}
      />
    </div>
  );
}
