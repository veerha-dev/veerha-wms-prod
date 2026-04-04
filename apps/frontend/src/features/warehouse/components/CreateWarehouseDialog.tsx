import { useState } from 'react';
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
import { useCreateWarehouse } from '@/features/warehouse/hooks/useWarehouses';


type WarehouseType = any;
type WarehouseStatus = any;

interface CreateWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxWarehouses: number;
  currentCount: number;
}

const warehouseTypes: { value: WarehouseType; label: string }[] = [
  { value: 'distribution', label: 'Distribution Centre' },
  { value: 'manufacturing', label: 'Manufacturing Unit' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'bonded', label: 'Bonded Warehouse' },
  { value: 'transit', label: 'Transit Hub' },
  { value: 'retail', label: 'Retail Store' },
];

export function CreateWarehouseDialog({
  open,
  onOpenChange,
  maxWarehouses,
  currentCount,
}: CreateWarehouseDialogProps) {
  const createWarehouse = useCreateWarehouse();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'distribution' as WarehouseType,
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    totalAreaSqft: '',
    totalCapacity: '',
    contactPhone: '',
    contactEmail: '',
    status: 'active' as WarehouseStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'distribution',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      totalAreaSqft: '',
      totalCapacity: '',
      contactPhone: '',
      contactEmail: '',
      status: 'active',
    });
    setErrors({});
  };

  const generateCode = (name: string) => {
    // Let backend handle code generation - this is just for display placeholder
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Godown name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.totalCapacity || parseInt(formData.totalCapacity) <= 0) {
      newErrors.totalCapacity = 'Valid capacity is required';
    } else if (parseInt(formData.totalCapacity) > 10000000) {
      newErrors.totalCapacity = 'Capacity must be less than 1 crore sq ft';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // No limits - all users can create unlimited warehouses

    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        code: '', // Always let backend generate
        type: formData.type,
        addressLine1: formData.address.trim(),
        addressLine2: null,
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim() || null,
        country: formData.country.trim(),
        totalAreaSqft: formData.totalAreaSqft ? parseFloat(formData.totalAreaSqft) : null,
        totalCapacity: parseInt(formData.totalCapacity),
        contactPhone: formData.contactPhone.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        status: formData.status,
      };
      
      console.log('🚀 Creating warehouse with payload:', payload);
      await createWarehouse.mutateAsync(payload);

      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error('Failed to create warehouse:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const isLimitReached = false; // No limits for any user
  const isLoading = createWarehouse.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create New Godown</DialogTitle>
              <DialogDescription>
                Define a new godown location for your operations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Godown Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Peenya Main Godown"
                className={errors.name ? 'border-destructive' : ''}
                disabled={isLimitReached || isLoading}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Godown Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Auto-generated if empty"
                disabled={isLimitReached || isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Godown Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: WarehouseType) => setFormData({ ...formData, type: value })}
                disabled={isLimitReached || isLoading}
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
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: WarehouseStatus) => setFormData({ ...formData, status: value })}
                disabled={isLimitReached || isLoading}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Complete address (street, landmark, area, etc.)"
              className={errors.address ? 'border-destructive' : ''}
              disabled={isLimitReached || isLoading}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Bengaluru"
                className={errors.city ? 'border-destructive' : ''}
                disabled={isLimitReached || isLoading}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Karnataka"
                className={errors.state ? 'border-destructive' : ''}
                disabled={isLimitReached || isLoading}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Pin Code</Label>
              <Input
                id="postal_code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="560001"
                disabled={isLimitReached || isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_capacity">Total Capacity (units) *</Label>
              <Input
                id="total_capacity"
                type="number"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                placeholder="10000"
                className={errors.totalCapacity ? 'border-destructive' : ''}
                disabled={isLimitReached || isLoading}
              />
              {errors.totalCapacity && <p className="text-xs text-destructive">{errors.totalCapacity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_area_sqft">Total Area (sq ft)</Label>
              <Input
                id="total_area_sqft"
                type="number"
                value={formData.totalAreaSqft}
                onChange={(e) => setFormData({ ...formData, totalAreaSqft: e.target.value })}
                placeholder="50000"
                disabled={isLimitReached || isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 9876543210"
                disabled={isLimitReached || isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="warehouse@company.com"
                disabled={isLimitReached || isLoading}
              />
            </div>
          </div>

          {/* Plan Limit Info */}
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p>
              Godown usage: <span className="font-medium">{currentCount}</span> godowns created
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || isLimitReached}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Godown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
