import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/use-toast';
import { onboardingApi } from '../api/onboarding.api';

interface Props {
  warehouseId: string | null;
  setWarehouseId: (id: string) => void;
  onCompleted: () => void | Promise<void>;
}

const WAREHOUSE_TYPES = [
  { value: 'distribution', label: 'Distribution' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'bonded', label: 'Bonded' },
  { value: 'transit', label: 'Transit' },
  { value: 'retail', label: 'Retail' },
];

export function WarehouseStep({ warehouseId, setWarehouseId, onCompleted }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    type: 'distribution',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    totalCapacity: 1000,
    totalAreaSqft: 5000,
    contactPhone: '',
    contactEmail: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: any) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  const submit = async () => {
    if (!form.name.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim()) {
      toast({ title: 'Missing fields', description: 'Name, address, city, and state are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const wh = await onboardingApi.createWarehouse({
        name: form.name,
        type: form.type,
        addressLine1: form.addressLine1,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        totalCapacity: Number(form.totalCapacity) || 0,
        totalAreaSqft: Number(form.totalAreaSqft) || 0,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
      });
      setWarehouseId(wh.id);
      toast({ title: 'Warehouse created', description: `Code: ${wh.code}` });
      await onCompleted();
    } catch (err: any) {
      toast({
        title: 'Could not create warehouse',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (warehouseId) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm dark:border-green-800/40 dark:bg-green-900/20">
        Warehouse created in this session (id <code className="rounded bg-background px-1">{warehouseId}</code>).
        Click <strong>Skip this step</strong> below to continue to layout, or create another below.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Warehouse Name *</Label>
        <Input value={form.name} onChange={set('name')} placeholder="e.g. Bangalore Main Warehouse" />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={form.type} onValueChange={(v) => set('type')(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {WAREHOUSE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>City *</Label>
        <Input value={form.city} onChange={set('city')} />
      </div>
      <div className="md:col-span-2">
        <Label>Address Line 1 *</Label>
        <Input value={form.addressLine1} onChange={set('addressLine1')} />
      </div>
      <div>
        <Label>State *</Label>
        <Input value={form.state} onChange={set('state')} />
      </div>
      <div>
        <Label>Postal Code</Label>
        <Input value={form.postalCode} onChange={set('postalCode')} />
      </div>
      <div>
        <Label>Total capacity (units)</Label>
        <Input type="number" value={form.totalCapacity} onChange={set('totalCapacity')} />
      </div>
      <div>
        <Label>Total area (sqft)</Label>
        <Input type="number" value={form.totalAreaSqft} onChange={set('totalAreaSqft')} />
      </div>
      <div>
        <Label>Contact phone</Label>
        <Input value={form.contactPhone} onChange={set('contactPhone')} />
      </div>
      <div>
        <Label>Contact email</Label>
        <Input value={form.contactEmail} onChange={set('contactEmail')} />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button onClick={submit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create warehouse
        </Button>
      </div>
    </div>
  );
}
