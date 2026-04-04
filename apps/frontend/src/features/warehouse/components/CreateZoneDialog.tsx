import { useState } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import React from 'react';
import { 
  Plus,
  X,
  Layers,
  Palette,
  Weight,
  Box,
  Tag,
  FileText,
  Package,
  Truck,
  Send,
  RotateCcw,
  Shield,
  AlertTriangle,
  Snowflake,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
import { Badge } from '@/shared/components/ui/badge';
import { ZoneType, ZONE_COLORS } from '@/shared/types/mapping';

interface CreateZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ZoneFormData) => void;
  warehouseId: string;
}

export interface ZoneFormData {
  code: string;
  name: string;
  type: ZoneType;
  capacityWeight: number;
  capacityVolume: number;
  allowedCategories: string[];
  handlingRules: string[];
}

const zoneTypes: { value: ZoneType; label: string; icon: string; color: string }[] = [
  { value: 'receiving', label: 'Receiving', icon: 'Truck', color: 'bg-wms-receiving/20 text-wms-receiving border-wms-receiving/40' },
  { value: 'storage', label: 'Storage', icon: 'Layers', color: 'bg-wms-storage/20 text-wms-storage border-wms-storage/40' },
  { value: 'picking', label: 'Picking', icon: 'Package', color: 'bg-wms-picking/20 text-wms-picking border-wms-picking/40' },
  { value: 'packing', label: 'Packing', icon: 'PackageCheck', color: 'bg-wms-packing/20 text-wms-packing border-wms-packing/40' },
  { value: 'shipping', label: 'Shipping', icon: 'Send', color: 'bg-wms-shipping/20 text-wms-shipping border-wms-shipping/40' },
  { value: 'returns', label: 'Returns', icon: 'RotateCcw', color: 'bg-wms-returns/20 text-wms-returns border-wms-returns/40' },
  { value: 'staging', label: 'Staging', icon: 'Boxes', color: 'bg-wms-staging/20 text-wms-staging border-wms-staging/40' },
  { value: 'cold-storage', label: 'Cold Storage', icon: 'Snowflake', color: 'bg-wms-cold/20 text-wms-cold border-wms-cold/40' },
  { value: 'hazardous', label: 'Hazardous', icon: 'AlertTriangle', color: 'bg-destructive/20 text-destructive border-destructive/40' },
];

const defaultCategories = [
  'Electronics', 'Hardware', 'General', 'Perishables', 
  'Pharmaceuticals', 'Chemicals', 'Fragile', 'Heavy'
];

export function CreateZoneDialog({
  open,
  onOpenChange,
  onSubmit,
  warehouseId,
}: CreateZoneDialogProps) {
  const [formData, setFormData] = useState<ZoneFormData>({
    code: '',
    name: '',
    type: 'storage',
    capacityWeight: 50000,
    capacityVolume: 5000000,
    allowedCategories: [],
    handlingRules: [],
  });
  const [newRule, setNewRule] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Zone code is optional - backend will auto-generate if empty
    if (formData.code.trim() && !/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'Code must be uppercase letters, numbers, or hyphens';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Zone name is required';
    }
    
    if (formData.capacityWeight <= 0) {
      newErrors.capacityWeight = 'Capacity must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    onOpenChange(false);
    setFormData({
      code: '',
      name: '',
      type: 'storage',
      capacityWeight: 50000,
      capacityVolume: 5000000,
      allowedCategories: [],
      handlingRules: [],
    });
    setErrors({});
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(category)
        ? prev.allowedCategories.filter(c => c !== category)
        : [...prev.allowedCategories, category],
    }));
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        handlingRules: [...prev.handlingRules, newRule.trim()],
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      handlingRules: prev.handlingRules.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-wms-picking/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-wms-picking" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Create New Zone</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Add a new zone to organize your warehouse layout. Zones help categorize storage areas.
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">Zone Code (optional)</Label>
                <Input
                  id="code"
                  placeholder="e.g., STR-B"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className={errors.code ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">Leave empty to auto-generate (e.g., STO-001)</p>
                {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Zone Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ZoneType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${type.color}`} />
                          {React.createElement(type.icon as any, { className: "h-4 w-4" })}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Zone Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Storage Zone B"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2 text-sm font-medium">
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  Max Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.capacityWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacityWeight: safeParseInt(e.target.value, 0) }))}
                  className={errors.capacityWeight ? 'border-destructive' : ''}
                />
                {errors.capacityWeight && <p className="text-xs text-destructive">{errors.capacityWeight}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume" className="flex items-center gap-2 text-sm font-medium">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  Max Volume (cm³)
                </Label>
                <Input
                  id="volume"
                  type="number"
                  value={formData.capacityVolume}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacityVolume: safeParseInt(e.target.value, 0) }))}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Allowed Categories
              </Label>
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map(cat => (
                  <Badge
                    key={cat}
                    variant={formData.allowedCategories.includes(cat) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Handling Rules */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Handling Rules
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a handling rule..."
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addRule()}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={addRule}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.handlingRules.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.handlingRules.map((rule, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {rule}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                        onClick={() => removeRule(i)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-wms-picking text-white hover:bg-wms-picking/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Zone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
