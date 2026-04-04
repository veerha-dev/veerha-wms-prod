import { useState, useMemo, useRef } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import { cn } from '@/shared/lib/utils';
import {
  AlertTriangle,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Package,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  Camera,
  Droplets,
  Flame,
  Bug,
  XCircle,
  Building2,
  MapPin,
  Box,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
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
import { useWMS } from '@/shared/contexts/WMSContext';
import { useInventory } from '@/shared/contexts/InventoryContext';
import { DamageCategory, DispositionDecision, DamagedItem } from '@/shared/types/inventory';
import { toast } from '@/shared/hooks/use-toast';

const categoryConfig: Record<DamageCategory, { label: string; icon: any; color: string }> = {
  physical: { label: 'Physical Damage', icon: AlertTriangle, color: 'bg-warning/10 text-warning border-warning/20' },
  water: { label: 'Water Damage', icon: Droplets, color: 'bg-info/10 text-info border-info/20' },
  expired: { label: 'Expired', icon: Clock, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  defective: { label: 'Defective', icon: Bug, color: 'bg-warning/10 text-warning border-warning/20' },
  contaminated: { label: 'Contaminated', icon: Flame, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  other: { label: 'Other', icon: AlertTriangle, color: 'bg-muted text-muted-foreground' },
};

const decisionConfig: Record<DispositionDecision, { label: string; icon: any; color: string; description: string }> = {
  restock: { label: 'Restock', icon: Package, color: 'bg-success/10 text-success border-success/20', description: 'Return to inventory' },
  refurbish: { label: 'Refurbish', icon: Wrench, color: 'bg-warning/10 text-warning border-warning/20', description: 'Send for repair' },
  scrap: { label: 'Scrap', icon: Trash2, color: 'bg-destructive/10 text-destructive border-destructive/20', description: 'Write off inventory' },
  pending: { label: 'Pending', icon: Clock, color: 'bg-muted text-muted-foreground', description: 'Awaiting decision' },
  return_to_vendor: { label: 'Return to Vendor', icon: Package, color: 'bg-info/10 text-info border-info/20', description: 'Return to supplier' },
};

interface DamageFormData {
  skuId: string;
  quantity: number;
  category: DamageCategory;
  warehouseId: string;
  binId: string;
  description: string;
  imageUrls: string[];
}

const initialFormData: DamageFormData = {
  skuId: '',
  quantity: 0,
  category: 'physical',
  warehouseId: '',
  binId: '',
  description: '',
  imageUrls: [],
};

export function DamagedGoods() {
  const { currentUser, warehouses } = useWMS();
  const { damagedItems, skus, stockLevels, reportDamage, decideDamage, recordMovement } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DamagedItem | null>(null);
  const [formData, setFormData] = useState<DamageFormData>(initialFormData);
  const [selectedDecision, setSelectedDecision] = useState<DispositionDecision>('restock');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Get available locations for selected SKU
  const availableLocations = useMemo(() => {
    if (!formData.skuId) return [];
    return stockLevels.filter(sl => sl.skuId === formData.skuId && sl.quantityAvailable > 0);
  }, [formData.skuId, stockLevels]);

  // Get max quantity for selected location
  const selectedLocationStock = useMemo(() => {
    if (!formData.warehouseId) return null;
    return availableLocations.find(sl => sl.warehouseId === formData.warehouseId && 
      (!formData.binId || sl.binId === formData.binId));
  }, [formData.warehouseId, formData.binId, availableLocations]);

  const filteredItems = damagedItems.filter((item) => {
    const matchesSearch = item.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skuName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDecision = decisionFilter === 'all' || item.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  const pendingCount = damagedItems.filter(i => i.decision === 'pending').length;
  const restockCount = damagedItems.filter(i => i.decision === 'restock').length;
  const refurbishCount = damagedItems.filter(i => i.decision === 'refurbish').length;
  const scrapCount = damagedItems.filter(i => i.decision === 'scrap').length;
  const totalDamagedQty = damagedItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds the 5MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `damage-reports/${fileName}`;

        const objectUrl = URL.createObjectURL(file);
        uploadedUrls.push(objectUrl);
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }));
        toast({
          title: "Upload Complete",
          description: `${uploadedUrls.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading images.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleReportDamage = () => {
    if (!formData.skuId || formData.quantity <= 0 || !formData.warehouseId || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including warehouse location.",
        variant: "destructive",
      });
      return;
    }

    // Validate quantity does not exceed available stock
    const maxQty = selectedLocationStock?.quantityAvailable || 0;
    if (formData.quantity > maxQty) {
      toast({
        title: "Quantity Exceeds Available",
        description: `Cannot report ${formData.quantity} as damaged. Only ${maxQty} available at this location.`,
        variant: "destructive",
      });
      return;
    }

    const sku = skus.find(s => s.id === formData.skuId);
    if (!sku) return;

    const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);
    const locationDisplay = selectedWarehouse?.name + (selectedLocationStock?.binCode ? ` / ${selectedLocationStock.binCode}` : '');

    reportDamage({
      skuId: formData.skuId,
      skuCode: sku.code,
      skuName: sku.name,
      quantity: formData.quantity,
      category: formData.category,
      location: formData.warehouseId, // Store warehouse UUID
      description: formData.description,
      decision: 'pending',
      createdBy: currentUser?.name || 'System',
      photos: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
    });

    // Record the damage movement - stock update is handled by database trigger
    recordMovement({
      type: 'damage',
      skuId: formData.skuId,
      skuCode: sku.code,
      skuName: sku.name,
      quantity: formData.quantity,
      sourceWarehouse: formData.warehouseId,
      sourceBin: formData.binId || undefined,
      reason: formData.description,
      triggeredBy: currentUser?.name || 'System',
      triggeredByRole: currentUser?.role || 'admin',
    });

    toast({
      title: "Damage Reported",
      description: `Damage report for ${sku.code} has been submitted. Stock automatically updated.`,
    });

    setFormData(initialFormData);
    setIsCreateOpen(false);
  };

  const handleMakeDecision = () => {
    if (!selectedItem) return;

    decideDamage(selectedItem.id, selectedDecision, currentUser?.name || 'Admin');

    // Record the corresponding movement based on decision
    if (selectedDecision === 'restock') {
      recordMovement({
        type: 'return',
        skuId: selectedItem.skuId,
        skuCode: selectedItem.skuCode,
        skuName: selectedItem.skuName,
        quantity: selectedItem.quantity,
        destinationWarehouse: selectedItem.location.split('/')[0]?.trim(),
        destinationBin: selectedItem.location.split('/')[1]?.trim(),
        reason: `Restocked from damaged goods: ${decisionNotes}`,
        triggeredBy: currentUser?.name || 'Admin',
        triggeredByRole: 'admin',
      });
    } else if (selectedDecision === 'scrap') {
      recordMovement({
        type: 'scrap',
        skuId: selectedItem.skuId,
        skuCode: selectedItem.skuCode,
        skuName: selectedItem.skuName,
        quantity: selectedItem.quantity,
        sourceWarehouse: selectedItem.location.split('/')[0]?.trim(),
        sourceBin: selectedItem.location.split('/')[1]?.trim(),
        reason: `Scrapped: ${decisionNotes}`,
        triggeredBy: currentUser?.name || 'Admin',
        triggeredByRole: 'admin',
      });
    }

    toast({
      title: "Decision Made",
      description: `Item ${selectedItem.skuCode} has been marked as "${decisionConfig[selectedDecision].label}".`,
    });

    setIsDecisionOpen(false);
    setSelectedItem(null);
    setSelectedDecision('restock');
    setDecisionNotes('');
  };

  const openDecisionDialog = (item: DamagedItem) => {
    setSelectedItem(item);
    setSelectedDecision('restock');
    setDecisionNotes('');
    setIsDecisionOpen(true);
  };

  const openDetailDialog = (item: DamagedItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDamagedQty}</p>
              <p className="text-sm text-muted-foreground">Total Damaged</p>
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
              <p className="text-sm text-muted-foreground">Pending Decision</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{restockCount}</p>
              <p className="text-sm text-muted-foreground">To Restock</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{refurbishCount}</p>
              <p className="text-sm text-muted-foreground">To Refurbish</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scrapCount}</p>
              <p className="text-sm text-muted-foreground">To Scrap</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Alert */}
      {pendingCount > 0 && (
        <div className="wms-card p-4 flex items-center gap-4 border-l-4 border-l-warning bg-warning/5">
          <Clock className="h-5 w-5 text-warning" />
          <div className="flex-1">
            <p className="font-medium">Pending Decisions</p>
            <p className="text-sm text-muted-foreground">
              {pendingCount} item(s) require disposition decision by Admin.
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setDecisionFilter('pending')}>
              Review All
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="wms-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="refurbish">Refurbish</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button size="sm" className="gap-2" onClick={() => {
            setFormData(initialFormData);
            setIsCreateOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Report Damage
          </Button>
        </div>
      </div>

      {/* Damaged Items Table */}
      <div className="wms-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {filteredItems.map((item) => {
              const category = categoryConfig[item.category as DamageCategory] || categoryConfig.other;
              const decision = decisionConfig[item.decision as DispositionDecision] || decisionConfig.pending;
              const CategoryIcon = category.icon;
              const DecisionIcon = decision.icon;

              return (
                <TableRow key={item.id} className="wms-table-row">
                  <TableCell>
                    <div>
                      <p className="font-mono font-medium">{item.skuCode}</p>
                      <p className="text-sm text-muted-foreground">{item.skuName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', category.color)}>
                      <CategoryIcon className="h-3 w-3" />
                      {category.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.location}</TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2">{item.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1', decision.color)}>
                      <DecisionIcon className="h-3 w-3" />
                      {decision.label}
                    </Badge>
                    {item.decidedBy && (
                      <p className="text-xs text-muted-foreground mt-1">by {item.decidedBy}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{(item as any).created_at ? format(new Date((item as any).created_at), 'MMM dd, yyyy') : 'N/A'}</p>
                      <p className="text-muted-foreground">by {(item as any).created_by || 'Unknown'}</p>
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
                        <DropdownMenuItem onClick={() => openDetailDialog(item)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        {item.decision === 'pending' && isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-success"
                              onClick={() => openDecisionDialog(item)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />Make Decision
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
            Showing {filteredItems.length} damaged item records
          </p>
        </div>
      </div>

      {/* Report Damage Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Damaged Goods</DialogTitle>
            <DialogDescription>
              Document damaged or defective inventory items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Select 
                  value={formData.skuId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, skuId: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select SKU" /></SelectTrigger>
                  <SelectContent>
                    {skus.map(sku => (
                      <SelectItem key={sku.id} value={sku.id}>
                        {sku.code} - {sku.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: safeParseInt(e.target.value, 0) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Damage Category *</Label>
              <RadioGroup 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as DamageCategory }))}
                className="grid grid-cols-3 gap-2"
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <div key={key}>
                    <RadioGroupItem value={key} id={`cat-${key}`} className="peer sr-only" />
                    <Label
                      htmlFor={`cat-${key}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <config.icon className="mb-2 h-4 w-4" />
                      <span className="text-xs text-center">{config.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Warehouse Location *</Label>
              <Select 
                value={formData.warehouseId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseId: value, binId: '' }))}
              >
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select warehouse location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.length === 0 ? (
                    <SelectItem value="none" disabled>No stock available for this SKU</SelectItem>
                  ) : (
                    availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.warehouseId}>
                        {loc.warehouseName} {loc.binCode ? `/ ${loc.binCode}` : ''} (Avail: {loc.quantityAvailable})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedLocationStock && (
                <p className="text-xs text-muted-foreground">
                  Max quantity available: {selectedLocationStock.quantityAvailable}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                placeholder="Describe the damage..." 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label>Photos (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                type="button"
                variant="outline" 
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Photos
                  </>
                )}
              </Button>
              
              {/* Image previews */}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Damage photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Max 5MB per image. Supports JPG, PNG, WebP.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleReportDamage}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog open={isDecisionOpen} onOpenChange={setIsDecisionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make Disposition Decision</DialogTitle>
            <DialogDescription>
              Decide what to do with this damaged inventory.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedItem.skuCode}</p>
                    <p className="text-sm text-muted-foreground">{selectedItem.skuName}</p>
                  </div>
                  <Badge variant="outline" className={categoryConfig[selectedItem.category].color}>
                    {categoryConfig[selectedItem.category].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span> {selectedItem.quantity}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span> {selectedItem.location}
                  </div>
                </div>
                <p className="text-sm">{selectedItem.description}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Decision *</Label>
                <RadioGroup 
                  value={selectedDecision} 
                  onValueChange={(value) => setSelectedDecision(value as DispositionDecision)}
                  className="grid grid-cols-3 gap-4"
                >
                  {(['restock', 'refurbish', 'scrap'] as const).map((key) => {
                    const config = decisionConfig[key];
                    const Icon = config.icon;
                    return (
                      <div key={key}>
                        <RadioGroupItem value={key} id={`dec-${key}`} className="peer sr-only" />
                        <Label
                          htmlFor={`dec-${key}`}
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          )}
                        >
                          <Icon className={cn("mb-2 h-6 w-6", 
                            key === 'restock' && "text-success",
                            key === 'refurbish' && "text-warning",
                            key === 'scrap' && "text-destructive"
                          )} />
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground text-center">{config.description}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  placeholder="Add decision notes..." 
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDecisionOpen(false)}>Cancel</Button>
            <Button onClick={handleMakeDecision}>Confirm Decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Damaged Item Details</DialogTitle>
            <DialogDescription>
              Complete information about this damaged item.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SKU Code</p>
                  <p className="font-mono font-medium">{selectedItem.skuCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SKU Name</p>
                  <p className="font-medium">{selectedItem.skuName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold text-destructive">{selectedItem.quantity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline" className={categoryConfig[selectedItem.category].color}>
                    {categoryConfig[selectedItem.category].label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedItem.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{selectedItem.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Decision</p>
                  <Badge variant="outline" className={decisionConfig[selectedItem.decision].color}>
                    {decisionConfig[selectedItem.decision].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Decided By</p>
                  <p>{selectedItem.decidedBy || 'Pending'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reported At</p>
                  <p>{(selectedItem as any).created_at ? format(new Date((selectedItem as any).created_at), 'PPP') : 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p>{(selectedItem as any).created_by || 'Unknown'}</p>
                </div>
              </div>
              {(selectedItem as any).decided_at && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Decision Date</p>
                  <p>{format(new Date((selectedItem as any).decided_at), 'PPP')}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
            {selectedItem?.decision === 'pending' && isAdmin && (
              <Button onClick={() => {
                setIsDetailOpen(false);
                if (selectedItem) openDecisionDialog(selectedItem);
              }}>Make Decision</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}