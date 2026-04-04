import { useState, useCallback, useMemo } from 'react';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useRunReport, useLogReportExecution, fetchAllReportPages, ReportType } from '@/features/reports/hooks/useReports';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useWarehouses } from '@/features/warehouse/hooks/useWarehouses';
import { exportToCSV, ColumnConfig } from '@/shared/lib/exportCSV';
import { exportToPDF } from '@/shared/lib/exportPDF';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import {
  Download, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Filter, Loader2, RefreshCw, Calendar, BarChart3, Table2,
} from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'warehouse';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface ReportViewerProps {
  reportType: ReportType;
  title: string;
  description: string;
  filterConfig: FilterConfig[];
  columnConfig: ColumnConfig[];
  defaultFilters?: Record<string, any>;
  renderCharts?: (data: any[]) => React.ReactNode;
}

type Period = 'weekly' | 'monthly' | 'yearly' | 'all';

export function ReportViewer({
  reportType,
  title,
  description,
  filterConfig,
  columnConfig,
  defaultFilters = {},
  renderCharts,
}: ReportViewerProps) {
  const { profile } = useAuth();
  const { tenant } = useWMS();
  const { data: warehouses = [] } = useWarehouses();

  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState<Period>('all');

  const periodFilters = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const f = { ...filters };
    if (period === 'weekly') {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      f.startDate = d.toISOString().split('T')[0];
      f.endDate = tomorrow.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      const d = new Date(now); d.setMonth(d.getMonth() - 1);
      f.startDate = d.toISOString().split('T')[0];
      f.endDate = tomorrow.toISOString().split('T')[0];
    } else if (period === 'yearly') {
      const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
      f.startDate = d.toISOString().split('T')[0];
      f.endDate = tomorrow.toISOString().split('T')[0];
    }
    return f;
  }, [filters, period]);

  const { data: result, isLoading, refetch } = useRunReport(reportType, periodFilters, page, pageSize);
  const logExecution = useLogReportExecution();

  const rows = result?.data || [];
  const totalCount = result?.totalCount || rows.length || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const doExport = useCallback(async (format: 'csv' | 'pdf') => {
    if (!isLoading && rows.length === 0) return;
    setExporting(true);
    try {
      const startTime = Date.now();
      const allData = totalCount <= pageSize
        ? rows
        : await fetchAllReportPages(reportType, periodFilters);

      const periodLabel = period === 'all' ? '' : ` (${period})`;
      const filename = `${title.replace(/\s+/g, '_')}${periodLabel ? `_${period}` : ''}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        exportToCSV(allData, columnConfig, filename);
      } else {
        const filterSummary: Record<string, string> = {};
        if (period !== 'all') filterSummary['Period'] = period.charAt(0).toUpperCase() + period.slice(1);
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            const cfg = filterConfig.find(f => f.key === k);
            filterSummary[cfg?.label || k] = String(v);
          }
        });
        exportToPDF(allData, columnConfig, {
          title: `${title}${periodLabel}`,
          subtitle: description,
          filename,
          orientation: columnConfig.length > 6 ? 'landscape' : 'portrait',
          companyName: tenant?.name || 'VEERHA WMS',
          generatedBy: profile?.full_name || profile?.email || '',
          filters: filterSummary,
        });
      }

      logExecution.mutate({
        report_type: reportType, report_name: `${title}${periodLabel}`,
        filters_used: periodFilters, row_count: allData.length,
        file_format: format, execution_time_ms: Date.now() - startTime,
      });
    } finally {
      setExporting(false);
    }
  }, [profile, reportType, periodFilters, filters, rows, totalCount, pageSize, columnConfig, title, description, tenant, filterConfig, logExecution, period]);

  function formatCell(value: any, col: ColumnConfig): string {
    if (value === null || value === undefined) return '-';
    if (col.format) return col.format(value);
    switch (col.type) {
      case 'currency': return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      case 'date': return value ? new Date(value).toLocaleDateString('en-IN') : '-';
      case 'datetime': return value ? new Date(value).toLocaleString('en-IN') : '-';
      case 'percentage': return `${Number(value).toFixed(2)}%`;
      case 'number': return Number(value).toLocaleString('en-IN');
      default: return String(value);
    }
  }

  const badgeColors: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    normal: 'bg-success/10 text-success border-success/20',
    healthy: 'bg-success/10 text-success border-success/20',
    active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    draft: 'bg-muted text-muted-foreground',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-success/10 text-success border-success/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    submitted: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    shipped: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    delivered: 'bg-green-600/10 text-green-700 border-green-600/20',
  };

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Reports', href: '/reports' },
        { label: title },
      ]}
    >
      <div className="space-y-6">
        {/* Header Bar: Period + Download + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {(['all', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className="gap-1.5 capitalize"
                onClick={() => { setPeriod(p); setPage(1); }}
              >
                {p === 'all' ? <BarChart3 className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                {p === 'all' ? 'All Time' : p}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />Filters
              {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <Button variant="outline" size="sm" onClick={() => doExport('csv')} disabled={exporting || rows.length === 0} className="gap-1.5">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download CSV
            </Button>
            <Button variant="default" size="sm" onClick={() => doExport('pdf')} disabled={exporting || rows.length === 0} className="gap-1.5">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Download PDF
            </Button>
          </div>
        </div>

        {/* Period Badge + Record Count */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5">
            <BarChart3 className="h-3 w-3" />
            {isLoading ? '...' : `${totalCount.toLocaleString()} records`}
          </Badge>
          {period !== 'all' && (
            <Badge variant="outline" className="gap-1.5 bg-primary/5 text-primary border-primary/20">
              <Calendar className="h-3 w-3" />
              {period === 'weekly' ? 'Last 7 days' : period === 'monthly' ? 'Last 30 days' : 'Last 12 months'}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Filters Panel (collapsed by default) */}
        {showFilters && (
          <div className="wms-card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterConfig.map((filter) => (
                <div key={filter.key}>
                  <Label className="text-xs mb-1.5 block">{filter.label}</Label>
                  {filter.type === 'text' && (
                    <Input placeholder={filter.placeholder} value={filters[filter.key] || ''} onChange={(e) => updateFilter(filter.key, e.target.value || undefined)} className="h-9" />
                  )}
                  {filter.type === 'number' && (
                    <Input type="number" placeholder={filter.placeholder} value={filters[filter.key] ?? ''} onChange={(e) => updateFilter(filter.key, e.target.value ? Number(e.target.value) : undefined)} className="h-9" />
                  )}
                  {filter.type === 'date' && (
                    <Input type="date" value={filters[filter.key] || ''} onChange={(e) => updateFilter(filter.key, e.target.value || undefined)} className="h-9" />
                  )}
                  {filter.type === 'select' && (
                    <Select value={filters[filter.key] || '_all'} onValueChange={(v) => updateFilter(filter.key, v === '_all' ? undefined : v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={filter.placeholder || 'All'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All</SelectItem>
                        {filter.options?.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === 'warehouse' && (
                    <Select value={filters[filter.key] || '_all'} onValueChange={(v) => updateFilter(filter.key, v === '_all' ? undefined : v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="All Warehouses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All Warehouses</SelectItem>
                        {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === 'boolean' && (
                    <Select value={filters[filter.key] === true ? 'true' : filters[filter.key] === false ? 'false' : '_all'} onValueChange={(v) => updateFilter(filter.key, v === '_all' ? undefined : v === 'true')}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section (PRIMARY — always visible) */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="wms-card p-4"><Skeleton className="h-[250px] w-full" /></div>
            <div className="wms-card p-4"><Skeleton className="h-[250px] w-full" /></div>
          </div>
        ) : rows.length === 0 ? (
          <div className="wms-card p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">No data for this period</h3>
            <p className="text-sm text-muted-foreground">Try selecting a different time period or adjusting filters.</p>
          </div>
        ) : renderCharts ? (
          renderCharts(rows)
        ) : null}

        {/* Toggle Table */}
        {rows.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTable(!showTable)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Table2 className="h-4 w-4" />
              {showTable ? 'Hide' : 'Show'} Data Table ({totalCount} rows)
              {showTable ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {showTable && (
              <div className="mt-3 wms-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {columnConfig.map((col) => (
                          <th key={col.key} className={cn('text-xs font-medium text-muted-foreground p-3 whitespace-nowrap', ['number', 'currency', 'percentage'].includes(col.type) ? 'text-right' : 'text-left')}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          {columnConfig.map((col) => (
                            <td key={col.key} className={cn('p-3 text-sm whitespace-nowrap', ['number', 'currency', 'percentage'].includes(col.type) ? 'text-right font-mono' : 'text-left')}>
                              {col.type === 'badge' ? (
                                <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', badgeColors[String(row[col.key]).toLowerCase()] || 'bg-muted text-muted-foreground')}>
                                  {String(row[col.key] || '-')}
                                </span>
                              ) : formatCell(row[col.key], col)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border p-3">
                    <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pn = page <= 3 ? i + 1 : page + i - 2;
                        if (pn < 1 || pn > totalPages) return null;
                        return <Button key={pn} variant={pn === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(pn)}>{pn}</Button>;
                      })}
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
