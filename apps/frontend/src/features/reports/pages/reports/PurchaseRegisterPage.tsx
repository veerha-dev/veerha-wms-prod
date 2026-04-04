import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)', 'hsl(142, 71%, 45%)'];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'draft' }, { label: 'Submitted', value: 'submitted' },
    { label: 'Approved', value: 'approved' }, { label: 'Cancelled', value: 'cancelled' },
  ]},
  { key: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Search supplier' },
  { key: 'date_from', label: 'Date From', type: 'date' },
  { key: 'date_to', label: 'Date To', type: 'date' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'po_number', label: 'PO Number', type: 'text' },
  { key: 'supplier_name', label: 'Supplier', type: 'text' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'total_amount', label: 'Total Amount', type: 'currency' },
  { key: 'grn_count', label: 'GRNs', type: 'number' },
  { key: 'created_at', label: 'Created', type: 'datetime' },
];

export default function PurchaseRegisterPage() {
  return (
    <ReportViewer
      reportType="purchase_register"
      title="Purchase Register"
      description="Purchase orders with totals, status, and GRN count"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <PurchaseCharts data={data} />}
    />
  );
}

function PurchaseCharts({ data }: { data: any[] }) {
  const { statusData, supplierData } = useMemo(() => {
    const sMap: Record<string, number> = {};
    const supMap: Record<string, number> = {};
    data.forEach((r) => {
      sMap[r.status || 'unknown'] = (sMap[r.status || 'unknown'] || 0) + 1;
      const sup = r.supplier_name || 'Unknown';
      supMap[sup] = (supMap[sup] || 0) + (Number(r.total_amount) || 0);
    });
    return {
      statusData: Object.entries(sMap).map(([name, value]) => ({ name, value })),
      supplierData: Object.entries(supMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">POs by Status</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {statusData.map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs capitalize">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{e.name} ({e.value})
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Total by Supplier</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={supplierData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
              <Bar dataKey="value" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
