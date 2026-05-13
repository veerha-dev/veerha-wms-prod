import { useEffect, useState } from 'react';
import { Loader2, Mail, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/use-toast';
import { api } from '@/shared/lib/api';
import { onboardingApi, InviteRow, OnboardingStatus } from '../api/onboarding.api';

interface Props {
  onCompleted: () => void | Promise<void>;
  status?: OnboardingStatus;
}

interface WhOption { id: string; name: string; code: string; }

export function TeamStep({ onCompleted }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<InviteRow[]>([
    { email: '', fullName: '', role: 'manager', warehouseId: undefined, phone: '' },
  ]);
  const [warehouses, setWarehouses] = useState<WhOption[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/v1/warehouses', { params: { limit: 100 } });
        const list = (res.data?.data || []) as Array<{ id: string; name: string; code: string }>;
        setWarehouses(list);
        // Default the warehouse on first row to the first warehouse if available
        if (list.length > 0) {
          setRows((rs) => rs.map((r, i) => (i === 0 && !r.warehouseId ? { ...r, warehouseId: list[0].id } : r)));
        }
      } catch {
        // Manager-role admin onboarding might not have a warehouse yet — that's OK
      }
    })();
  }, []);

  const update = (i: number, patch: Partial<InviteRow>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { email: '', fullName: '', role: 'worker', warehouseId: warehouses[0]?.id, phone: '' },
    ]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const submit = async () => {
    const valid = rows.filter((r) => r.email?.trim() && r.fullName?.trim());
    if (valid.length === 0) {
      toast({ title: 'Add at least one invite with name and email', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const result = await onboardingApi.inviteBulk(valid);
      toast({
        title: 'Invitations sent',
        description: `${result.invited} sent, ${result.failed} failed`,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });
      if (result.invited > 0) {
        await onCompleted();
      }
    } catch (err: any) {
      toast({
        title: 'Bulk invite failed',
        description: err?.response?.data?.message || err?.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        Invitees receive an email with login URL and a temporary password. They'll be asked to change it on first login.
      </div>

      <div className="max-h-96 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full name *</TableHead>
              <TableHead>Email *</TableHead>
              <TableHead className="w-32">Role</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell><Input value={r.fullName} onChange={(e) => update(i, { fullName: e.target.value })} /></TableCell>
                <TableCell><Input type="email" value={r.email} onChange={(e) => update(i, { email: e.target.value })} /></TableCell>
                <TableCell>
                  <Select value={r.role} onValueChange={(v) => update(i, { role: v as 'manager' | 'worker' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={r.warehouseId || ''}
                    onValueChange={(v) => update(i, { warehouseId: v || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={warehouses.length ? 'Select warehouse' : 'No warehouses yet'} />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.code} · {w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input value={r.phone || ''} onChange={(e) => update(i, { phone: e.target.value })} /></TableCell>
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
          Add invite
        </Button>
        <Button onClick={submit} disabled={sending}>
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
          Send invitations
        </Button>
      </div>
    </div>
  );
}
