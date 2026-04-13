import { useState, useEffect } from 'react';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { Plus, FileText, DollarSign, AlertTriangle, CheckCircle, Clock, Trash2, MoreHorizontal, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { useAuth } from '@/shared/contexts/AuthContext';
import {
  useInvoices, useInvoiceStats, useCreateInvoice, useUpdateInvoiceStatus, useDeleteInvoice,
} from '@/features/invoices/hooks/useInvoices';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { InvoiceForm } from '@/features/invoices/components/InvoiceForm';

export default function InvoicesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (isManager && user?.warehouseId) setWarehouseFilter(user.warehouseId);
  }, [isManager, user?.warehouseId]);

  const effectiveWarehouseId = warehouseFilter || undefined;

  const { data: invoicesData, isLoading } = useInvoices({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    warehouseId: effectiveWarehouseId,
  });
  const { data: stats } = useInvoiceStats(effectiveWarehouseId);
  const { data: warehouses } = useWarehouses();
  const createInvoice = useCreateInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  const invoices = invoicesData?.data || invoicesData || [];

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      purchase: 'bg-blue-100 text-blue-700',
      sales: 'bg-green-100 text-green-700',
      service: 'bg-purple-100 text-purple-700',
    };
    return <Badge className={config[type] || 'bg-gray-100 text-gray-700'}>{type}</Badge>;
  };

  const getStatusBadge = (inv: any) => {
    const isOverdue = inv.isOverdue || (inv.dueDate && new Date(inv.dueDate) < new Date() && !['paid', 'cancelled'].includes(inv.status));
    if (isOverdue && inv.status !== 'paid' && inv.status !== 'cancelled') {
      return <Badge className="bg-red-100 text-red-700 gap-1"><AlertTriangle className="h-3 w-3" />Overdue</Badge>;
    }
    const config: Record<string, { color: string; label: string }> = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-700', label: 'Sent' },
      paid: { color: 'bg-green-100 text-green-700', label: 'Paid' },
      partial: { color: 'bg-orange-100 text-orange-700', label: 'Partial' },
      overdue: { color: 'bg-red-100 text-red-700', label: 'Overdue' },
      cancelled: { color: 'bg-gray-100 text-gray-500', label: 'Cancelled' },
    };
    const c = config[inv.status] || config.draft;
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const formatCurrency = (n: number) => `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const handlePrintInvoice = (inv: any) => {
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    const gstLabel = inv.gstType === 'inter-state' ? `IGST: ${formatCurrency(inv.igstAmount)}` : `CGST: ${formatCurrency(inv.cgstAmount)} | SGST: ${formatCurrency(inv.sgstAmount)}`;
    w.document.write(`
      <html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{font-size:24px;margin-bottom:4px}
      .meta{display:flex;justify-content:space-between;margin:20px 0}
      .meta div{font-size:13px}
      .totals{text-align:right;margin-top:20px;font-size:13px}
      .totals div{margin:4px 0}
      .total-line{font-size:16px;font-weight:bold;border-top:2px solid #333;padding-top:8px;margin-top:8px}
      @media print{body{padding:20px}}</style></head><body>
      <h1>INVOICE</h1>
      <p style="color:#666;margin:0">${inv.invoiceNumber} | ${inv.type?.toUpperCase()} INVOICE</p>
      <div class="meta">
        <div><strong>${inv.type === 'purchase' ? 'Supplier' : 'Customer'}:</strong><br/>${inv.customer?.name || inv.supplier?.name || '-'}</div>
        <div><strong>Date:</strong> ${formatDate(inv.invoiceDate)}<br/><strong>Due:</strong> ${formatDate(inv.dueDate)}<br/><strong>Terms:</strong> ${inv.paymentTerms} days</div>
      </div>
      ${inv.purchaseOrder?.poNumber ? `<p><strong>PO:</strong> ${inv.purchaseOrder.poNumber}</p>` : ''}
      ${inv.salesOrder?.soNumber ? `<p><strong>SO:</strong> ${inv.salesOrder.soNumber}</p>` : ''}
      <div class="totals">
        <div>Subtotal: ${formatCurrency(inv.subtotal)}</div>
        ${inv.discountAmount > 0 ? `<div>Discount: -${formatCurrency(inv.discountAmount)}</div>` : ''}
        <div>${gstLabel}</div>
        <div class="total-line">Grand Total: ${formatCurrency(inv.totalAmount)}</div>
      </div>
      <p style="margin-top:30px;font-size:11px;color:#999">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <AppLayout title="Invoices" breadcrumbs={[{ label: 'Operations' }, { label: 'Invoices' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage purchase, sales, and service invoices with GST</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{stats?.paid || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{(stats?.draft || 0) + (stats?.sent || 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent><div className="text-4xl font-bold text-orange-600">{formatCurrency(stats?.totalOutstanding || 0)}</div></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="Search invoice#, customer, supplier..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Select value={warehouseFilter || 'all'} onValueChange={v => setWarehouseFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {(warehouses || []).map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Invoice Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer / Supplier</TableHead>
                    <TableHead>Linked Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(invoices) ? invoices : []).map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{getTypeBadge(inv.type)}</TableCell>
                      <TableCell className="text-sm">
                        {inv.type === 'purchase' ? inv.supplier?.name || '-' : inv.customer?.name || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.purchaseOrder?.poNumber || inv.salesOrder?.soNumber || '-'}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(inv.invoiceDate)}</TableCell>
                      <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(inv.subtotal)}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(inv.taxAmount)}</TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatCurrency(inv.totalAmount)}</TableCell>
                      <TableCell>{getStatusBadge(inv)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePrintInvoice(inv)}>
                              <Printer className="h-4 w-4 mr-2" />Download PDF
                            </DropdownMenuItem>
                            {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => updateStatus.mutate({ id: inv.id, status: 'paid', paidAmount: inv.totalAmount })}>
                                <CheckCircle className="h-4 w-4 mr-2" />Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteInvoice.mutate(inv.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {(!Array.isArray(invoices) || invoices.length === 0) && !isLoading && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium">No invoices found</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first invoice to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Dialog */}
      <InvoiceForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) => createInvoice.mutate(data)}
        isLoading={createInvoice.isPending}
        defaultWarehouseId={isManager ? user?.warehouseId || '' : ''}
        isManager={isManager}
      />
    </AppLayout>
  );
}
