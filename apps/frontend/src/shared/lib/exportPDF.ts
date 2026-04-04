import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ColumnConfig } from './exportCSV';

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
  companyName?: string;
  generatedBy?: string;
  filters?: Record<string, string>;
}

function formatValue(value: any, col: ColumnConfig): string {
  if (value === null || value === undefined) return '-';
  if (col.format) return col.format(value);

  switch (col.type) {
    case 'currency':
      return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'date':
      return value ? new Date(value).toLocaleDateString('en-IN') : '-';
    case 'datetime':
      return value ? new Date(value).toLocaleString('en-IN') : '-';
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    case 'number':
      return Number(value).toLocaleString('en-IN');
    default:
      return String(value);
  }
}

export function exportToPDF(data: any[], columns: ColumnConfig[], options: PDFExportOptions) {
  const doc = new jsPDF({
    orientation: options.orientation || (columns.length > 6 ? 'landscape' : 'portrait'),
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.companyName || 'VEERHA WMS', 14, 15);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(options.title, 14, 23);

  if (options.subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, 29);
  }

  // Metadata on right
  doc.setFontSize(8);
  doc.setTextColor(100);
  const rightX = pageWidth - 14;
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, rightX, 15, { align: 'right' });
  if (options.generatedBy) {
    doc.text(`By: ${options.generatedBy}`, rightX, 20, { align: 'right' });
  }
  doc.text(`Total rows: ${data.length}`, rightX, 25, { align: 'right' });

  // Filters summary
  let startY = 34;
  if (options.filters && Object.keys(options.filters).length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(80);
    const filterText = Object.entries(options.filters)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    doc.text(`Filters: ${filterText}`, 14, startY);
    startY += 6;
  }

  // Table
  const headers = columns.map((c) => c.label);
  const body = data.map((row) => columns.map((col) => formatValue(row[col.key], col)));

  autoTable(doc, {
    startY,
    head: [headers],
    body,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: columns.reduce((acc, col, idx) => {
      if (['number', 'currency', 'percentage'].includes(col.type)) {
        acc[idx] = { halign: 'right' };
      }
      return acc;
    }, {} as Record<number, any>),
    margin: { top: 10, left: 14, right: 14 },
    didDrawPage: (data: any) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(`${options.filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
