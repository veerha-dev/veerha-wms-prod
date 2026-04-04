import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(340, 75%, 55%)', 'hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', 'hsl(25, 95%, 53%)'];

const filterConfig: FilterConfig[] = [
  { key: 'warehouse_id', label: 'Warehouse', type: 'warehouse' },
  { key: 'category', label: 'Category', type: 'text', placeholder: 'Filter by category' },
  { key: 'low_stock_only', label: 'Low Stock Only', type: 'boolean' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'sku_code', label: 'SKU Code', type: 'text' },
  { key: 'sku_name', label: 'SKU Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'quantity_available', label: 'Available', type: 'number' },
  { key: 'quantity_reserved', label: 'Reserved', type: 'number' },
  { key: 'quantity_damaged', label: 'Damaged', type: 'number' },
  { key: 'reorder_point', label: 'Reorder Point', type: 'number' },
  { key: 'unit_cost', label: 'Unit Cost', type: 'currency' },
  { key: 'stock_value', label: 'Stock Value', type: 'currency' },
];

export default function StockReportPage() {
  return (
    <ReportViewer
      reportType="stock_report"
      title="Stock Report"
      description="Current stock levels by SKU, warehouse, and bin with batch details"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <StockCharts data={data} />}
    />
  );
}

function StockCharts({ data }: { data: any[] }) {
  const { whData, topSKUs } = useMemo(() => {
    const whMap: Record<string, number> = {};
    const skuMap: Record<string, { name: string; value: number }> = {};
    data.forEach((r) => {
      const wh = r.warehouse_name || 'Unknown';
      whMap[wh] = (whMap[wh] || 0) + (Number(r.quantity_available) || 0);
      const code = r.sku_code || 'Unknown';
      if (!skuMap[code]) skuMap[code] = { name: code, value: 0 };
      skuMap[code].value += Number(r.stock_value) || 0;
    });
    return {
      whData: Object.entries(whMap).map(([name, value]) => ({ name, value })),
      topSKUs: Object.values(skuMap).sort((a, b) => b.value - a.value).slice(0, 8),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Stock by Warehouse</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={whData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                {whData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v.toLocaleString('en-IN') + ' units', 'Qty']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {whData.map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {e.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Top SKUs by Stock Value</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSKUs} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} />
              <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
