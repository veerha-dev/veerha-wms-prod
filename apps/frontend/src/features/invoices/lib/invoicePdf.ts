import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceLike {
  invoiceNumber?: string;
  type?: 'purchase' | 'sales' | 'service' | string;
  status?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentTerms?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
  gstType?: 'intra-state' | 'inter-state' | string;
  notes?: string;
  billingPeriodStart?: string | null;
  billingPeriodEnd?: string | null;
  sourceEvent?: string | null;

  customer?: { name?: string; gstNumber?: string; address?: string };
  supplier?: { name?: string; gstNumber?: string; address?: string };
  customerName?: string;
  supplierName?: string;

  warehouseName?: string;
  poNumber?: string;
  soNumber?: string;
  grnNumber?: string;
  shipmentNumber?: string;

  items?: Array<{
    skuCode?: string;
    skuName?: string;
    hsnCode?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    discountAmount?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    lineTotal?: number;
    taxRate?: number;
    itemType?: string;
  }>;
}

const inr = (n: number | undefined) =>
  (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export function generateInvoicePdf(inv: InvoiceLike, tenantInfo?: {
  companyName?: string;
  gstNumber?: string | null;
  address?: string | null;
  city?: string | null;
}): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 40;
  let y = 40;

  // ── Header ──────────────────────────────────────────────
  doc.setFontSize(20).setFont('helvetica', 'bold');
  doc.text(typeLabel(inv.type), left, y);
  y += 22;
  doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(110);
  doc.text(`${inv.invoiceNumber || ''}`, left, y);
  if (inv.sourceEvent && inv.sourceEvent !== 'manual') {
    doc.setTextColor(34, 110, 60);
    doc.text(`  · auto-generated (${inv.sourceEvent})`, left + doc.getTextWidth(inv.invoiceNumber || ''), y);
  }
  doc.setTextColor(0);
  y += 18;

  // Issuer block (right) + party block (left)
  const issuerLines = [
    tenantInfo?.companyName || 'Your Company',
    tenantInfo?.address || '',
    tenantInfo?.city || '',
    tenantInfo?.gstNumber ? `GSTIN: ${tenantInfo.gstNumber}` : '',
  ].filter(Boolean);
  doc.setFontSize(10);
  issuerLines.forEach((line, i) => {
    doc.text(line, pageWidth - left, 60 + i * 13, { align: 'right' });
  });

  // Party
  const partyTitle = inv.type === 'purchase' ? 'Bill From' : inv.type === 'service' ? 'Bill To (Client)' : 'Bill To';
  const party = inv.type === 'purchase' ? inv.supplier : inv.customer;
  const partyName = party?.name || (inv.type === 'purchase' ? inv.supplierName : inv.customerName) || '—';
  doc.setFont('helvetica', 'bold').text(partyTitle, left, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(partyName, left, y);
  y += 13;
  if (party?.gstNumber) {
    doc.text(`GSTIN: ${party.gstNumber}`, left, y);
    y += 13;
  }
  if (party?.address) {
    const wrapped = doc.splitTextToSize(party.address, 260) as string[];
    doc.text(wrapped, left, y);
    y += wrapped.length * 12;
  }

  // Meta block (right side, same y region)
  const metaStartY = 95;
  const meta: Array<[string, string]> = [
    ['Invoice Date', fmtDate(inv.invoiceDate)],
    ['Due Date', fmtDate(inv.dueDate)],
    ['Payment Terms', inv.paymentTerms ? `${inv.paymentTerms} days` : '-'],
  ];
  if (inv.poNumber) meta.push(['PO Number', inv.poNumber]);
  if (inv.soNumber) meta.push(['SO Number', inv.soNumber]);
  if (inv.grnNumber) meta.push(['GRN Number', inv.grnNumber]);
  if (inv.shipmentNumber) meta.push(['Shipment', inv.shipmentNumber]);
  if (inv.warehouseName) meta.push(['Warehouse', inv.warehouseName]);
  if (inv.billingPeriodStart) {
    meta.push(['Billing Period', `${fmtDate(inv.billingPeriodStart)} → ${fmtDate(inv.billingPeriodEnd)}`]);
  }
  doc.setFontSize(9).setTextColor(80);
  meta.forEach(([k, v], i) => {
    const yy = metaStartY + i * 14;
    doc.text(k, pageWidth - left - 160, yy);
    doc.setFont('helvetica', 'bold');
    doc.text(v, pageWidth - left, yy, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });
  doc.setTextColor(0);

  // ── Items table ─────────────────────────────────────────
  const isService = inv.type === 'service';
  const head = isService
    ? [['#', 'Charge', 'Period / Description', 'Amount', 'Tax', 'Total']]
    : [['#', 'SKU / HSN', 'Description', 'Qty', 'Rate', 'Discount', 'Tax', 'Total']];

  const body = (inv.items || []).map((it, i) => {
    const tax = (it.cgstAmount || 0) + (it.sgstAmount || 0) + (it.igstAmount || 0);
    if (isService) {
      return [
        String(i + 1),
        it.itemType || '-',
        it.skuName || it.description || '-',
        inr(it.unitPrice),
        inr(tax),
        inr(it.lineTotal),
      ];
    }
    return [
      String(i + 1),
      `${it.skuCode || ''}${it.hsnCode ? `\nHSN ${it.hsnCode}` : ''}`,
      it.skuName || it.description || '-',
      String(it.quantity ?? '-'),
      inr(it.unitPrice),
      inr(it.discountAmount),
      `${inr(tax)} (${it.taxRate ?? 0}%)`,
      inr(it.lineTotal),
    ];
  });

  autoTable(doc, {
    startY: Math.max(y + 8, 200),
    head,
    body,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 6, lineColor: [220, 220, 220] },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    columnStyles: isService
      ? {
          0: { cellWidth: 24, halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
        }
      : {
          0: { cellWidth: 24, halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' },
        },
  });

  // ── Totals (right aligned) ─────────────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 100;
  let ty = finalY + 16;
  const labelX = pageWidth - left - 160;
  const valX = pageWidth - left;

  doc.setFontSize(10);
  totalRow(doc, 'Subtotal', inr(inv.subtotal), labelX, valX, ty);
  ty += 14;
  if ((inv.discountAmount ?? 0) > 0) {
    totalRow(doc, 'Discount', `- ${inr(inv.discountAmount)}`, labelX, valX, ty);
    ty += 14;
  }
  if (inv.gstType === 'inter-state') {
    totalRow(doc, `IGST`, inr(inv.igstAmount), labelX, valX, ty);
    ty += 14;
  } else {
    totalRow(doc, 'CGST', inr(inv.cgstAmount), labelX, valX, ty);
    ty += 14;
    totalRow(doc, 'SGST', inr(inv.sgstAmount), labelX, valX, ty);
    ty += 14;
  }

  doc.setDrawColor(15, 23, 42);
  doc.line(labelX, ty, valX, ty);
  ty += 6;
  doc.setFont('helvetica', 'bold').setFontSize(12);
  doc.text('Total Payable', labelX, ty + 8);
  doc.text(`₹ ${inr(inv.totalAmount)}`, valX, ty + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(10);
  ty += 22;

  if (inv.notes) {
    ty += 8;
    doc.setFontSize(9).setTextColor(80);
    doc.text('Notes', left, ty);
    ty += 12;
    const wrapped = doc.splitTextToSize(inv.notes, pageWidth - left * 2) as string[];
    doc.text(wrapped, left, ty);
    doc.setTextColor(0);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 28;
  doc.setFontSize(8).setTextColor(140);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')} · Status: ${(inv.status || 'draft').toUpperCase()}`, left, footerY);
  doc.setTextColor(0);

  return doc;
}

export function downloadInvoicePdf(
  inv: InvoiceLike,
  tenantInfo?: Parameters<typeof generateInvoicePdf>[1],
) {
  const doc = generateInvoicePdf(inv, tenantInfo);
  doc.save(`${inv.invoiceNumber || 'invoice'}.pdf`);
}

function typeLabel(type?: string): string {
  switch (type) {
    case 'purchase': return 'PURCHASE INVOICE';
    case 'sales': return 'SALES INVOICE';
    case 'service': return 'SERVICE INVOICE';
    default: return 'INVOICE';
  }
}

function totalRow(doc: jsPDF, label: string, val: string, labelX: number, valX: number, y: number) {
  doc.text(label, labelX, y);
  doc.text(val, valX, y, { align: 'right' });
}
