import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ZoneType, ZONE_COLORS } from '@/shared/types/mapping';
import { api } from '@/shared/lib/api';

const ZONE_TYPES: { value: ZoneType; label: string }[] = [
  { value: 'receiving', label: 'Receiving' },
  { value: 'storage', label: 'Storage' },
  { value: 'picking', label: 'Picking' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'returns', label: 'Returns' },
  { value: 'cold-storage', label: 'Cold Storage' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'fast-moving', label: 'Fast Moving' },
];

const editZoneSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(20),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.string().min(1, 'Please select a zone type'),
  capacityVolume: z.number().min(100, 'Minimum capacity is 100 m³'),
});

export type EditZoneFormData = z.infer<typeof editZoneSchema>;

interface EditZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EditZoneFormData) => Promise<void>;
  warehouseId: string;
  zone: {
    id: string;
    code: string;
    name: string;
    type: ZoneType;
    capacityVolume: number;
  } | null;
}

export function EditZoneDialog({
  open,
  onOpenChange,
  onSubmit,
  warehouseId,
  zone,
}: EditZoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const form = useForm<EditZoneFormData>({
    resolver: zodResolver(editZoneSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'storage',
      capacityVolume: 1000,
    },
  });

  // Update form when zone changes
  useEffect(() => {
    if (zone) {
      form.reset({
        code: zone.code,
        name: zone.name,
        type: zone.type,
        capacityVolume: zone.capacityVolume,
      });
    }
  }, [zone, form]);

  const validateUniqueCode = async (code: string): Promise<boolean> => {
    if (!warehouseId || !zone) return true;
    
    // Skip validation if code hasn't changed
    if (code === zone.code) return true;
    
    try {
      const { data } = await api.get('/api/v1/zones', { params: { warehouseId, code } });
      const zones = data.data || [];
      return zones.filter((z: any) => z.id !== zone.id).length === 0;
    } catch {
      return true;
    }
  };

  const handleSubmit = async (data: EditZoneFormData) => {
    setCodeError(null);
    
    // Validate unique code
    const isUnique = await validateUniqueCode(data.code);
    if (!isUnique) {
      setCodeError('This code is already used in this warehouse');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Zone</DialogTitle>
          <DialogDescription>
            Update zone configuration. Zone code must be unique within this warehouse.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., ZN-01" 
                        {...field}
                        onChange={(e) => {
                          setCodeError(null);
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {codeError && (
                      <p className="text-sm font-medium text-destructive">{codeError}</p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Storage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {ZONE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: ZONE_COLORS[type.value] || 'hsl(var(--primary))' }}
                            />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacityVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Capacity (m³)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
