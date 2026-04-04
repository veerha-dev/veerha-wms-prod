import { useState, useMemo } from 'react';
import React from 'react';
import { safeParseInt } from '@/shared/utils/input';
import {
  Plus, X, Layers, Weight, Box, Tag, FileText, ChevronRight, ChevronLeft, Check, TreePine, Eye,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { ZoneType, ZONE_COLORS, BulkZoneCreation } from '@/shared/types/mapping';

interface CreateZoneWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BulkZoneCreation) => void;
  warehouseId: string;
  isLoading?: boolean;
}

interface AisleRow {
  name: string;
  code: string;
  rackCount: number;
}

interface RackRow {
  name: string;
  code: string;
  levels: number;
  positionsPerLevel: number;
  aisleIndex?: number;
}

const zoneTypes: { value: ZoneType; label: string; color: string }[] = [
  { value: 'receiving', label: 'Receiving', color: 'bg-wms-receiving/20 text-wms-receiving border-wms-receiving/40' },
  { value: 'storage', label: 'Storage', color: 'bg-wms-storage/20 text-wms-storage border-wms-storage/40' },
  { value: 'picking', label: 'Picking', color: 'bg-wms-picking/20 text-wms-picking border-wms-picking/40' },
  { value: 'packing', label: 'Packing', color: 'bg-wms-packing/20 text-wms-packing border-wms-packing/40' },
  { value: 'shipping', label: 'Shipping', color: 'bg-wms-shipping/20 text-wms-shipping border-wms-shipping/40' },
  { value: 'returns', label: 'Returns', color: 'bg-wms-returns/20 text-wms-returns border-wms-returns/40' },
  { value: 'staging', label: 'Staging', color: 'bg-wms-staging/20 text-wms-staging border-wms-staging/40' },
  { value: 'cold-storage', label: 'Cold Storage', color: 'bg-wms-cold/20 text-wms-cold border-wms-cold/40' },
  { value: 'hazardous', label: 'Hazardous', color: 'bg-destructive/20 text-destructive border-destructive/40' },
];

const defaultCategories = [
  'Electronics', 'Hardware', 'General', 'Perishables',
  'Pharmaceuticals', 'Chemicals', 'Fragile', 'Heavy'
];

