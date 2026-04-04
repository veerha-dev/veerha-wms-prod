import { useState } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import { 
  Plus,
  Grid3X3,
  Settings,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { BulkRackGeneration } from '@/shared/types/mapping';

interface BulkRackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BulkRackGeneration) => void;
  zoneId: string;
  zoneName: string;
  maxRacks: number;
  currentRacks: number;
}

export function BulkRackDialog({
  open,
  onOpenChange,
  onSubmit,
  zoneId,
  zoneName,
  maxRacks,
  currentRacks,
}: BulkRackDialogProps) {
  const [formData, setFormData] = useState<BulkRackGeneration>({
    zoneId,
    rows: 2,
    columns: 3,
    levelsPerRack: 4,
    binsPerLevel: 6,
    rackPrefix: 'R',
    startingNumber: currentRacks + 1,
    maxWeightPerBin: 500,
    palletCompatible: true,
  });

  const totalRacks = formData.rows * formData.columns;
  const totalBins = totalRacks * formData.levelsPerRack * formData.binsPerLevel;
  const remainingSlots = maxRacks - currentRacks;
  const exceedsLimit = totalRacks > remainingSlots;

  const handleSubmit = () => {
    if (exceedsLimit) return;
    onSubmit({ ...formData, zoneId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Bulk Generate Racks
          </DialogTitle>
          <DialogDescription>
            Automatically create multiple racks with bins in <strong>{zoneName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Grid Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={10}
                value={formData.rows}
                onChange={(e) => setFormData(prev => ({ ...prev, rows: safeParseInt(e.target.value, 1) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="columns">Columns</Label>
              <Input
                id="columns"
                type="number"
                min={1}
                max={10}
                value={formData.columns}
                onChange={(e) => setFormData(prev => ({ ...prev, columns: safeParseInt(e.target.value, 1) }))}
              />
            </div>
          </div>

          {/* Rack Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="levels">Levels per Rack</Label>
              <Select
                value={String(formData.levelsPerRack)}
                onValueChange={(v) => setFormData(prev => ({ ...prev, levelsPerRack: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} levels</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="binsPerLevel">Bins per Level</Label>
              <Select
                value={String(formData.binsPerLevel)}
                onValueChange={(v) => setFormData(prev => ({ ...prev, binsPerLevel: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8, 10].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} bins</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Naming */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Rack Prefix</Label>
              <Input
                id="prefix"
                value={formData.rackPrefix}
                onChange={(e) => setFormData(prev => ({ ...prev, rackPrefix: e.target.value.toUpperCase() }))}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startNum">Starting Number</Label>
              <Input
                id="startNum"
                type="number"
                min={1}
                value={formData.startingNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, startingNumber: safeParseInt(e.target.value, 1) }))}
              />
            </div>
          </div>

          {/* Bin Settings */}
          <div className="space-y-3 pt-2 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Bin Settings
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Max Weight/Bin (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.maxWeightPerBin}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWeightPerBin: safeParseInt(e.target.value, 0) }))}
                />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="pallet">Pallet Compatible</Label>
                <Switch
                  id="pallet"
                  checked={formData.palletCompatible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, palletCompatible: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">Generation Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{totalRacks}</p>
                <p className="text-xs text-muted-foreground">Racks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBins}</p>
                <p className="text-xs text-muted-foreground">Total Bins</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{remainingSlots}</p>
                <p className="text-xs text-muted-foreground">Capacity Left</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Codes: {formData.rackPrefix}{String(formData.startingNumber).padStart(2, '0')} - {formData.rackPrefix}{String(formData.startingNumber + totalRacks - 1).padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1 italic">
              Note: Bins are created empty. Add stock via Inventory module.
            </p>
          </div>

          {exceedsLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cannot create {totalRacks} racks. Only {remainingSlots} slots available in your plan.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={exceedsLimit}>
            <Plus className="h-4 w-4 mr-2" />
            Generate {totalRacks} Racks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
