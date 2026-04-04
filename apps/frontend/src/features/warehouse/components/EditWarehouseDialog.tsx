import { useState, useEffect } from 'react';

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
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';

type DBWarehouse = any;
type WarehouseType = any;
type WarehouseStatus = any;

interface EditWarehouseDialogProps {
  warehouse: DBWarehouse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<DBWarehouse>) => void;
}

const warehouseTypes: { value: WarehouseType; label: string }[] = [
  { value: 'distribution', label: 'Distribution Centre' },
  { value: 'manufacturing', label: 'Manufacturing Unit' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'bonded', label: 'Bonded Warehouse' },
  { value: 'transit', label: 'Transit Hub' },
  { value: 'retail', label: 'Retail Store' },
];

export function EditWarehouseDialog({
  warehouse,
  open,
  onOpenChange,
  onSave,
}: EditWarehouseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'distribution' as WarehouseType,
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    totalCapacity: '',
    contactPhone: '',
    contactEmail: '',
    status: 'active' as WarehouseStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        type: warehouse.type,
        address: warehouse.addressLine1 || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        postalCode: warehouse.postalCode || '',
        country: warehouse.country || 'India',
        totalCapacity: (warehouse.totalCapacity || 0).toString(),
        contactPhone: warehouse.contactPhone || '',
        contactEmail: warehouse.contactEmail || '',
        status: warehouse.status,
      });
      setErrors({});
    }
  }, [warehouse]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Godown name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.totalCapacity || parseInt(formData.totalCapacity) <= 0) {
      newErrors.totalCapacity = 'Valid capacity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !warehouse) return;

    setIsLoading(true);
    
    try {
      await onSave({
        name: formData.name.trim(),
        type: formData.type,
        addressLine1: formData.address.trim(),
        addressLine2: null,
        city: formData.city.trim(),
        state: formData.state.trim() || null,
        postalCode: formData.postalCode.trim() || null,
        country: formData.country.trim(),
        totalCapacity: parseInt(formData.totalCapacity),
        contactPhone: formData.contactPhone.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        status: formData.status,
      });
      
      toast.success('Godown updated successfully');
    } catch (error) {
      console.error('Failed to update warehouse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!warehouse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Edit Godown</DialogTitle>
              <DialogDescription>
                Update the details for {warehouse.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Godown Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Peenya Main Godown"
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Godown Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: WarehouseType) => setFormData({ ...formData, type: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Address *</Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Complete address (street, landmark, area, etc.)"
              className={errors.address ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-city">City *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Bengaluru"
                className={errors.city ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state">State *</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Karnataka"
                className={errors.state ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal">Pin Code</Label>
              <Input
                id="edit-postal"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="560001"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity (units) *</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                placeholder="10000"
                className={errors.totalCapacity ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.totalCapacity && <p className="text-xs text-destructive">{errors.totalCapacity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: WarehouseStatus) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input
                id="edit-phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="warehouse@company.com"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
