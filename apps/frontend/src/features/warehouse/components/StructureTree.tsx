import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Layers, Grid3X3, Box, Search, Plus, Lock, Unlock,
  MoreHorizontal, Eye, Pencil, Trash2, AlignJustify,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator as DropdownSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { ZoneConfig, RackConfig, BinConfig, AisleConfig, ZONE_COLORS } from '@/shared/types/mapping';
import { cn } from '@/shared/lib/utils';

interface StructureTreeProps {
  zones: ZoneConfig[];
  racks: RackConfig[];
  bins: BinConfig[];
  aisles?: AisleConfig[];
  selectedZoneId: string | null;
  selectedRackId: string | null;
  selectedBinId: string | null;
  selectedAisleId?: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectRack: (rackId: string) => void;
  onSelectBin: (binId: string) => void;
  onSelectAisle?: (aisleId: string) => void;
  onAddZone: () => void;
  onAddRack: (zoneId: string) => void;
  onAddAisle?: (zoneId: string) => void;
  onEditZone?: (zoneId: string) => void;
  onDeleteZone?: (zoneId: string) => void;
  onDeleteAisle?: (aisleId: string) => void;
  onLockBin: (binId: string) => void;
  onUnlockBin: (binId: string) => void;
  isAdmin: boolean;
}

