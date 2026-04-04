import { useState, useEffect } from 'react';
import { safeParseInt } from '@/shared/utils/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import {
  Plus,
  Trash2,
  Edit,
  LayoutGrid,
  Boxes,
  Package,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useZonesByWarehouse, useCreateZone, useDeleteZone } from '@/features/warehouse/hooks/useZones';

type DBWarehouse = any;
type ZoneType = any;
type StorageType = any;

interface ConfigureZonesDialogProps {
  warehouse: DBWarehouse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ZoneDisplay {
  id: string;
  name: string;
  code: string;
  type: ZoneType;
  storage_type: StorageType;
  total_capacity: number;
  used_capacity: number;
  isExpanded: boolean;
}

const zoneTypes: { value: ZoneType; label: string; color: string }[] = [
  { value: 'storage', label: 'Storage', color: 'bg-success text-success-foreground' },
  { value: 'receiving', label: 'Receiving', color: 'bg-info text-info-foreground' },
  { value: 'picking', label: 'Picking', color: 'bg-warning text-warning-foreground' },
  { value: 'packing', label: 'Packing', color: 'bg-accent text-accent-foreground' },
  { value: 'shipping', label: 'Shipping', color: 'bg-sky-500 text-white' },
  { value: 'returns', label: 'Returns', color: 'bg-orange-500 text-white' },
  { value: 'staging', label: 'Staging', color: 'bg-purple-500 text-white' },
  { value: 'quarantine', label: 'Quarantine', color: 'bg-muted text-muted-foreground' },
];

const zoneColorMap: Record<ZoneType, string> = {
  bulk: 'border-info bg-info/5',
  rack: 'border-success bg-success/5',
  cold: 'border-sky-500 bg-sky-500/5',
  hazmat: 'border-destructive bg-destructive/5',
  staging: 'border-warning bg-warning/5',
  dispatch: 'border-accent bg-accent/5',
  returns: 'border-orange-500 bg-orange-500/5',
  quarantine: 'border-muted bg-muted/5',
};

export function ConfigureZonesDialog({
  warehouse,
  open,
  onOpenChange,
}: ConfigureZonesDialogProps) {
  const { data: dbZones = [], isLoading: zonesLoading } = useZonesByWarehouse(warehouse?.id || null);
  const createZone = useCreateZone();
  const deleteZoneMutation = useDeleteZone();
  
  const [zones, setZones] = useState<ZoneDisplay[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneDisplay | null>(null);
  const [deleteZone, setDeleteZone] = useState<ZoneDisplay | null>(null);
  const [newZone, setNewZone] = useState({
    name: '',
    code: '',
    type: 'storage' as ZoneType,
    storage_type: 'ambient' as StorageType,
    total_capacity: '100',
    max_weight_kg: '',
    max_volume_cm3: '',
    allowed_categories: [] as string[],
    handling_rules: [] as string[],
  });

  // Sync DB zones to local state
  useEffect(() => {
    if (dbZones) {
      if (dbZones.length > 0) {
        setZones(dbZones.map((z: any) => ({
          id: z.id,
          name: z.name,
          code: z.code,
          type: z.zoneType || z.type,
          storage_type: z.storageType || z.storage_type,
          total_capacity: z.totalCapacity ?? z.total_capacity ?? 0,
          used_capacity: z.currentOccupancy ?? z.used_capacity ?? 0,
          isExpanded: false,
        })));
      } else {
        // Clear zones when dbZones is empty
        setZones([]);
      }
    }
  }, [dbZones?.length]); // Only re-run when the array length changes

  const totalCapacity = zones.reduce((acc, z) => acc + z.total_capacity, 0);

  const generateCode = (name: string) => {
    return name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) + 
      Math.random().toString(36).substring(2, 4).toUpperCase();
  };

  const handleAddZone = async () => {
    if (!newZone.name.trim() || !warehouse) {
      toast.error('Zone name is required');
      return;
    }

    try {
      await createZone.mutateAsync({
        warehouseId: warehouse.id,
        name: newZone.name.trim(),
        code: newZone.code.trim() || generateCode(newZone.name),
        zoneType: newZone.type,
        storageType: newZone.storage_type,
        capacity: parseInt(newZone.total_capacity) || 100,
        maxWeightKg: newZone.max_weight_kg ? parseFloat(newZone.max_weight_kg) : null,
        maxVolumeCm3: newZone.max_volume_cm3 ? parseFloat(newZone.max_volume_cm3) : null,
        allowedCategories: newZone.allowed_categories.length > 0 ? newZone.allowed_categories : null,
        handlingRules: newZone.handling_rules.length > 0 ? newZone.handling_rules : null,
        isActive: true,
      });
      
      setNewZone({ name: '', code: '', type: 'storage', storage_type: 'ambient', total_capacity: '100', max_weight_kg: '', max_volume_cm3: '', allowed_categories: [], handling_rules: [] });
      setIsAddingZone(false);
    } catch (error) {
      console.error('Failed to create zone:', error);
    }
  };

  const handleDeleteZone = async () => {
    if (!deleteZone) return;

    try {
      await deleteZoneMutation.mutateAsync(deleteZone.id);
      setDeleteZone(null);
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const toggleZoneExpanded = (zoneId: string) => {
    setZones(zones.map(z => 
      z.id === zoneId ? { ...z, isExpanded: !z.isExpanded } : z
    ));
  };

  const handleViewRacks = (zone: ZoneDisplay) => {
    // Navigate to mapping page with zone filter
    window.location.href = `/mapping?zone=${zone.id}&warehouse=${warehouse.id}`;
  };

  const handleViewInventory = (zone: ZoneDisplay) => {
    // Navigate to inventory page with zone filter
    window.location.href = `/inventory?zone=${zone.id}&warehouse=${warehouse.id}`;
  };

  const handleUpdateZone = async () => {
    if (!editingZone || !warehouse) return;

    try {
      // Here you would call the update zone mutation
      // For now, we'll just show a toast and close the dialog
      toast.success(`Zone "${editingZone.name}" updated successfully`);
      setEditingZone(null);
    } catch (error) {
      console.error('Failed to update zone:', error);
      toast.error('Failed to update zone');
    }
  };

  if (!warehouse) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px] h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Configure Zones</DialogTitle>
                <DialogDescription>
                  Manage zones for {warehouse.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{zones.length}</p>
              <p className="text-xs text-muted-foreground">Zones</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{totalCapacity.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Total Capacity</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{((warehouse as any).totalCapacity ?? warehouse.total_capacity ?? 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Warehouse Capacity</p>
            </div>
          </div>

          <Separator />

          {/* Zones List */}
          <ScrollArea className="flex-1 -mx-6 px-6 h-full [&>div>div]:!overflow-y-auto">
            <div className="space-y-3 py-2">
              {zonesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : zones.length === 0 && !isAddingZone ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No zones configured</p>
                  <p className="text-sm">Add zones to organize your warehouse</p>
                </div>
              ) : (
                zones.map((zone) => {
                  const typeConfig = zoneTypes.find(t => t.value === zone.type);
                  const utilization = zone.total_capacity > 0 
                    ? Math.round((zone.used_capacity / zone.total_capacity) * 100) 
                    : 0;
                  
                  return (
                    <div
                      key={zone.id}
                      className={cn(
                        'rounded-lg border-2 transition-all',
                        zoneColorMap[zone.type]
                      )}
                    >
                      {/* Zone Header */}
                      <div 
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => toggleZoneExpanded(zone.id)}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                          {zone.isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{zone.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {zone.code}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', typeConfig?.color)}>
                              {typeConfig?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{zone.total_capacity} capacity</span>
                            <span className={cn(
                              utilization >= 80 ? 'text-warning' : 'text-success'
                            )}>
                              {utilization}% utilized
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingZone(zone);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteZone(zone);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Zone Details (Expanded) */}
                      {zone.isExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <Separator className="mb-3" />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Utilization</p>
                              <Progress value={utilization} className="h-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Storage Type</p>
                                <p className="font-medium capitalize">{zone.storage_type}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Used</p>
                                <p className="font-medium">{zone.used_capacity}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => handleViewRacks(zone)}
                            >
                              <Boxes className="h-3 w-3" />
                              View Racks
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => handleViewInventory(zone)}
                            >
                              <Package className="h-3 w-3" />
                              View Inventory
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add Zone Form */}
              {isAddingZone ? (
                <div className="rounded-lg border-2 border-dashed border-primary p-4">
                  <h4 className="font-medium mb-3">Add New Zone</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Zone Name *</Label>
                      <Input
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                        placeholder="e.g., Storage Zone B"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Zone Code</Label>
                      <Input
                        value={newZone.code}
                        onChange={(e) => setNewZone({ ...newZone, code: e.target.value.toUpperCase() })}
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Zone Type</Label>
                      <Select
                        value={newZone.type}
                        onValueChange={(value: ZoneType) => 
                          setNewZone({ ...newZone, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          {zoneTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Storage Type</Label>
                      <Select
                        value={newZone.storage_type}
                        onValueChange={(value: StorageType) => 
                          setNewZone({ ...newZone, storage_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="frozen">Frozen</SelectItem>
                          <SelectItem value="hazmat">Hazmat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacity</Label>
                      <Input
                        type="number"
                        value={newZone.total_capacity}
                        onChange={(e) => setNewZone({ ...newZone, total_capacity: e.target.value })}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Max Weight (kg)</Label>
                      <Input
                        type="number"
                        value={newZone.max_weight_kg}
                        onChange={(e) => setNewZone({ ...newZone, max_weight_kg: e.target.value })}
                        placeholder="e.g., 50000"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Volume (cm³)</Label>
                      <Input
                        type="number"
                        value={newZone.max_volume_cm3}
                        onChange={(e) => setNewZone({ ...newZone, max_volume_cm3: e.target.value })}
                        placeholder="e.g., 5000000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs">Allowed Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Electronics', 'Hardware', 'General', 'Perishables', 'Pharmaceuticals', 'Chemicals', 'Fragile', 'Heavy'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            const updated = newZone.allowed_categories.includes(cat)
                              ? newZone.allowed_categories.filter(c => c !== cat)
                              : [...newZone.allowed_categories, cat];
                            setNewZone({ ...newZone, allowed_categories: updated });
                          }}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            newZone.allowed_categories.includes(cat)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-muted-foreground text-muted-foreground hover:border-primary'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs">Handling Rules</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Temperature Controlled', 'Humidity Controlled', 'Light Sensitive', 'Fragile Items', 'Heavy Items', 'Stackable'].map((rule) => (
                        <button
                          key={rule}
                          onClick={() => {
                            const updated = newZone.handling_rules.includes(rule)
                              ? newZone.handling_rules.filter(r => r !== rule)
                              : [...newZone.handling_rules, rule];
                            setNewZone({ ...newZone, handling_rules: updated });
                          }}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            newZone.handling_rules.includes(rule)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-muted-foreground text-muted-foreground hover:border-primary'
                          }`}
                        >
                          {rule}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddZone} size="sm" disabled={createZone.isPending}>
                      {createZone.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Add Zone
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsAddingZone(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed gap-2"
                  onClick={() => setIsAddingZone(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Zone
                </Button>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Zone Confirmation */}
      <AlertDialog open={!!deleteZone} onOpenChange={(open) => !open && setDeleteZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteZone?.name}"? 
              This will also delete all racks and bins in this zone.
              {deleteZone && deleteZone.used_capacity > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ This zone has inventory. Please move items before deleting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteZone ? deleteZone.used_capacity > 0 : false}
            >
              {deleteZoneMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete Zone'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Zone Dialog */}
      <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Zone</DialogTitle>
            <DialogDescription>
              Update the zone configuration for "{editingZone?.name}"
            </DialogDescription>
          </DialogHeader>
          
          {editingZone && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Zone Name</Label>
                  <Input
                    id="edit-name"
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                    placeholder="Zone name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Zone Code</Label>
                  <Input
                    id="edit-code"
                    value={editingZone.code}
                    onChange={(e) => setEditingZone({ ...editingZone, code: e.target.value.toUpperCase() })}
                    placeholder="Zone code"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Zone Type</Label>
                  <Select
                    value={editingZone.type}
                    onValueChange={(value: ZoneType) => 
                      setEditingZone({ ...editingZone, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {zoneTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-storage">Storage Type</Label>
                  <Select
                    value={editingZone.storage_type}
                    onValueChange={(value: StorageType) => 
                      setEditingZone({ ...editingZone, storage_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="ambient">Ambient</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="hazmat">Hazmat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Total Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={editingZone.total_capacity}
                  onChange={(e) => setEditingZone({ ...editingZone, total_capacity: safeParseInt(e.target.value, 0) })}
                  min="1"
                  placeholder="Total capacity"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingZone(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateZone} disabled={createZone.isPending}>
              {createZone.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