export function CreateZoneWizard({ open, onOpenChange, onSubmit, warehouseId, isLoading }: CreateZoneWizardProps) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ZoneType>('storage');
  const [capacityWeight, setCapacityWeight] = useState(50000);
  const [capacityVolume, setCapacityVolume] = useState(5000000);
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [handlingRules, setHandlingRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [numAisles, setNumAisles] = useState(0);
  const [numRacks, setNumRacks] = useState(0);

  // Step 2 state
  const [aisles, setAisles] = useState<AisleRow[]>([]);

  // Step 3 state
  const [racks, setRacks] = useState<RackRow[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep(1);
    setCode('');
    setName('');
    setType('storage');
    setCapacityWeight(50000);
    setCapacityVolume(5000000);
    setAllowedCategories([]);
    setHandlingRules([]);
    setNewRule('');
    setNumAisles(0);
    setNumRacks(0);
    setAisles([]);
    setRacks([]);
    setErrors({});
  };

  // Determine which steps are active
  const hasAisles = numAisles > 0;
  const hasRacks = hasAisles ? aisles.some(a => a.rackCount > 0) : numRacks > 0;
  const totalSteps = hasAisles || hasRacks ? 4 : 1; // zone only vs full wizard

  const getStepLabel = (s: number) => {
    if (s === 1) return 'Zone Details';
    if (s === 2) return hasAisles ? 'Configure Aisles' : 'Configure Racks';
    if (s === 3) return 'Configure Racks';
    return 'Preview & Confirm';
  };

  // Step 1 → next
  const handleStep1Next = () => {
    const newErrors: Record<string, string> = {};
    if (code.trim() && !/^[A-Z0-9-]+$/.test(code)) newErrors.code = 'Code must be uppercase letters, numbers, or hyphens';
    if (!name.trim()) newErrors.name = 'Zone name is required';
    if (capacityWeight <= 0) newErrors.capacityWeight = 'Must be > 0';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    if (numAisles === 0 && numRacks === 0) {
      // Zone only — submit directly
      onSubmit({ warehouseId, code: code || undefined, name, type, capacityWeight, capacityVolume, allowedCategories, handlingRules });
      resetForm();
      onOpenChange(false);
      return;
    }

    if (hasAisles) {
      // Generate aisle rows
      const prefix = code || name.substring(0, 3).toUpperCase();
      const newAisles: AisleRow[] = Array.from({ length: numAisles }, (_, i) => ({
        name: `Aisle ${i + 1}`,
        code: `${prefix}-A${i + 1}`,
        rackCount: 0,
      }));
      setAisles(newAisles);
      setStep(2);
    } else {
      // Skip aisles, generate rack rows directly
      const prefix = code || name.substring(0, 3).toUpperCase();
      const newRacks: RackRow[] = Array.from({ length: numRacks }, (_, i) => ({
        name: `Rack ${i + 1}`,
        code: `${prefix}-R${String(i + 1).padStart(2, '0')}`,
        levels: 4,
        positionsPerLevel: 5,
      }));
      setRacks(newRacks);
      setStep(3);
    }
  };

  // Step 2 (aisles) → next
  const handleStep2Next = () => {
    // Generate rack rows based on aisle rack counts
    const prefix = code || name.substring(0, 3).toUpperCase();
    const newRacks: RackRow[] = [];
    aisles.forEach((aisle, aisleIdx) => {
      for (let r = 0; r < aisle.rackCount; r++) {
        newRacks.push({
          name: `Rack ${r + 1}`,
          code: `${aisle.code}-R${String(r + 1).padStart(2, '0')}`,
          levels: 4,
          positionsPerLevel: 5,
          aisleIndex: aisleIdx,
        });
      }
    });
    setRacks(newRacks);
    if (newRacks.length > 0) {
      setStep(3);
    } else {
      setStep(4); // No racks, go to preview
    }
  };

  // Step 3 (racks) → preview
  const handleStep3Next = () => setStep(4);

  // Preview calculations
  const previewData = useMemo(() => {
    const totalAisles = hasAisles ? aisles.length : 0;
    const totalRacks = racks.length;
    let totalPositions = 0;
    racks.forEach(r => { totalPositions += (r.levels || 0) * (r.positionsPerLevel || 0); });
    return { totalAisles, totalRacks, totalPositions };
  }, [aisles, racks, hasAisles]);

  // Final submit
  const handleConfirm = () => {
    const payload: BulkZoneCreation = {
      warehouseId,
      code: code || undefined,
      name,
      type,
      capacityWeight,
      capacityVolume,
      aisles: hasAisles ? aisles.map(a => ({ name: a.name, code: a.code, rackCount: a.rackCount })) : undefined,
      racks: racks.map(r => ({
        name: r.name,
        code: r.code,
        levels: r.levels,
        positionsPerLevel: r.positionsPerLevel,
        aisleIndex: r.aisleIndex,
      })),
    };
    onSubmit(payload);
    resetForm();
    onOpenChange(false);
  };

  const toggleCategory = (cat: string) => {
    setAllowedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const addRule = () => {
    if (newRule.trim()) { setHandlingRules(prev => [...prev, newRule.trim()]); setNewRule(''); }
  };

  const updateAisle = (index: number, field: keyof AisleRow, value: any) => {
    setAisles(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const updateRack = (index: number, field: keyof RackRow, value: any) => {
    setRacks(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const stepIndicator = (
    <div className="flex items-center gap-1 px-4 pt-2 pb-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const s = i + 1;
        const isActive = s === step;
        const isDone = s < step;
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {isDone ? <Check className="h-3 w-3" /> : <span>{s}</span>}
              <span className="hidden sm:inline">{getStepLabel(s)}</span>
            </div>
            {s < totalSteps && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-wms-picking/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-wms-picking" />
            </div>
            <div>
              <div className="text-lg font-semibold">Create New Zone</div>
              <DialogDescription className="text-sm text-muted-foreground">
                Set up a zone with aisles, racks, and positions in one flow.
              </DialogDescription>
            </div>
          </DialogTitle>
          {totalSteps > 1 && stepIndicator}
        </DialogHeader>

        {/* STEP 1 — Zone Details */}
        {step === 1 && (
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Zone Code (optional)</Label>
                <Input placeholder="e.g., STR-B" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className={errors.code ? 'border-destructive' : ''} />
                <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Zone Type *</Label>
                <Select value={type} onValueChange={(v: ZoneType) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {zoneTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full border ${t.color}`} />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Zone Name *</Label>
              <Input placeholder="e.g., Storage Zone B" value={name} onChange={e => setName(e.target.value)} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium"><Weight className="h-3.5 w-3.5 text-muted-foreground" />Max Weight (kg)</Label>
                <Input type="number" value={capacityWeight} onChange={e => setCapacityWeight(safeParseInt(e.target.value, 0))} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium"><Box className="h-3.5 w-3.5 text-muted-foreground" />Max Volume (cm³)</Label>
                <Input type="number" value={capacityVolume} onChange={e => setCapacityVolume(safeParseInt(e.target.value, 0))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium"><Tag className="h-3.5 w-3.5 text-muted-foreground" />Allowed Categories</Label>
              <div className="flex flex-wrap gap-1.5">
                {defaultCategories.map(cat => (
                  <Badge key={cat} variant={allowedCategories.includes(cat) ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => toggleCategory(cat)}>{cat}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium"><FileText className="h-3.5 w-3.5 text-muted-foreground" />Handling Rules</Label>
              <div className="flex gap-2">
                <Input placeholder="Add a handling rule..." value={newRule} onChange={e => setNewRule(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRule()} className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={addRule}><Plus className="h-4 w-4" /></Button>
              </div>
              {handlingRules.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {handlingRules.map((rule, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs">{rule}<X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setHandlingRules(prev => prev.filter((_, idx) => idx !== i))} /></Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Add locations inside this zone now?</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Number of Aisles (0 if none)</Label>
                  <Input type="number" min={0} value={numAisles} onChange={e => { setNumAisles(safeParseInt(e.target.value, 0)); if (safeParseInt(e.target.value, 0) > 0) setNumRacks(0); }} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Number of Racks {numAisles > 0 ? '(set per aisle)' : '(0 if none)'}</Label>
                  <Input type="number" min={0} value={numRacks} onChange={e => setNumRacks(safeParseInt(e.target.value, 0))} disabled={numAisles > 0} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Aisle Configuration */}
        {step === 2 && hasAisles && (
          <div className="space-y-4 py-3">
            <div className="text-sm text-muted-foreground">Configure your {aisles.length} aisle(s). Set how many racks each aisle should have.</div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Aisle Name</th>
                    <th className="px-3 py-2 text-left font-medium">Aisle Code</th>
                    <th className="px-3 py-2 text-left font-medium">Racks</th>
                  </tr>
                </thead>
                <tbody>
                  {aisles.map((aisle, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1.5"><Input value={aisle.name} onChange={e => updateAisle(i, 'name', e.target.value)} className="h-8" /></td>
                      <td className="px-3 py-1.5"><Input value={aisle.code} onChange={e => updateAisle(i, 'code', e.target.value.toUpperCase())} className="h-8" /></td>
                      <td className="px-3 py-1.5"><Input type="number" min={0} value={aisle.rackCount} onChange={e => updateAisle(i, 'rackCount', safeParseInt(e.target.value, 0))} className="h-8 w-20" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3 — Rack Configuration */}
        {step === 3 && (
          <div className="space-y-4 py-3">
            <div className="text-sm text-muted-foreground">Configure each rack's levels and positions per level.</div>
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {hasAisles && <th className="px-3 py-2 text-left font-medium">Aisle</th>}
                    <th className="px-3 py-2 text-left font-medium">Rack Name</th>
                    <th className="px-3 py-2 text-left font-medium">Rack Code</th>
                    <th className="px-3 py-2 text-left font-medium">Levels</th>
                    <th className="px-3 py-2 text-left font-medium">Pos/Level</th>
                  </tr>
                </thead>
                <tbody>
                  {racks.map((rack, i) => {
                    const prevAisleIdx = i > 0 ? racks[i - 1].aisleIndex : undefined;
                    const showAisleHeader = hasAisles && rack.aisleIndex !== prevAisleIdx;
                    return (
                      <React.Fragment key={i}>
                        {showAisleHeader && (
                          <tr className="bg-primary/5">
                            <td colSpan={hasAisles ? 5 : 4} className="px-3 py-1.5 font-medium text-primary text-xs">
                              {aisles[rack.aisleIndex!]?.name} — {aisles[rack.aisleIndex!]?.code}
                            </td>
                          </tr>
                        )}
                        <tr className="border-t">
                          {hasAisles && <td className="px-3 py-1.5 text-muted-foreground text-xs">{aisles[rack.aisleIndex!]?.code}</td>}
                          <td className="px-3 py-1.5"><Input value={rack.name} onChange={e => updateRack(i, 'name', e.target.value)} className="h-8" /></td>
                          <td className="px-3 py-1.5"><Input value={rack.code} onChange={e => updateRack(i, 'code', e.target.value.toUpperCase())} className="h-8" /></td>
                          <td className="px-3 py-1.5"><Input type="number" min={0} max={20} value={rack.levels} onChange={e => updateRack(i, 'levels', safeParseInt(e.target.value, 0))} className="h-8 w-16" /></td>
                          <td className="px-3 py-1.5"><Input type="number" min={0} max={50} value={rack.positionsPerLevel} onChange={e => updateRack(i, 'positionsPerLevel', safeParseInt(e.target.value, 0))} className="h-8 w-16" /></td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 4 — Preview */}
        {step === 4 && (
          <div className="space-y-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium"><Eye className="h-4 w-4" />Preview — What will be created</div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {hasAisles && (
                <div className="rounded-lg border bg-muted/30 p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{previewData.totalAisles}</div>
                  <div className="text-xs text-muted-foreground">Aisles</div>
                </div>
              )}
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <div className="text-2xl font-bold text-primary">{previewData.totalRacks}</div>
                <div className="text-xs text-muted-foreground">Racks</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <div className="text-2xl font-bold text-primary">{previewData.totalPositions}</div>
                <div className="text-xs text-muted-foreground">Positions</div>
              </div>
            </div>

            {/* Tree preview */}
            <div className="border rounded-lg p-3 bg-muted/20 max-h-[300px] overflow-y-auto text-sm font-mono">
              <div className="flex items-center gap-1.5 font-semibold">
                <TreePine className="h-4 w-4 text-primary" />
                {name || 'Zone'} {code ? `— ${code}` : ''} <Badge variant="outline" className="ml-1 text-xs">{type}</Badge>
              </div>
              {hasAisles ? (
                aisles.map((aisle, ai) => {
                  const aisleRacks = racks.filter(r => r.aisleIndex === ai);
                  return (
                    <div key={ai} className="ml-4 mt-1">
                      <div className="text-muted-foreground">├── {aisle.name} — {aisle.code}</div>
                      {aisleRacks.map((rack, ri) => (
                        <div key={ri} className="ml-4">
                          <div className="text-muted-foreground">{ri === aisleRacks.length - 1 ? '└──' : '├──'} {rack.name} — {rack.code}</div>
                          {rack.levels > 0 && Array.from({ length: Math.min(rack.levels, 3) }, (_, l) => (
                            <div key={l} className="ml-4 text-xs text-muted-foreground/70">
                              {l === Math.min(rack.levels, 3) - 1 ? '└──' : '├──'} Level {l + 1} → {Array.from({ length: Math.min(rack.positionsPerLevel, 6) }, (_, p) => `P${p + 1}`).join(', ')}{rack.positionsPerLevel > 6 ? `, ... (${rack.positionsPerLevel} total)` : ''}
                            </div>
                          ))}
                          {rack.levels > 3 && <div className="ml-4 text-xs text-muted-foreground/50">    ... ({rack.levels} levels total)</div>}
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                racks.map((rack, ri) => (
                  <div key={ri} className="ml-4 mt-1">
                    <div className="text-muted-foreground">{ri === racks.length - 1 ? '└──' : '├──'} {rack.name} — {rack.code}</div>
                    {rack.levels > 0 && Array.from({ length: Math.min(rack.levels, 3) }, (_, l) => (
                      <div key={l} className="ml-4 text-xs text-muted-foreground/70">
                        {l === Math.min(rack.levels, 3) - 1 ? '└──' : '├──'} Level {l + 1} → {Array.from({ length: Math.min(rack.positionsPerLevel, 6) }, (_, p) => `P${p + 1}`).join(', ')}{rack.positionsPerLevel > 6 ? `, ... (${rack.positionsPerLevel} total)` : ''}
                      </div>
                    ))}
                    {rack.levels > 3 && <div className="ml-4 text-xs text-muted-foreground/50">    ... ({rack.levels} levels total)</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter className="border-t pt-3 gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(prev => {
              if (prev === 3 && !hasAisles) return 1; // Skip back to step 1 if no aisles
              if (prev === 4 && !hasRacks) return hasAisles ? 2 : 1;
              return prev - 1;
            })}>
              <ChevronLeft className="h-4 w-4 mr-1" />Back
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancel</Button>

          {step === 1 && (
            <Button onClick={handleStep1Next} className="bg-wms-picking text-white hover:bg-wms-picking/90">
              {numAisles === 0 && numRacks === 0 ? <><Plus className="h-4 w-4 mr-1" />Create Zone</> : <>Next<ChevronRight className="h-4 w-4 ml-1" /></>}
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleStep2Next}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
          )}
          {step === 3 && (
            <Button onClick={handleStep3Next}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
          )}
          {step === 4 && (
            <Button onClick={handleConfirm} disabled={isLoading} className="bg-wms-picking text-white hover:bg-wms-picking/90">
              <Check className="h-4 w-4 mr-1" />Confirm & Save All
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
