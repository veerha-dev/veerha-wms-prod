import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, TreePine } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { onboardingApi, LayoutZoneSpec, OnboardingStatus } from '../api/onboarding.api';

interface Props {
  warehouseId: string | null;
  onCompleted: () => void | Promise<void>;
  status?: OnboardingStatus;
}

const ZONE_TYPES = [
  'receiving', 'storage', 'picking', 'packing', 'shipping',
  'returns', 'staging', 'cold-storage', 'hazardous', 'bulk', 'fast-moving',
];

type ZoneRow = LayoutZoneSpec;

export function LayoutStep({ warehouseId, onCompleted, status }: Props) {
  const { toast } = useToast();
  const [zones, setZones] = useState<ZoneRow[]>([
    { name: 'Receiving Zone', type: 'receiving', aisleCount: 0, rackCount: 2, levels: 3, positionsPerLevel: 4 },
    { name: 'Storage Zone', type: 'storage', aisleCount: 2, rackCount: 6, levels: 4, positionsPerLevel: 5 },
  ]);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    return zones.reduce(
      (acc, z) => {
        const bins = (z.rackCount || 0) * (z.levels || 0) * (z.positionsPerLevel || 0);
        return {
          zones: acc.zones + 1,
          aisles: acc.aisles + (z.aisleCount || 0),
          racks: acc.racks + (z.rackCount || 0),
          bins: acc.bins + bins,
        };
      },
      { zones: 0, aisles: 0, racks: 0, bins: 0 },
    );
  }, [zones]);

  const update = (i: number, patch: Partial<ZoneRow>) => {
    setZones((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addZone = () => {
    setZones((rows) => [
      ...rows,
      { name: `Zone ${rows.length + 1}`, type: 'storage', aisleCount: 0, rackCount: 1, levels: 2, positionsPerLevel: 2 },
    ]);
  };

  const removeZone = (i: number) => {
    setZones((rows) => rows.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (!warehouseId) {
      toast({
        title: 'No warehouse selected',
        description: 'Create a warehouse in step 1 first (or skip this step).',
        variant: 'destructive',
      });
      return;
    }
    if (zones.length === 0) {
      toast({ title: 'Add at least one zone', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const result = await onboardingApi.createLayout(warehouseId, zones);
      toast({
        title: 'Layout created',
        description: `${result.created.zones} zones · ${result.created.aisles} aisles · ${result.created.racks} racks · ${result.created.bins} bins`,
      });
      await onCompleted();
    } catch (err: any) {
      toast({
        title: 'Could not create layout',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!warehouseId && !status?.hasWarehouse) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700/40 dark:bg-amber-900/20">
        You need to create a warehouse first. Use the <strong>Back</strong> button to return to step 1.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!warehouseId && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700/40 dark:bg-amber-900/20">
          A warehouse exists for this tenant. Layout will be created against your first warehouse — you can also skip this and configure layout later from the Warehouses page.
        </div>
      )}

      {zones.map((z, i) => (
        <div key={i} className="grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-12">
          <div className="md:col-span-3">
            <Label className="text-xs">Zone name</Label>
            <Input value={z.name} onChange={(e) => update(i, { name: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Type</Label>
            <Select value={z.type} onValueChange={(v) => update(i, { type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <Label className="text-xs">Aisles</Label>
            <Input
              type="number"
              min={0}
              value={z.aisleCount ?? 0}
              onChange={(e) => update(i, { aisleCount: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Racks</Label>
            <Input
              type="number"
              min={1}
              value={z.rackCount}
              onChange={(e) => update(i, { rackCount: parseInt(e.target.value || '0', 10) })}
            />
          </div>
          <div className="md:col-span-1">
            <Label className="text-xs">Levels</Label>
            <Input
              type="number"
              min={1}
              value={z.levels}
              onChange={(e) => update(i, { levels: parseInt(e.target.value || '1', 10) })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Positions / level</Label>
            <Input
              type="number"
              min={1}
              value={z.positionsPerLevel}
              onChange={(e) => update(i, { positionsPerLevel: parseInt(e.target.value || '1', 10) })}
            />
          </div>
          <div className="flex items-end md:col-span-1">
            <Button variant="ghost" size="icon" onClick={() => removeZone(i)} disabled={zones.length === 1}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addZone}>
        <Plus className="mr-1 h-4 w-4" />
        Add zone
      </Button>

      {/* Live preview */}
      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        <div className="mb-2 flex items-center gap-1 font-medium">
          <TreePine className="h-4 w-4" />
          Live preview
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <Tile label="Zones" value={totals.zones} />
          <Tile label="Aisles" value={totals.aisles} />
          <Tile label="Racks" value={totals.racks} />
          <Tile label="Bins" value={totals.bins} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={saving || !warehouseId}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm & save layout
        </Button>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-background p-2">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
