import * as XLSX from 'xlsx';
import { ExportConfig } from './types';

export interface ExcelGenerateOptions {
  config: ExportConfig;
  selectedColumns?: string[];
  filters?: Record<string, unknown>;
  sheetName?: string;
}

export function generateExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelGenerateOptions
): XLSX.WorkBook {
  const { config, selectedColumns, sheetName = 'Data' } = options;
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
      return value;
    });
  });

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const colWidths = exportColumns.map((col) => ({
    wch: col.width ? Math.floor(col.width / 7) : 15,
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return workbook;
}

export function downloadExcel(workbook: XLSX.WorkBook, fileName: string): void {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelGenerateOptions
): void {
  const workbook = generateExcel(data, options);
  const fileName = options.config.fileName(options.filters).replace('.csv', '.xlsx');
  downloadExcel(workbook, fileName);
}

export function generateTemplateExcel(config: ExportConfig, sheetName = 'Template'): XLSX.WorkBook {
  const headers = config.columns.map((col) => col.label);
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  const colWidths = config.columns.map((col) => ({
    wch: col.width ? Math.floor(col.width / 7) : 15,
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return workbook;
}

export function downloadTemplateExcel(config: ExportConfig, entityType: string): void {
  const workbook = generateTemplateExcel(config);
  const fileName = `${entityType}-import-template.xlsx`;
  downloadExcel(workbook, fileName);
}
