import { useState } from 'react';
import { 
  X,
  Package,
  Move,
  Lock,
  AlertTriangle,
  History,
  Search,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { BinConfig, InventoryInBin, BIN_STATUS_CONFIG } from '@/shared/types/mapping';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface InventoryDrawerProps {
  bin: BinConfig | null;
  inventoryItems: InventoryInBin[];
  onClose: () => void;
  onMoveStock: (binId: string, skuId: string) => void;
  onLockStock: (binId: string) => void;
  onMarkDamaged: (binId: string, skuId: string) => void;
  isAdmin: boolean;
}

export function InventoryDrawer({
  bin,
  inventoryItems,
  onClose,
  onMoveStock,
  onLockStock,
  onMarkDamaged,
  isAdmin,
}: InventoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!bin) return null;

  const statusConfig = BIN_STATUS_CONFIG[bin.status];
  
  // Filter inventory items based on search
  const filteredItems = inventoryItems.filter(item =>
    item.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.skuName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold">Inventory in Bin</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-mono font-bold">{bin.code}</p>
            <p className="text-xs text-muted-foreground">Level {bin.level}, Position {bin.position}</p>
          </div>
          <Badge className={cn(statusConfig.bg, statusConfig.border, 'text-foreground')}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Inventory List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={`${item.binId}-${item.skuId}`} className="bg-muted/30 rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.skuCode}</p>
                    <p className="text-xs text-muted-foreground">{item.skuName}</p>
                  </div>
                  <Badge 
                    variant={item.status === 'available' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold text-lg">{item.quantity}</p>
                  </div>
                  {item.batchNumber && (
                    <div>
                      <p className="text-muted-foreground">Batch</p>
                      <p className="font-semibold">{item.batchNumber}</p>
                    </div>
                  )}
                </div>

                {item.expiryDate && (
                  <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 rounded px-2 py-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Expires: {format(item.expiryDate, 'MMM dd, yyyy')}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onMoveStock(bin.id, item.skuId)}
                  >
                    <Move className="h-3 w-3 mr-1" />
                    Move
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-destructive"
                      onClick={() => onMarkDamaged(bin.id, item.skuId)}
                    >
                      <AlertTriangle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No inventory found</p>
              <p className="text-sm">This bin is empty or no items match your search</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {isAdmin && !bin.isLocked && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onLockStock(bin.id)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock Bin for Cycle Count
          </Button>
        )}
        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
          <History className="h-4 w-4 mr-2" />
          View Movement History
        </Button>
      </div>
    </div>
  );
}
