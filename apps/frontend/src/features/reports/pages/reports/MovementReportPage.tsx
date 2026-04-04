import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(25, 95%, 53%)'];

const filterConfig: FilterConfig[] = [
  { key: 'movement_type', label: 'Movement Type', type: 'select', options: [
    { label: 'Stock In', value: 'stock_in' }, { label: 'Stock Out', value: 'stock_out' },
    { label: 'Transfer', value: 'transfer' }, { label: 'Putaway', value: 'putaway' },
    { label: 'Pick', value: 'pick' }, { label: 'Adjustment', value: 'adjustment' },
    { label: 'Return', value: 'return' }, { label: 'Damage', value: 'damage' },
  ]},
  { key: 'date_from', label: 'Date From', type: 'date' },
  { key: 'date_to', label: 'Date To', type: 'date' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'movement_number', label: 'Movement #', type: 'text' },
  { key: 'movement_type', label: 'Type', type: 'badge' },
  { key: 'sku_code', label: 'SKU Code', type: 'text' },
  { key: 'sku_name', label: 'SKU Name', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'reason', label: 'Reason', type: 'text' },
  { key: 'created_at', label: 'Date', type: 'datetime' },
];

export default function MovementReportPage() {
  return (
    <ReportViewer
      reportType="movement_report"
      title="Movement Report"
      description="All inventory movements with detailed filtering"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <MovementCharts data={data} />}
    />
  );
}

function MovementCharts({ data }: { data: any[] }) {
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((r) => { const t = r.movement_type || 'unknown'; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name: name.replace(/_/g, ' '), count })).sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <div className="wms-card p-4">
      <h3 className="text-sm font-semibold mb-3">Movements by Type</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
