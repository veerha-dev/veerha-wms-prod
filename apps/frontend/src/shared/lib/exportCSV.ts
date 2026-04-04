export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'badge' | 'percentage';
  format?: (value: any) => string;
}

function formatValue(value: any, col: ColumnConfig): string {
  if (value === null || value === undefined) return '';
  if (col.format) return col.format(value);

  switch (col.type) {
    case 'currency':
      return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'date':
      return value ? new Date(value).toLocaleDateString('en-IN') : '';
    case 'datetime':
      return value ? new Date(value).toLocaleString('en-IN') : '';
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    case 'number':
      return Number(value).toLocaleString('en-IN');
    default:
      return String(value);
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV(data: any[], columns: ColumnConfig[], filename: string) {
  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';

  // Header row
  const header = columns.map((col) => escapeCSV(col.label)).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns.map((col) => escapeCSV(formatValue(row[col.key], col))).join(',')
  );

  const csvContent = BOM + header + '\n' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
