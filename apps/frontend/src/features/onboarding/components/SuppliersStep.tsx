import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/use-toast';
import { onboardingApi, SupplierCreate } from '../api/onboarding.api';

interface Props {
  onCompleted: () => void | Promise<void>;
}

export function SuppliersStep({ onCompleted }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<SupplierCreate[]>([
    { name: '', contactPerson: '', email: '', phone: '', gstNumber: '', paymentTerms: 'Net 30', address: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  const update = (i: number, patch: Partial<SupplierCreate>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((rs) => [...rs, { name: '', paymentTerms: 'Net 30' }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const submit = async () => {
    const valid = rows.filter((r) => r.name?.trim());
    if (valid.length === 0) {
      toast({ title: 'Add at least one supplier with a name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    setResults(null);
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of valid) {
      try {
        await onboardingApi.createSupplier(row);
        created++;
      } catch (err: any) {
        failed++;
        const msg = err?.response?.data?.message || err?.message || 'Unknown';
        errors.push(`${row.name}: ${msg}`);
      }
    }

    setResults({ created, failed, errors });
    setSaving(false);
    toast({
      title: 'Suppliers saved',
      description: `${created} created, ${failed} failed.`,
      variant: failed > 0 ? 'destructive' : 'default',
    });
    if (created > 0 && failed === 0) {
      await onCompleted();
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name *</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell><Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} /></TableCell>
                <TableCell><Input value={r.contactPerson || ''} onChange={(e) => update(i, { contactPerson: e.target.value })} /></TableCell>
                <TableCell><Input type="email" value={r.email || ''} onChange={(e) => update(i, { email: e.target.value })} /></TableCell>
                <TableCell><Input value={r.phone || ''} onChange={(e) => update(i, { phone: e.target.value })} /></TableCell>
                <TableCell><Input value={r.gstNumber || ''} onChange={(e) => update(i, { gstNumber: e.target.value })} /></TableCell>
                <TableCell><Input value={r.paymentTerms || ''} onChange={(e) => update(i, { paymentTerms: e.target.value })} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeRow(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-4 w-4" />
          Add supplier
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save suppliers
        </Button>
      </div>

      {results && results.failed > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="mb-1 font-medium text-destructive">{results.failed} supplier(s) failed</div>
          <ul className="ml-4 list-disc">
            {results.errors.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