export function StructureTree({
  zones, racks, bins, aisles = [],
  selectedZoneId, selectedRackId, selectedBinId, selectedAisleId,
  onSelectZone, onSelectRack, onSelectBin, onSelectAisle,
  onAddZone, onAddRack, onAddAisle,
  onEditZone, onDeleteZone, onDeleteAisle,
  onLockBin, onUnlockBin,
  isAdmin,
}: StructureTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(zones.map(z => z.id)));
  const [expandedAisles, setExpandedAisles] = useState<Set<string>>(new Set());
  const [expandedRacks, setExpandedRacks] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    z.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAislesForZone = (zoneId: string) => aisles.filter(a => a.zoneId === zoneId);
  const getRacksForZone = (zoneId: string) => racks.filter(r => r.zoneId === zoneId);
  const getRacksForAisle = (aisleId: string) => racks.filter(r => r.aisleId === aisleId);
  const getRacksWithoutAisle = (zoneId: string) => racks.filter(r => r.zoneId === zoneId && !r.aisleId);
  const getBinsForRack = (rackId: string) => bins.filter(b => b.rackId === rackId);

  // Group bins by level for a rack
  const getLevelsForRack = (rackId: string) => {
    const rackBins = getBinsForRack(rackId);
    const levelMap = new Map<number, BinConfig[]>();
    rackBins.forEach(b => {
      const existing = levelMap.get(b.level) || [];
      existing.push(b);
      levelMap.set(b.level, existing);
    });
    return Array.from(levelMap.entries()).sort((a, b) => a[0] - b[0]);
  };

  const renderBin = (bin: BinConfig) => {
    const isBinSelected = selectedBinId === bin.id;
    return (
      <div
        key={bin.id}
        onClick={() => onSelectBin(bin.id)}
        className={cn(
          'flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs transition-colors group',
          isBinSelected ? 'bg-accent/10' : 'hover:bg-muted/20'
        )}
      >
        <Box className="h-3 w-3 text-muted-foreground" />
        <span className="flex-1 font-mono text-[10px]">{bin.code.split('-').slice(-2).join('-')}</span>
        <Badge variant="outline" className={cn(
          'text-[9px] h-3.5 px-1',
          bin.status === 'full' && 'border-success/50 text-success',
          bin.status === 'partial' && 'border-warning/50 text-warning',
          bin.status === 'empty' && 'border-muted-foreground/30',
          bin.status === 'locked' && 'border-destructive/50 text-destructive'
        )}>
          {bin.status}
        </Badge>
        {bin.isLocked && (
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onUnlockBin(bin.id); }}>
            <Unlock className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>
    );
  };

  const renderRack = (rack: RackConfig) => {
    const levels = getLevelsForRack(rack.id);
    const allBins = getBinsForRack(rack.id);
    const isRackExpanded = expandedRacks.has(rack.id);
    const isRackSelected = selectedRackId === rack.id;
    const occupiedBins = allBins.filter(b => b.status !== 'empty').length;

    return (
      <div key={rack.id} className="mb-0.5">
        <div className={cn(
          'flex items-center gap-1 p-1.5 rounded-md cursor-pointer transition-colors group',
          isRackSelected ? 'bg-primary/10' : 'hover:bg-muted/30'
        )}>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0"
            onClick={() => toggle(expandedRacks, setExpandedRacks, rack.id)}>
            {isRackExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
          <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex-1 min-w-0" onClick={() => onSelectRack(rack.id)}>
            <p className="text-xs font-medium truncate">{rack.code}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] h-4 px-1">{occupiedBins}/{allBins.length}</Badge>
          {rack.isLocked && <Lock className="h-2.5 w-2.5 text-warning" />}
        </div>

        {isRackExpanded && (
          <div className="ml-4 pl-3 border-l border-border/30 py-1">
            {levels.length > 1 ? (
              // Group bins by level
              levels.map(([level, levelBins]) => {
                const levelKey = `${rack.id}-L${level}`;
                const isLevelExpanded = expandedLevels.has(levelKey);
                return (
                  <div key={levelKey} className="mb-0.5">
                    <div className={cn(
                      'flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-muted/20',
                    )}
                      onClick={() => toggle(expandedLevels, setExpandedLevels, levelKey)}
                    >
                      <Button variant="ghost" size="icon" className="h-3.5 w-3.5 p-0">
                        {isLevelExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                      </Button>
                      <AlignJustify className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground font-medium">Level {level}</span>
                      <Badge variant="outline" className="text-[9px] h-3.5 px-1 ml-auto">{levelBins.length}</Badge>
                    </div>
                    {isLevelExpanded && (
                      <div className="ml-3 pl-3 border-l border-border/20">
                        {levelBins.map(renderBin)}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Single level or no levels — show bins directly
              allBins.map(renderBin)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAisle = (aisle: AisleConfig) => {
    const aisleRacks = getRacksForAisle(aisle.id);
    const isExpanded = expandedAisles.has(aisle.id);
    const isSelected = selectedAisleId === aisle.id;

    return (
      <div key={aisle.id} className="mb-0.5">
        <div className={cn(
          'flex items-center gap-1 p-1.5 rounded-md cursor-pointer transition-colors group',
          isSelected ? 'bg-primary/10' : 'hover:bg-muted/30'
        )}>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0"
            onClick={() => toggle(expandedAisles, setExpandedAisles, aisle.id)}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
          <AlignJustify className="h-3.5 w-3.5 text-blue-500/70" />
          <div className="flex-1 min-w-0" onClick={() => onSelectAisle?.(aisle.id)}>
            <p className="text-xs font-medium truncate">{aisle.name}</p>
            <p className="text-[10px] text-muted-foreground">{aisle.code} • {aisleRacks.length} racks</p>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => onAddRack(aisle.zoneId)}>
                  <Plus className="h-4 w-4 mr-2" />Add Rack
                </DropdownMenuItem>
                {onDeleteAisle && (
                  <>
                    <DropdownSeparator />
                    <DropdownMenuItem onClick={() => onDeleteAisle(aisle.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />Delete Aisle
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isExpanded && (
          <div className="ml-4 pl-3 border-l border-blue-500/20">
            {aisleRacks.map(renderRack)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Structure</h3>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={onAddZone} className="h-7 px-2">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search zones, aisles, racks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredZones.length === 0 && zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Layers className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm mb-2">No Zones Yet</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                Create your first zone to organize your warehouse layout
              </p>
              <Button size="sm" onClick={onAddZone} className="gap-2">
                <Plus className="h-4 w-4" />Create Zone
              </Button>
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <p className="text-xs text-muted-foreground">No zones match your search</p>
            </div>
          ) : (
            filteredZones.map((zone) => {
              const zoneAisles = getAislesForZone(zone.id);
              const zoneRacksWithoutAisle = getRacksWithoutAisle(zone.id);
              const allZoneRacks = getRacksForZone(zone.id);
              const isExpanded = expandedZones.has(zone.id);
              const isSelected = selectedZoneId === zone.id;

              return (
                <div key={zone.id} className="mb-1">
                  {/* Zone Node */}
                  <div className={cn(
                    'flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors group',
                    isSelected ? 'bg-accent/20' : 'hover:bg-muted/50'
                  )}>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0"
                      onClick={() => toggle(expandedZones, setExpandedZones, zone.id)}>
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </Button>
                    <div className="h-5 w-5 rounded flex items-center justify-center" style={{ backgroundColor: `${zone.color}20` }}>
                      <Layers className="h-3 w-3" style={{ color: zone.color }} />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => onSelectZone(zone.id)}>
                      <p className="text-sm font-medium truncate">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {zone.code}
                        {zoneAisles.length > 0 && ` • ${zoneAisles.length} aisles`}
                        {` • ${allZoneRacks.length} racks`}
                      </p>
                    </div>
                    {zone.isLocked && <Lock className="h-3 w-3 text-warning" />}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => onSelectZone(zone.id)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        {isAdmin && onAddAisle && (
                          <DropdownMenuItem onClick={() => onAddAisle(zone.id)}>
                            <Plus className="h-4 w-4 mr-2" />Add Aisle
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => onAddRack(zone.id)}>
                            <Plus className="h-4 w-4 mr-2" />Add Rack
                          </DropdownMenuItem>
                        )}
                        {isAdmin && onEditZone && (
                          <DropdownMenuItem onClick={() => onEditZone(zone.id)}>
                            <Pencil className="h-4 w-4 mr-2" />Edit Zone
                          </DropdownMenuItem>
                        )}
                        {isAdmin && onDeleteZone && (
                          <>
                            <DropdownSeparator />
                            <DropdownMenuItem onClick={() => onDeleteZone(zone.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Delete Zone
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Zone children: aisles and/or racks */}
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-border/50">
                      {/* Render aisles first */}
                      {zoneAisles.map(renderAisle)}
                      {/* Render racks that don't belong to any aisle */}
                      {zoneRacksWithoutAisle.map(renderRack)}
                      {/* Empty state */}
                      {zoneAisles.length === 0 && zoneRacksWithoutAisle.length === 0 && (
                        <div className="py-3 px-2 text-center">
                          <p className="text-[10px] text-muted-foreground">No locations yet</p>
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] mt-1" onClick={() => onAddRack(zone.id)}>
                              <Plus className="h-3 w-3 mr-1" />Add locations
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
