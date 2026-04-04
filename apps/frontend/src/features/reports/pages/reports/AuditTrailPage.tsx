import { useMemo } from 'react';
import { ReportViewer } from '@/features/reports/components/ReportViewer';
import type { ColumnConfig } from '@/shared/lib/exportCSV';
import type { FilterConfig } from '@/features/reports/components/ReportViewer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ACTION_COLORS: Record<string, string> = {
  create: 'hsl(142, 71%, 45%)',
  update: 'hsl(199, 89%, 48%)',
  delete: 'hsl(0, 84%, 60%)',
  stock_in: 'hsl(142, 71%, 45%)',
  stock_out: 'hsl(0, 84%, 60%)',
  transfer: 'hsl(262, 83%, 58%)',
  adjustment: 'hsl(38, 92%, 50%)',
  return: 'hsl(173, 58%, 39%)',
  putaway: 'hsl(25, 95%, 53%)',
  pick: 'hsl(340, 75%, 55%)',
};

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(199, 89%, 48%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(38, 92%, 50%)', 'hsl(173, 58%, 39%)', 'hsl(25, 95%, 53%)'];

const filterConfig: FilterConfig[] = [
  { key: 'warehouse_id', label: 'Warehouse', type: 'warehouse' },
  { key: 'startDate', label: 'Date From', type: 'date' },
  { key: 'endDate', label: 'Date To', type: 'date' },
];

const columnConfig: ColumnConfig[] = [
  { key: 'movement_number', label: 'Movement #', type: 'text' },
  { key: 'movement_type', label: 'Type', type: 'badge' },
  { key: 'action', label: 'Action', type: 'badge' },
  { key: 'sku_code', label: 'SKU Code', type: 'text' },
  { key: 'sku_name', label: 'SKU Name', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'warehouse_name', label: 'Warehouse', type: 'text' },
  { key: 'reason', label: 'Reason', type: 'text' },
  { key: 'created_at', label: 'Timestamp', type: 'datetime' },
];

export default function AuditTrailPage() {
  return (
    <ReportViewer
      reportType="audit_trail"
      title="Audit Trail"
      description="Complete inventory activity log for compliance and traceability"
      filterConfig={filterConfig}
      columnConfig={columnConfig}
      renderCharts={(data) => <AuditCharts data={data} />}
    />
  );
}

function AuditCharts({ data }: { data: any[] }) {
  const { actionData, typeData } = useMemo(() => {
    const aMap: Record<string, number> = {};
    const tMap: Record<string, number> = {};
    data.forEach((r) => {
      const a = r.action || 'update';
      aMap[a] = (aMap[a] || 0) + 1;
      const t = r.movement_type || 'unknown';
      tMap[t] = (tMap[t] || 0) + 1;
    });
    return {
      actionData: Object.entries(aMap).map(([name, value]) => ({ name, value })),
      typeData: Object.entries(tMap)
        .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Actions Distribution</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={actionData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                {actionData.map((e) => <Cell key={e.name} fill={ACTION_COLORS[e.name] || '#888'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {actionData.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5 text-xs capitalize">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: ACTION_COLORS[e.name] || '#888' }} />{e.name} ({e.value})
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="wms-card p-4">
        <h3 className="text-sm font-semibold mb-3">Activity by Movement Type</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Events']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
