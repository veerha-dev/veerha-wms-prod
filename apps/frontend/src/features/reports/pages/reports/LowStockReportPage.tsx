import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SEVERITY_COLORS: Record<string, string> = { critical: 'hsl(0, 84%, 60%)', high: 'hsl(25, 95%, 53%)', medium: 'hsl(38, 92%, 50%)' };

const filterConfig: FilterConfig[] = [
  { key: 'warehouse_id', label: 'Warehouse', type: 'warehouse' },
  { key: 'category', label: 'Category', type: 'text', placeholder: 'Filter by category' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'sku_code', label: 'SKU Code', type: 'text' },
  { key: 'sku_name', label: 'SKU Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'quantity_available', label: 'Available', type: 'number' },
  { key: 'reorder_point', label: 'Reorder Point', type: 'number' },
  { key: 'deficit', label: 'Deficit', type: 'number' },
  { key: 'severity', label: 'Severity', type: 'badge' },
  { key: 'unit_cost', label: 'Unit Cost', type: 'currency' },
];

export default function LowStockReportPage() {
  return (
    <ReportViewer
      reportType="low_stock_report"
      title="Low Stock Report"
      description="SKUs below reorder point with deficit calculation and severity"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <LowStockCharts data={data} />}
    />
  );
}

function LowStockCharts({ data }: { data: any[] }) {
  const { sevData, deficitData } = useMemo(() => {
    const sMap: Record<string, number> = {};
    data.forEach((r) => { const s = r.severity || 'medium'; sMap[s] = (sMap[s] || 0) + 1; });
    const dData = data.map((r) => ({ name: r.sku_code || '?', deficit: Number(r.deficit) || 0 })).sort((a, b) => b.deficit - a.deficit).slice(0, 8);
    return { sevData: Object.entries(sMap).map(([name, value]) => ({ name, value })), deficitData: dData };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Severity Distribution</h3>
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
        <h3 className="text-sm font-semibold mb-3">Top Deficit SKUs</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deficitData} layout="vertical" margin={{ left: 90 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={85} />
              <Tooltip formatter={(v: number) => [v.toLocaleString('en-IN') + ' units', 'Deficit']} />
              <Bar dataKey="deficit" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
