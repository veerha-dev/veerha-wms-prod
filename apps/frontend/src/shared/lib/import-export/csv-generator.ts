import Papa from 'papaparse';
import { ExportConfig } from './types';

export interface CsvGenerateOptions {
  config: ExportConfig;
  selectedColumns?: string[];
  filters?: Record<string, unknown>;
}

export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CsvGenerateOptions
): string {
  const { config, selectedColumns } = options;
  const columns = selectedColumns || config.defaultColumns;

  const exportColumns = config.columns.filter((col) => columns.includes(col.key));

  const headers = exportColumns.map((col) => col.label);

  const rows = data.map((item) => {
    return exportColumns.map((col) => {
      const value = item[col.key];
      const formatter = config.formatters[col.key];
      if (formatter) {
        return formatter(value);
      }
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
  });

  const csvData = [headers, ...rows];

  return Papa.unparse(csvData);
}

export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CsvGenerateOptions
): void {
  const csvContent = generateCSV(data, options);
  const fileName = options.config.fileName(options.filters);
  downloadCSV(csvContent, fileName);
}

export function generateTemplateCSV(config: ExportConfig): string {
  const headers = config.columns.map((col) => col.label);
  return Papa.unparse([headers]);
}

export function downloadTemplateCSV(config: ExportConfig, entityType: string): void {
  const csvContent = generateTemplateCSV(config);
  const fileName = `${entityType}-import-template.csv`;
  downloadCSV(csvContent, fileName);
}
