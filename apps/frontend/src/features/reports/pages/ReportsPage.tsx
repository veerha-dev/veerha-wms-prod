import { AppLayout } from '@/shared/components/layout/AppLayout';
import { Link } from 'react-router-dom';
import { useReportConfigurations, useReportHistory, useDeleteReportConfig } from '@/features/reports/hooks/useReports';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Package, ArrowUpDown, FileText, ShoppingCart, Clock,
  AlertTriangle, Building2, Shield, Trash2,
  BarChart3, FileDown, ArrowRight, History, BookmarkPlus,
  Layers, Activity, DollarSign,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const REPORT_CATEGORIES = [
  {
    title: 'Inventory',
    icon: Layers,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    reports: [
      { type: 'stock_report', title: 'Stock Report', description: 'Current stock levels by SKU, warehouse, and location', icon: Package, path: '/reports/stock', badge: 'Real-time' },
      { type: 'low_stock_report', title: 'Low Stock Alert', description: 'SKUs below reorder point with deficit analysis', icon: AlertTriangle, path: '/reports/low-stock', badge: 'Critical' },
      { type: 'expiry_report', title: 'Expiry Report', description: 'Batches expiring within configurable days', icon: Clock, path: '/reports/expiry', badge: 'Time-sensitive' },
    ],
  },
  {
    title: 'Operations',
    icon: Activity,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    reports: [
      { type: 'movement_report', title: 'Movement Report', description: 'All stock movements — inbound, outbound, transfers', icon: ArrowUpDown, path: '/reports/movements', badge: 'Audit' },
      { type: 'warehouse_utilization', title: 'Warehouse Utilization', description: 'Capacity vs usage with zone and bin breakdown', icon: Building2, path: '/reports/warehouse-utilization', badge: 'Analytics' },
      { type: 'audit_trail', title: 'Audit Trail', description: 'Complete activity log for compliance', icon: Shield, path: '/reports/audit-trail', badge: 'Compliance' },
    ],
  },
  {
    title: 'Financial',
    icon: DollarSign,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    reports: [
      { type: 'purchase_register', title: 'Purchase Register', description: 'Purchase orders with supplier, GRN count, and totals', icon: FileText, path: '/reports/purchase-register', badge: 'Accounting' },
      { type: 'sales_register', title: 'Sales Register', description: 'Sales orders with customer, shipment, and revenue', icon: ShoppingCart, path: '/reports/sales-register', badge: 'Revenue' },
    ],
  },
];

export default function ReportsPage() {
  const { data: savedReports = [] } = useReportConfigurations();
  const { data: recentExecs = [] } = useReportHistory(10, undefined);
  const deleteConfig = useDeleteReportConfig();

  const totalReports = REPORT_CATEGORIES.reduce((acc, cat) => acc + cat.reports.length, 0);

  return (
    <AppLayout
      title="Reports"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="wms-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-sm text-muted-foreground">Available Reports</p>
              </div>
            </div>
          </div>
          <div className="wms-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <History className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentExecs.length}</p>
                <p className="text-sm text-muted-foreground">Recent Generations</p>
              </div>
            </div>
          </div>
          <div className="wms-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <BookmarkPlus className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedReports.length}</p>
                <p className="text-sm text-muted-foreground">Saved Configs</p>
              </div>
            </div>
          </div>
          <div className="wms-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileDown className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">CSV / PDF</p>
                <p className="text-sm text-muted-foreground">Export Formats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Categories */}
        {REPORT_CATEGORIES.map((category) => {
          const CatIcon = category.icon;
          return (
            <div key={category.title}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-8 w-8 rounded-lg ${category.bg} flex items-center justify-center`}>
                  <CatIcon className={`h-4 w-4 ${category.color}`} />
                </div>
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <Badge variant="outline" className="ml-1 text-xs">{category.reports.length} reports</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.reports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <Link
                      key={report.type}
                      to={report.path}
                      className="group wms-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`h-11 w-11 rounded-xl ${category.bg} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${category.color}`} />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-normal">{report.badge}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{report.description}</p>
                      <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Generate Report <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Saved Reports */}
        {savedReports.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Saved Configurations</h2>
            <div className="wms-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Schedule</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Created</th>
                    <th className="text-right text-xs font-medium text-muted-foreground p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {savedReports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="p-3 text-sm font-medium">{r.name}</td>
                      <td className="p-3 text-sm text-muted-foreground capitalize">{(r.report_type || '').replace(/_/g, ' ')}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs capitalize">{(r.schedule || 'on_demand').replace(/_/g, ' ')}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : '-'}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteConfig.mutate(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentExecs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="wms-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Report</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Rows</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Format</th>
                    <th className="text-left text-xs font-medium text-muted-foreground p-3">Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentExecs.map((exec: any) => (
                    <tr key={exec.id} className="hover:bg-muted/20">
                      <td className="p-3 text-sm font-medium">{exec.report_name || exec.report_type}</td>
                      <td className="p-3 text-sm text-muted-foreground capitalize">{(exec.report_type || '').replace(/_/g, ' ')}</td>
                      <td className="p-3 text-sm">{(exec.row_count || 0).toLocaleString()}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs uppercase">{exec.export_format || 'view'}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{exec.created_at ? formatDistanceToNow(new Date(exec.created_at), { addSuffix: true }) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
