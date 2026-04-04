import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
import { RackConfig } from '@/shared/types/mapping';

interface ConfigureRackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rack: RackConfig | null;
  onSubmit: (rackId: string, data: RackUpdateData) => void;
}

export interface RackUpdateData {
  name: string;
  levels: number;
  binsPerLevel: number;
  rackType: string;
}

const rackTypes = [
  { value: 'selective', label: 'Selective' },
  { value: 'drive_in', label: 'Drive-In' },
  { value: 'push_back', label: 'Push-Back' },
  { value: 'pallet_flow', label: 'Pallet Flow' },
  { value: 'cantilever', label: 'Cantilever' },
];

export function ConfigureRackDialog({
  open,
  onOpenChange,
  rack,
  onSubmit,
}: ConfigureRackDialogProps) {
  const [formData, setFormData] = useState<RackUpdateData>({
    name: '',
    levels: 1,
    binsPerLevel: 1,
    rackType: 'selective',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rack) {
      setFormData({
        name: rack.name || rack.code,
        levels: rack.levels || 1,
        binsPerLevel: rack.binsPerLevel || 1,
        rackType: 'selective',
      });
      setErrors({});
    }
  }, [rack]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Rack name is required';
    if (formData.levels < 1 || formData.levels > 20) newErrors.levels = 'Levels must be between 1 and 20';
    if (formData.binsPerLevel < 1 || formData.binsPerLevel > 50) newErrors.binsPerLevel = 'Bins per level must be between 1 and 50';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (rack) {
      onSubmit(rack.id, formData);
      onOpenChange(false);
    }
  };

  if (!rack) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Configure Rack — {rack.code}
          </DialogTitle>
          <DialogDescription>
            Update the rack configuration. Note: changing levels or bins per level will not add or remove existing bins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="rack-name">Rack Name</Label>
            <Input
              id="rack-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Rack R004"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rack-type">Rack Type</Label>
            <Select
              value={formData.rackType}
              onValueChange={(v) => setFormData(prev => ({ ...prev, rackType: v }))}
            >
              <SelectTrigger id="rack-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rackTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rack-levels">Levels</Label>
              <Input
                id="rack-levels"
                type="number"
                min={1}
                max={20}
                value={formData.levels}
                onChange={(e) => setFormData(prev => ({ ...prev, levels: parseInt(e.target.value) || 1 }))}
                className={errors.levels ? 'border-destructive' : ''}
              />
              {errors.levels && <p className="text-xs text-destructive">{errors.levels}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rack-bins">Bins per Level</Label>
              <Input
                id="rack-bins"
                type="number"
                min={1}
                max={50}
                value={formData.binsPerLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, binsPerLevel: parseInt(e.target.value) || 1 }))}
                className={errors.binsPerLevel ? 'border-destructive' : ''}
              />
              {errors.binsPerLevel && <p className="text-xs text-destructive">{errors.binsPerLevel}</p>}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Capacity Summary</p>
            <p>Total bins (metadata): {formData.levels} levels × {formData.binsPerLevel} bins = <strong>{formData.levels * formData.binsPerLevel} bins</strong></p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Settings className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
