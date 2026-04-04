import { 
  X,
  Layers,
  Grid3X3,
  Box,
  Settings,
  Lock,
  Unlock,
  Move,
  Package,
  AlertTriangle,
  Calendar,
  Weight,
  Maximize2,
  Archive,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { ZoneConfig, RackConfig, BinConfig, BIN_STATUS_CONFIG, ZONE_COLORS } from '@/shared/types/mapping';
import { BinInventoryData } from '@/features/warehouse/hooks/useBinInventory';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface PropertiesPanelProps {
  selectedZone: ZoneConfig | null;
  selectedRack: RackConfig | null;
  selectedBin: BinConfig | null;
  bins: BinConfig[];
  racks: RackConfig[];
  binInventory: BinInventoryData[];
  onClose: () => void;
  onLockBin: (binId: string) => void;
  onUnlockBin: (binId: string) => void;
  onMoveBin: (binId: string) => void;
  onConfigureZone?: (zoneId: string) => void;
  onDeleteZone?: (zoneId: string) => void;
  onAddRack?: (zoneId: string) => void;
  onConfigureRack?: (rackId: string) => void;
  onDeleteRack?: (rackId: string) => void;
  onDeleteBin?: (binId: string) => void;
  onLockAllBinsInRack?: (rackId: string) => void;
  onUnlockAllBinsInRack?: (rackId: string) => void;
  isAdmin: boolean;
}

export function PropertiesPanel({
  selectedZone,
  selectedRack,
  selectedBin,
  bins,
  racks,
  binInventory,
  onClose,
  onLockBin,
  onUnlockBin,
  onMoveBin,
  onConfigureZone,
  onDeleteZone,
  onAddRack,
  onConfigureRack,
  onDeleteRack,
  onDeleteBin,
  onLockAllBinsInRack,
  onUnlockAllBinsInRack,
  isAdmin,
}: PropertiesPanelProps) {
  // Show bin properties if selected
  if (selectedBin) {
    const statusConfig = BIN_STATUS_CONFIG[selectedBin.status];
    
    return (
      <div className="w-full border-l border-border bg-card flex flex-col h-[600px]">
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Bin Properties</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 h-0">
          <div className="p-4 space-y-4">
            {/* Bin Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold text-lg">{selectedBin.code}</h3>
                <Badge className={cn(statusConfig.bg, statusConfig.border, 'text-foreground')}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Level {selectedBin.level}, Position {selectedBin.position}</p>
            </div>

            <Separator />

            {/* Inventory Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Inventory</h4>
              <div className="border rounded-lg p-3">
                {(() => {
                  const binInventoryItems = binInventory.filter(item => item.binId === selectedBin.id);
                  const totalQuantity = binInventoryItems.reduce((sum, item) => sum + item.quantityAvailable + item.quantityReserved + item.quantityDamaged, 0);
                  
                  if (binInventoryItems.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No inventory in this bin</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Items</span>
                        <Badge variant="secondary">{totalQuantity}</Badge>
                      </div>
                      <ScrollArea className="max-h-48 w-full">
                        <div className="space-y-2 pr-2">
                          {binInventoryItems.map((item, index) => (
                            <div key={`${item.skuId}-${index}`} className="flex items-start gap-2 p-2 border rounded-lg">
                              <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium truncate">{item.skuCode}</p>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {item.quantityAvailable}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{item.skuName}</p>
                                <div className="flex flex-wrap items-center gap-1 text-xs mt-1">
                                  {item.quantityReserved > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Reserved: {item.quantityReserved}
                                    </Badge>
                                  )}
                                  {item.quantityDamaged > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      Damaged: {item.quantityDamaged}
                                    </Badge>
                                  )}
                                  {item.batchNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      Batch: {item.batchNumber}
                                    </Badge>
                                  )}
                                </div>
                                {item.expiryDate && (
                                  <div className="flex items-center gap-1 text-xs text-warning mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Expires: {format(item.expiryDate, 'MMM dd, yyyy')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Rack Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Rack Information</h4>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{(() => {
                      const rack = racks.find(r => r.id === selectedBin.rackId);
                      return rack?.code || 'Unknown Rack';
                    })()}</p>
                    <p className="text-xs text-muted-foreground">Level {selectedBin.level}, Position {selectedBin.position}</p>
                  </div>
                </div>
                {(() => {
                  const rackInventoryItems = binInventory.filter(item => {
                    const bin = bins.find(b => b.id === item.binId);
                    return bin && bin.rackId === selectedBin.rackId;
                  });
                  const rackTotalQuantity = rackInventoryItems.reduce((sum, item) => sum + item.quantityAvailable + item.quantityReserved + item.quantityDamaged, 0);
                  const rackBinCount = bins.filter(b => b.rackId === selectedBin.rackId).length;
                  const rackOccupiedBins = new Set(rackInventoryItems.map(item => item.binId)).size;
                  
                  return (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Total Items</p>
                        <p className="font-semibold">{rackTotalQuantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Occupied Bins</p>
                        <p className="font-semibold">{rackOccupiedBins}/{rackBinCount}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <Separator />

            {/* Capacity */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Capacity</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Weight</span>
                    <span>{selectedBin.currentWeight}/{selectedBin.maxWeight} kg</span>
                  </div>
                  <Progress value={(selectedBin.currentWeight / selectedBin.maxWeight) * 100} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Volume</span>
                    <span>{Math.round(selectedBin.currentVolume / 1000)}/{Math.round(selectedBin.maxVolume / 1000)} L</span>
                  </div>
                  <Progress value={(selectedBin.currentVolume / selectedBin.maxVolume) * 100} className="h-1.5" />
                </div>
              </div>
            </div>

            {/* Properties */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Properties</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2">
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">{selectedBin.dimensions.width}×{selectedBin.dimensions.height}×{selectedBin.dimensions.depth} cm</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Pallet</p>
                  <p className="font-medium">{selectedBin.palletCompatible ? 'Compatible' : 'Not Compatible'}</p>
                </div>
              </div>
            </div>

            {selectedBin.lastMovementAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <History className="h-3 w-3" />
                <span>Last movement: {format(selectedBin.lastMovementAt, 'MMM dd, HH:mm')}</span>
              </div>
            )}

            {/* Actions */}
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedBin.skuCode && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => onMoveBin(selectedBin.id)}>
                    <Move className="h-3 w-3 mr-1" />
                    Move Stock
                  </Button>
                )}
                {isAdmin && (
                  selectedBin.isLocked ? (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => onUnlockBin(selectedBin.id)}>
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => onLockBin(selectedBin.id)}>
                      <Lock className="h-3 w-3 mr-1" />
                      Lock
                    </Button>
                  )
                )}
                {isAdmin && selectedBin.skuCode && (
                  <Button variant="outline" size="sm" className="text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Mark Damaged
                  </Button>
                )}
              </div>
              {isAdmin && onDeleteBin && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="text-xs w-full justify-start"
                  onClick={() => onDeleteBin(selectedBin.id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete Bin
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Show rack properties if selected
  if (selectedRack) {
    const rackBins = bins.filter(b => b.rackId === selectedRack.id);
    const occupiedBins = rackBins.filter(b => b.status !== 'empty').length;
    
    return (
      <div className="w-full border-l border-border bg-card flex flex-col h-[600px]">
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Rack Properties</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 h-0">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-lg">{selectedRack.code}</h3>
              <div className="flex items-center gap-2">
                {selectedRack.isPickFace && (
                  <Badge variant="default" className="text-xs">Pick Face</Badge>
                )}
                {selectedRack.isReserve && (
                  <Badge variant="secondary" className="text-xs">Reserve</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Utilization</h4>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bins Occupied</span>
                  <span className="font-semibold">{occupiedBins}/{rackBins.length}</span>
                </div>
                <Progress value={selectedRack.utilization} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weight Load</span>
                  <span className="font-semibold">{Math.round((selectedRack.currentWeight / selectedRack.maxWeight) * 100)}%</span>
                </div>
                <Progress value={(selectedRack.currentWeight / selectedRack.maxWeight) * 100} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2">
                  <p className="text-muted-foreground">Levels</p>
                  <p className="font-semibold text-lg">{selectedRack.levels}</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Bins/Level</p>
                  <p className="font-semibold text-lg">{selectedRack.binsPerLevel}</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Max Weight</p>
                  <p className="font-semibold">{selectedRack.maxWeight.toLocaleString()} kg</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Orientation</p>
                  <p className="font-semibold capitalize">{selectedRack.orientation}</p>
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Actions</h4>
              {(() => {
                const rackBins = bins.filter(b => b.rackId === selectedRack.id);
                const lockedBins = rackBins.filter(b => b.isLocked);
                const unlockedBins = rackBins.filter(b => !b.isLocked);
                  
                  return (
                    <div className="grid gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs justify-start"
                        onClick={() => selectedRack && onConfigureRack?.(selectedRack.id)}
                        disabled={!selectedRack || !onConfigureRack}
                      >
                        <Settings className="h-3 w-3 mr-2" />
                        Configure Rack
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="text-xs justify-start"
                        onClick={() => selectedRack && onDeleteRack?.(selectedRack.id)}
                        disabled={!selectedRack || !onDeleteRack}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Rack
                      </Button>
                      {unlockedBins.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs justify-start"
                          onClick={() => selectedRack && onLockAllBinsInRack?.(selectedRack.id)}
                          disabled={!selectedRack || !onLockAllBinsInRack}
                        >
                          <Lock className="h-3 w-3 mr-2" />
                          Lock All Bins ({unlockedBins.length})
                        </Button>
                      )}
                      {lockedBins.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs justify-start"
                          onClick={() => selectedRack && onUnlockAllBinsInRack?.(selectedRack.id)}
                          disabled={!selectedRack || !onUnlockAllBinsInRack}
                        >
                          <Unlock className="h-3 w-3 mr-2" />
                          Unlock All Bins ({lockedBins.length})
                        </Button>
                      )}
                    </div>
                );
              })()}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Show zone properties if selected
  if (selectedZone) {
    const zoneBins = bins.filter(b => b.zoneId === selectedZone.id);
    const occupiedBins = zoneBins.filter(b => b.status !== 'empty').length;
    
    return (
      <div className="w-full border-l border-border bg-card flex flex-col h-[600px]">
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Zone Properties</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 h-0">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${selectedZone.color}20` }}
                >
                  <Layers className="h-4 w-4" style={{ color: selectedZone.color }} />
                </div>
                <div>
                  <h3 className="font-bold">{selectedZone.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedZone.code}</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize" style={{ borderColor: selectedZone.color, color: selectedZone.color }}>
                {selectedZone.type.replace('-', ' ')}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Capacity</h4>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Utilization</span>
                  <span className="font-semibold">{selectedZone.utilization}%</span>
                </div>
                <Progress value={selectedZone.utilization} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2">
                  <p className="text-muted-foreground">Racks</p>
                  <p className="font-semibold text-lg">{selectedZone.rackCount}</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Bins</p>
                  <p className="font-semibold text-lg">{zoneBins.length}</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Occupied</p>
                  <p className="font-semibold text-lg">{occupiedBins}</p>
                </div>
                <div className="p-2">
                  <p className="text-muted-foreground">Empty</p>
                  <p className="font-semibold text-lg">{zoneBins.length - occupiedBins}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Allowed Categories</h4>
              <div className="flex flex-wrap gap-1">
                {selectedZone.allowedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Handling Rules</h4>
              <ul className="space-y-1">
                {selectedZone.handlingRules.map((rule, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Actions</h4>
              <div className="grid gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => onAddRack?.(selectedZone.id)}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Racks
                </Button>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs justify-start"
                    onClick={() => onConfigureZone?.(selectedZone.id)}
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    Configure Zone
                  </Button>
                )}
                {isAdmin && onDeleteZone && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs justify-start"
                    onClick={() => onDeleteZone(selectedZone.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete Zone
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return null;
}
