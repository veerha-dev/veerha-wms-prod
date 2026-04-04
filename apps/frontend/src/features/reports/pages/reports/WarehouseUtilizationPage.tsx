import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)'];

const filterConfig: FilterConfig[] = [
  { key: 'warehouse_id', label: 'Warehouse', type: 'warehouse' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'name', label: 'Warehouse', type: 'text' },
  { key: 'type', label: 'Type', type: 'badge' },
  { key: 'total_capacity', label: 'Total Capacity', type: 'number' },
  { key: 'current_occupancy', label: 'Used', type: 'number' },
  { key: 'utilization_percent', label: 'Utilization %', type: 'percentage' },
  { key: 'total_zones', label: 'Zones', type: 'number' },
  { key: 'total_bins', label: 'Bins', type: 'number' },
  { key: 'total_sku_count', label: 'SKUs', type: 'number' },
  { key: 'total_stock_qty', label: 'Stock Qty', type: 'number' },
  { key: 'status', label: 'Status', type: 'badge' },
];

export default function WarehouseUtilizationPage() {
  return (
    <ReportViewer
      reportType="warehouse_utilization"
      title="Warehouse Utilization"
      description="Capacity vs usage by warehouse with zone and bin breakdown"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <UtilCharts data={data} />}
    />
  );
}

function UtilCharts({ data }: { data: any[] }) {
  const { utilData, stockData } = useMemo(() => ({
    utilData: data.map((r) => ({ name: r.name || 'Unknown', pct: Number(r.utilization_percent) || 0 })),
    stockData: data.filter((r) => Number(r.total_stock_qty) > 0).map((r) => ({ name: r.name || 'Unknown', value: Number(r.total_stock_qty) || 0 })),
  }), [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Utilization % by Warehouse</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={115} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Utilization']} />
              <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                {utilData.map((e, i) => <Cell key={i} fill={e.pct > 80 ? 'hsl(0, 84%, 60%)' : e.pct > 50 ? 'hsl(38, 92%, 50%)' : 'hsl(142, 71%, 45%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Stock Distribution</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stockData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                {stockData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v.toLocaleString('en-IN') + ' units', 'Stock']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {stockData.map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{e.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
