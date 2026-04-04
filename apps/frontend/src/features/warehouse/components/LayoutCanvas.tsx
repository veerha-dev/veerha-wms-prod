import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Minimize2,
  Grid3X3,
  Layers,
  X,
  ArrowLeft,
  Move,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { ZoneConfig, RackConfig, BinConfig, BIN_STATUS_CONFIG } from '@/shared/types/mapping';
import { BinInventoryData } from '@/features/warehouse/hooks/useBinInventory';
import { cn } from '@/shared/lib/utils';

interface LayoutCanvasProps {
  zones: ZoneConfig[];
  racks: RackConfig[];
  bins: BinConfig[];
  selectedZoneId: string | null;
  selectedRackId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectRack: (rackId: string) => void;
  onSelectBin: (binId: string) => void;
  showInventoryOverlay: boolean;
  isEditMode: boolean;
  isAdmin: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onUpdateZonePosition?: (zoneId: string, position: { x: number; y: number }) => void;
  binInventory?: BinInventoryData[];
}

export function LayoutCanvas({
  zones,
  racks,
  bins,
  selectedZoneId,
  selectedRackId,
  onSelectZone,
  onSelectRack,
  onSelectBin,
  showInventoryOverlay,
  isEditMode,
  isAdmin,
  isFullscreen,
  onToggleFullscreen,
  onUpdateZonePosition,
  binInventory = [],
}: LayoutCanvasProps) {
  const [zoom, setZoom] = useState(80);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const zoneRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll canvas to selected zone when selection changes
  useEffect(() => {
    if (!selectedZoneId || !containerRef.current) return;
    const el = zoneRefs.current[selectedZoneId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [selectedZoneId]);

  // Drag state for zones
  const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom(prev => Math.max(40, prev - 10));
  const handleResetView = () => {
    setZoom(80);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.max(40, Math.min(150, prev + delta)));
    }
  }, []);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Zone drag handlers
  const handleZoneDragStart = useCallback((e: React.MouseEvent, zone: ZoneConfig) => {
    if (!isEditMode || !isAdmin) return;
    e.stopPropagation();
    e.preventDefault();
    
    const rect = (e.target as HTMLElement).closest('[data-zone-id]')?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggingZoneId(zone.id);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPosition({ x: zone.position.x, y: zone.position.y });
  }, [isEditMode, isAdmin]);

  const handleZoneDrag = useCallback((e: React.MouseEvent) => {
    if (!draggingZoneId || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    // Calculate position relative to the container, accounting for zoom and scroll
    const scale = zoom / 100;
    const newX = Math.max(0, Math.round(((e.clientX - containerRect.left + scrollLeft) / scale - dragOffset.x - 24) / 20) * 20);
    const newY = Math.max(0, Math.round(((e.clientY - containerRect.top + scrollTop) / scale - dragOffset.y - 24) / 20) * 20);
    
    setDragPosition({ x: newX, y: newY });
  }, [draggingZoneId, zoom, dragOffset]);

  const handleZoneDragEnd = useCallback(() => {
    if (draggingZoneId && dragPosition && onUpdateZonePosition) {
      onUpdateZonePosition(draggingZoneId, dragPosition);
    }
    setDraggingZoneId(null);
    setDragPosition(null);
  }, [draggingZoneId, dragPosition, onUpdateZonePosition]);

  const getRacksForZone = (zoneId: string) => racks.filter(r => r.zoneId === zoneId);
  const getBinsForRack = (rackId: string) => bins.filter(b => b.rackId === rackId);

  // Grid-based layout for zones - no overlapping
  const getZoneGridPosition = (index: number) => {
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      x: col * 380 + 20,
      y: row * 320 + 20,
    };
  };

  return (
    <div className={cn(
      'flex flex-col bg-muted/20 overflow-hidden transition-all duration-300',
      isFullscreen 
        ? 'fixed inset-0 z-50 rounded-none' 
        : 'h-full rounded-lg'
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          {isFullscreen && (
            <Button variant="ghost" size="sm" onClick={onToggleFullscreen} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Layout Canvas</span>
          {isEditMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Move className="h-3 w-3" />
                Edit Mode - Drag zones to reposition
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mr-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center font-medium">{zoom}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
          {isFullscreen && (
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={onToggleFullscreen}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 border-b border-border text-xs flex-shrink-0">
        <span className="text-muted-foreground font-medium">Bin Status:</span>
        {Object.entries(BIN_STATUS_CONFIG).slice(0, 5).map(([status, config]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded border-2', config.bg, config.border)} />
            <span className="text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto relative",
          draggingZoneId ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handleZoneDrag(e);
        }}
        onMouseUp={() => {
          handleMouseUp();
          handleZoneDragEnd();
        }}
        onMouseLeave={() => {
          handleMouseUp();
          handleZoneDragEnd();
        }}
      >
        <div
          className="p-6"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${100 / (zoom / 100)}%`,
            minWidth: '1400px',
            minHeight: isFullscreen ? '900px' : '700px',
          }}
        >
          {/* Zones - Positioned or Grid Layout */}
          <div className={cn(
            isEditMode ? "relative min-h-[800px]" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          )}>
            {zones.map((zone, index) => {
              const zoneRacks = getRacksForZone(zone.id);
              const isSelected = selectedZoneId === zone.id;
              const isDragging = draggingZoneId === zone.id;
              const currentPosition = isDragging && dragPosition ? dragPosition : zone.position;
              
              return (
                <div
                  key={zone.id}
                  ref={(el) => { zoneRefs.current[zone.id] = el; }}
                  data-zone-id={zone.id}
                  onClick={() => !isDragging && onSelectZone(zone.id)}
                  onMouseDown={(e) => handleZoneDragStart(e, zone)}
                  className={cn(
                    'rounded-xl border-2 p-4 transition-shadow min-h-[280px]',
                    isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg' : 'hover:shadow-md',
                    isEditMode && isAdmin && 'cursor-move',
                    isDragging && 'shadow-2xl z-50 opacity-90',
                    !isEditMode && 'cursor-pointer'
                  )}
                  style={{
                    backgroundColor: `${zone.color}08`,
                    borderColor: zone.color,
                    ...(isEditMode ? {
                      position: 'absolute',
                      left: currentPosition.x,
                      top: currentPosition.y,
                      width: 360,
                      transition: isDragging ? 'none' : 'box-shadow 0.2s',
                    } : {}),
                  }}
                >
                  {/* Zone Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${zone.color}25` }}
                      >
                        <Layers className="h-4 w-4" style={{ color: zone.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{zone.code} • {zone.utilization}% utilized</p>
                      </div>
                    </div>
                  </div>

                  {/* Racks Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {zoneRacks.map((rack) => {
                      const rackBins = getBinsForRack(rack.id);
                      const isRackSelected = selectedRackId === rack.id;
                      const occupiedCount = rackBins.filter(b => b.status !== 'empty').length;
                      
                      return (
                        <div
                          key={rack.id}
                          onClick={(e) => { e.stopPropagation(); onSelectRack(rack.id); }}
                          className={cn(
                            'bg-card rounded-lg border p-2 transition-all cursor-pointer hover:shadow-sm',
                            isRackSelected ? 'border-primary shadow-md' : 'border-border/60'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1">
                              <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{rack.code}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {occupiedCount}/{rackBins.length}
                            </span>
                          </div>

                          {/* Bin Grid - Compact */}
                          <div 
                            className="grid gap-0.5"
                            style={{ 
                              gridTemplateColumns: `repeat(${Math.min(rack.binsPerLevel, 6)}, 1fr)`,
                            }}
                          >
                            {rackBins.map((bin) => {
                              const statusConfig = BIN_STATUS_CONFIG[bin.status];
                              return (
                                <Tooltip key={bin.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      onClick={(e) => { e.stopPropagation(); onSelectBin(bin.id); }}
                                      className={cn(
                                        'h-3 rounded-sm border transition-all hover:scale-125 cursor-pointer',
                                        statusConfig.bg,
                                        statusConfig.border
                                      )}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <div className="space-y-0.5">
                                      <p className="font-semibold">{bin.code}</p>
                                      <p>Status: {statusConfig.label}</p>
                                      {showInventoryOverlay && (() => {
                                      const binItems = binInventory.filter(item => item.binId === bin.id);
                                      const totalQuantity = binItems.reduce((sum, item) => sum + item.quantityAvailable + item.quantityReserved + item.quantityDamaged, 0);
                                      
                                      if (binItems.length > 0) {
                                        return (
                                          <>
                                            <p className="font-medium">Inventory ({totalQuantity} items)</p>
                                            {binItems.slice(0, 2).map((item, index) => (
                                              <div key={index} className="text-xs">
                                                <p>{item.skuCode}: {item.quantityAvailable}</p>
                                                {item.quantityReserved > 0 && <p className="text-blue-600">Reserved: {item.quantityReserved}</p>}
                                                {item.quantityDamaged > 0 && <p className="text-red-600">Damaged: {item.quantityDamaged}</p>}
                                              </div>
                                            ))}
                                            {binItems.length > 2 && <p className="text-xs text-muted-foreground">+{binItems.length - 2} more...</p>}
                                          </>
                                        );
                                      }
                                      return <p className="text-muted-foreground">No inventory</p>;
                                    })()}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>

                          {rack.isPickFace && (
                            <div className="mt-1 text-[8px] text-center text-success bg-success/10 rounded py-0.5">
                              Pick Face
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
