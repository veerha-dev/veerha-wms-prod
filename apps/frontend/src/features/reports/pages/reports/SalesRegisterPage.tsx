import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)', 'hsl(142, 71%, 45%)'];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Draft', value: 'draft' }, { label: 'Confirmed', value: 'confirmed' },
    { label: 'Picking', value: 'picking' }, { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' },
  ]},
  { key: 'customer', label: 'Customer', type: 'text', placeholder: 'Search customer' },
  { key: 'date_from', label: 'Date From', type: 'date' },
  { key: 'date_to', label: 'Date To', type: 'date' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'so_number', label: 'Order #', type: 'text' },
  { key: 'customer_name', label: 'Customer', type: 'text' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'status', label: 'Status', type: 'badge' },
  { key: 'item_count', label: 'Items', type: 'number' },
  { key: 'total_quantity', label: 'Total Qty', type: 'number' },
  { key: 'total_amount', label: 'Total Value', type: 'currency' },
  { key: 'shipment_count', label: 'Shipments', type: 'number' },
  { key: 'created_at', label: 'Created', type: 'datetime' },
];

export default function SalesRegisterPage() {
  return (
    <ReportViewer
      reportType="sales_register"
      title="Sales Register"
      description="Sales orders with totals, shipment info, and status tracking"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <SalesCharts data={data} />}
    />
  );
}

function SalesCharts({ data }: { data: any[] }) {
  const { statusData, custData } = useMemo(() => {
    const sMap: Record<string, number> = {};
    const cMap: Record<string, number> = {};
    data.forEach((r) => {
      sMap[r.status || 'unknown'] = (sMap[r.status || 'unknown'] || 0) + 1;
      const c = r.customer_name || 'Unknown';
      cMap[c] = (cMap[c] || 0) + (Number(r.total_amount) || 0);
    });
    return {
      statusData: Object.entries(sMap).map(([name, value]) => ({ name, value })),
      custData: Object.entries(cMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Orders by Status</h3>
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
        <h3 className="text-sm font-semibold mb-3">Revenue by Customer</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={custData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
