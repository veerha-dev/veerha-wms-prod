import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SEVERITY_COLORS: Record<string, string> = { expired: 'hsl(0, 84%, 60%)', critical: 'hsl(25, 95%, 53%)', warning: 'hsl(38, 92%, 50%)', normal: 'hsl(142, 71%, 45%)' };

const filterConfig: FilterConfig[] = [
  { key: 'days_ahead', label: 'Days Ahead', type: 'number', placeholder: '30', defaultValue: 30 },
  { key: 'warehouse_id', label: 'Warehouse', type: 'warehouse' },
  { key: 'include_expired', label: 'Include Expired', type: 'boolean' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'batch_number', label: 'Batch #', type: 'text' },
  { key: 'sku_code', label: 'SKU Code', type: 'text' },
  { key: 'sku_name', label: 'SKU Name', type: 'text' },
  { key: 'quantity', label: 'Qty', type: 'number' },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { key: 'days_until_expiry', label: 'Days Left', type: 'number' },
  { key: 'severity', label: 'Severity', type: 'badge' },
];

export default function ExpiryReportPage() {
  return (
    <ReportViewer
      reportType="expiry_report"
      title="Expiry Report"
      description="Batches approaching or past expiry with severity classification"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      defaultFilters={{ days_ahead: 90 }}
      renderCharts={(data) => <ExpiryCharts data={data} />}
    />
  );
}

function ExpiryCharts({ data }: { data: any[] }) {
  const { sevData, skuData } = useMemo(() => {
    const sMap: Record<string, number> = {};
    const skMap: Record<string, number> = {};
    data.forEach((r) => {
      const s = r.severity || 'normal';
      sMap[s] = (sMap[s] || 0) + 1;
      const sku = r.sku_code || 'Unknown';
      skMap[sku] = (skMap[sku] || 0) + (Number(r.quantity) || 0);
    });
    return {
      sevData: Object.entries(sMap).map(([name, value]) => ({ name, value })),
      skuData: Object.entries(skMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Batches by Severity</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sevData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                {sevData.map((e) => <Cell key={e.name} fill={SEVERITY_COLORS[e.name] || '#888'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {sevData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs capitalize">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: SEVERITY_COLORS[e.name] || '#888' }} />{e.name} ({e.value})
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Expiring Qty by SKU</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skuData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString('en-IN'), 'Qty']} />
              <Bar dataKey="value" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
