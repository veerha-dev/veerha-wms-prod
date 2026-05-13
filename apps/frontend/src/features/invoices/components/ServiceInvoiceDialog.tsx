import { useEffect, useState } from 'react';
import { Loader2, Wrench } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { api } from '@/shared/lib/api';
import { useToast } from '@/shared/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses?: Array<{ id: string; name: string; code?: string }>;
}

interface CustomerOpt { id: string; name: string; code?: string; }

export function ServiceInvoiceDialog({ open, onOpenChange, warehouses = [] }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [customers, setCustomers] = useState<CustomerOpt[]>([]);
  const [form, setForm] = useState({
    customerId: '',
    warehouseId: '',
    billingPeriodStart: '',
    billingPeriodEnd: '',
    storageCharges: 0,
    handlingCharges: 0,
    vasCharges: 0,
    taxRate: 18,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await api.get('/api/v1/customers', { params: { limit: 100 } });
        setCustomers((res.data?.data || []) as CustomerOpt[]);
      } catch {
        setCustomers([]);
      }
    })();
  }, [open]);

  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.customerId || !form.billingPeriodStart || !form.billingPeriodEnd) {
      toast({ title: 'Missing fields', description: 'Customer and billing period are required.', variant: 'destructive' });
      return;
    }
    if ((form.storageCharges + form.handlingCharges + form.vasCharges) <= 0) {
      toast({ title: 'No charges entered', description: 'Enter at least one charge amount.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/api/v1/invoices/service', form);
      toast({ title: 'Service invoice created', description: data.data?.invoiceNumber });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Could not create service invoice',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> New Service Invoice (3PL)
          </DialogTitle>
          <DialogDescription>
            Bill a client for storage, handling, and value-added services for a billing period.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Client *</Label>
            <Select value={form.customerId} onValueChange={set('customerId')}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code ? `${c.code} · ` : ''}{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Warehouse</Label>
            <Select value={form.warehouseId} onValueChange={set('warehouseId')}>
              <SelectTrigger><SelectValue placeholder="Optional — drives GST split" /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.code ? `${w.code} · ` : ''}{w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Billing period from *</Label>
            <Input type="date" value={form.billingPeriodStart} onChange={(e) => set('billingPeriodStart')(e.target.value)} />
          </div>
          <div>
            <Label>Billing period to *</Label>
            <Input type="date" value={form.billingPeriodEnd} onChange={(e) => set('billingPeriodEnd')(e.target.value)} />
          </div>

          <div>
            <Label>Storage charges (₹)</Label>
            <Input type="number" min={0} value={form.storageCharges}
              onChange={(e) => set('storageCharges')(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <Label>Handling charges (₹)</Label>
            <Input type="number" min={0} value={form.handlingCharges}
              onChange={(e) => set('handlingCharges')(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <Label>Value-added services (₹)</Label>
            <Input type="number" min={0} value={form.vasCharges}
              onChange={(e) => set('vasCharges')(parseFloat(e.target.value || '0'))} />
          </div>
          <div>
            <Label>Tax rate (%)</Label>
            <Input type="number" min={0} max={28} value={form.taxRate}
              onChange={(e) => set('taxRate')(parseFloat(e.target.value || '0'))} />
          </div>

          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              placeholder="Internal note for this invoice (optional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create service invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
