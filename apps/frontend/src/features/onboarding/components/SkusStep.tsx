import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { AlertTriangle, FileUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/use-toast';
import { onboardingApi, SkuImportRow } from '../api/onboarding.api';

interface Props {
  onCompleted: () => void | Promise<void>;
}

const HEADERS_GUIDE = ['code', 'name', 'category', 'uom', 'minStock', 'maxStock', 'reorderPoint', 'hsnCode', 'batchTracking', 'serialTracking', 'expiryTracking'];

export function SkusStep({ onCompleted }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<SkuImportRow[]>([
    { code: '', name: '', category: 'general', uom: 'pcs', minStock: 0, maxStock: 0, reorderPoint: 0 },
  ]);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<Array<{ row: number; message: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<SkuImportRow>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((rs) => [...rs, { code: '', name: '', category: 'general', uom: 'pcs' }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const handleFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: SkuImportRow[] = res.data
          .map((r) => ({
            code: r.code?.trim() || undefined,
            name: (r.name || r.Name || '').trim(),
            category: r.category || 'general',
            uom: r.uom || 'pcs',
            minStock: toNum(r.minStock),
            maxStock: toNum(r.maxStock),
            reorderPoint: toNum(r.reorderPoint),
            hsnCode: r.hsnCode,
            batchTracking: toBool(r.batchTracking),
            serialTracking: toBool(r.serialTracking),
            expiryTracking: toBool(r.expiryTracking),
          }))
          .filter((r) => r.name);

        if (parsed.length === 0) {
          toast({ title: 'No rows found', description: 'CSV had no rows with a name column.', variant: 'destructive' });
          return;
        }
        setRows(parsed);
        toast({ title: `Parsed ${parsed.length} rows`, description: 'Review and submit below.' });
      },
      error: (err) => {
        toast({ title: 'CSV parse failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  const submit = async () => {
    const valid = rows.filter((r) => r.name && r.name.trim().length > 0);
    if (valid.length === 0) {
      toast({ title: 'Add at least one SKU with a name', variant: 'destructive' });
      return;
    }
    setImporting(true);
    setErrors([]);
    try {
      const result = await onboardingApi.importSkus(valid);
      setErrors(result.errors);
      toast({
        title: 'Import complete',
        description: `${result.created} created, ${result.failed} failed.`,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });
      if (result.created > 0 && result.failed === 0) {
        await onCompleted();
      }
    } catch (err: any) {
      toast({
        title: 'Import failed',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
        <div className="text-sm">
          <div className="font-medium">Bulk import via CSV</div>
          <div className="text-xs text-muted-foreground">
            Headers: {HEADERS_GUIDE.join(', ')}
          </div>
        </div>
        <div>
          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileRef}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <FileUp className="mr-1 h-4 w-4" />
            Upload CSV
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Name *</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-20">UoM</TableHead>
              <TableHead className="w-20">Min</TableHead>
              <TableHead className="w-20">Max</TableHead>
              <TableHead className="w-20">Reorder</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell><Input value={r.code || ''} onChange={(e) => update(i, { code: e.target.value })} placeholder="auto" /></TableCell>
                <TableCell><Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} /></TableCell>
                <TableCell><Input value={r.category || ''} onChange={(e) => update(i, { category: e.target.value })} /></TableCell>
                <TableCell><Input value={r.uom || ''} onChange={(e) => update(i, { uom: e.target.value })} /></TableCell>
                <TableCell><Input type="number" value={r.minStock ?? 0} onChange={(e) => update(i, { minStock: toNum(e.target.value) })} /></TableCell>
                <TableCell><Input type="number" value={r.maxStock ?? 0} onChange={(e) => update(i, { maxStock: toNum(e.target.value) })} /></TableCell>
                <TableCell><Input type="number" value={r.reorderPoint ?? 0} onChange={(e) => update(i, { reorderPoint: toNum(e.target.value) })} /></TableCell>
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
          Add row
        </Button>
        <Button onClick={submit} disabled={importing}>
          {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import {rows.filter((r) => r.name?.trim()).length} SKU(s)
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-1 font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" /> {errors.length} row(s) failed
          </div>
          <ul className="ml-4 list-disc space-y-1">
            {errors.slice(0, 10).map((e) => (
              <li key={e.row}>Row {e.row}: {e.message}</li>
            ))}
            {errors.length > 10 && <li>…and {errors.length - 10} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function toNum(v: any): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
function toBool(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v !== 'string') return false;
  return ['true', '1', 'yes', 'y'].includes(v.toLowerCase().trim());
}
