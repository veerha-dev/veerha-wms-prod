import { useInvoices } from '@/hooks/useBilling';
import { useDashboard } from '@/hooks/useDashboard';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function BillingPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: stats } = useDashboard();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500 mt-1">Revenue and invoice management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold">₹{(stats?.mrr || 0).toLocaleString('en-IN')}</p><p className="text-sm text-slate-500">Monthly Recurring Revenue</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center"><CreditCard className="h-6 w-6 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">₹{(stats?.arr || 0).toLocaleString('en-IN')}</p><p className="text-sm text-slate-500">Annual Recurring Revenue</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{stats?.pendingInvoices || 0}</p><p className="text-sm text-slate-500">Pending Invoices</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Invoices</h3></div>
        {isLoading ? <div className="p-8 text-center text-slate-400">Loading...</div> : invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No invoices yet</div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Invoice #</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Tenant</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Due Date</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.tenantName || inv.tenantId?.substring(0,8)}</td>
                  <td className="px-6 py-4 font-medium">₹{Number(inv.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
