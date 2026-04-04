import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { QueryInvoiceDto } from './dto';

@Injectable()
export class InvoicesRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryInvoiceDto) {
    const { page = 1, limit = 50, search, status, type, warehouseId, customerId, supplierId, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['i.tenant_id = $1'];
    let idx = 2;

    if (search) {
      conditions.push(`(i.invoice_number ILIKE $${idx} OR c.name ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) { conditions.push(`i.status = $${idx}`); params.push(status); idx++; }
    if (type) { conditions.push(`i.type = $${idx}`); params.push(type); idx++; }
    if (warehouseId) { conditions.push(`i.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (customerId) { conditions.push(`i.customer_id = $${idx}`); params.push(customerId); idx++; }
    if (supplierId) { conditions.push(`i.supplier_id = $${idx}`); params.push(supplierId); idx++; }

    const allowedSort = ['invoice_number', 'type', 'status', 'total_amount', 'due_date', 'invoice_date', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id LEFT JOIN suppliers s ON i.supplier_id = s.id WHERE ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT i.*,
              c.name as customer_name,
              s.name as supplier_name,
              g.grn_number as grn_number,
              sh.shipment_number as shipment_number,
              w.name as warehouse_name,
              po.po_number as po_number,
              so.so_number as so_number,
              CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid','cancelled') THEN true ELSE false END as is_overdue
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN suppliers s ON i.supplier_id = s.id
       LEFT JOIN grn g ON i.grn_id = g.id
       LEFT JOIN shipments sh ON i.shipment_id = sh.id
       LEFT JOIN warehouses w ON i.warehouse_id = w.id
       LEFT JOIN purchase_orders po ON i.po_id = po.id
       LEFT JOIN sales_orders so ON i.so_id = so.id
       WHERE ${where} ORDER BY i.${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map((r: any) => this.mapRow(r)), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query(`
      SELECT i.*,
             c.name as customer_name,
             s.name as supplier_name,
             g.grn_number as grn_number,
             sh.shipment_number as shipment_number,
             w.name as warehouse_name,
             po.po_number as po_number,
             so.so_number as so_number,
             CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid','cancelled') THEN true ELSE false END as is_overdue
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      LEFT JOIN grn g ON i.grn_id = g.id
      LEFT JOIN shipments sh ON i.shipment_id = sh.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      LEFT JOIN purchase_orders po ON i.po_id = po.id
      LEFT JOIN sales_orders so ON i.so_id = so.id
      WHERE i.id = $1 AND i.tenant_id = $2
    `, [id, tenantId]);

    if (!result.rows[0]) return null;

    const invoice = this.mapRow(result.rows[0]);

    // Fetch line items
    const itemsResult = await this.db.query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY sort_order, created_at`,
      [id],
    );
    invoice.items = itemsResult.rows.map(this.mapItemRow);

    return invoice;
  }

  async findByNumber(tenantId: string, invoiceNumber: string) {
    const result = await this.db.query('SELECT * FROM invoices WHERE invoice_number = $1 AND tenant_id = $2', [invoiceNumber, tenantId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async getNextCode(tenantId: string, type: string = 'sales'): Promise<string> {
    const prefixMap: Record<string, string> = { purchase: 'PI', sales: 'SI', service: 'WS' };
    const prefix = prefixMap[type] || 'INV';

    const result = await this.db.query(
      `SELECT invoice_number FROM invoices WHERE tenant_id = $1 AND invoice_number LIKE $2 ORDER BY invoice_number DESC LIMIT 1`,
      [tenantId, `${prefix}-%`],
    );

    if (result.rows.length === 0) return `${prefix}-001`;
    const lastNum = parseInt(result.rows[0].invoice_number.replace(`${prefix}-`, ''), 10);
    return `${prefix}-${String(lastNum + 1).padStart(3, '0')}`;
  }

  async create(tenantId: string, data: any, client?: PoolClient) {
    const query = client ? client.query.bind(client) : this.db.query.bind(this.db);

    const result = await query(
      `INSERT INTO invoices (
        tenant_id, invoice_number, type, so_id, po_id, grn_id, shipment_id,
        customer_id, supplier_id, warehouse_id,
        status, invoice_date, due_date, payment_terms, gst_type,
        subtotal, tax_amount, cgst_amount, sgst_amount, igst_amount, discount_amount, total_amount, paid_amount,
        billing_period_start, billing_period_end, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26
      ) RETURNING *`,
      [
        tenantId, data.invoiceNumber, data.type || 'sales',
        data.soId || null, data.poId || null, data.grnId || null, data.shipmentId || null,
        data.customerId || null, data.supplierId || null, data.warehouseId || null,
        data.status || 'draft',
        data.invoiceDate || new Date(), data.dueDate || null, data.paymentTerms || 30,
        data.gstType || 'intra-state',
        data.subtotal || 0, data.taxAmount || 0,
        data.cgstAmount || 0, data.sgstAmount || 0, data.igstAmount || 0,
        data.discountAmount || 0, data.totalAmount || 0, data.paidAmount || 0,
        data.billingPeriodStart || null, data.billingPeriodEnd || null,
        data.notes || null,
      ],
    );

    return this.mapRow(result.rows[0]);
  }

  async createItems(tenantId: string, invoiceId: string, items: any[], client?: PoolClient) {
    const query = client ? client.query.bind(client) : this.db.query.bind(this.db);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await query(
        `INSERT INTO invoice_items (
          tenant_id, invoice_id, item_type, sku_id, sku_code, sku_name,
          hsn_code, description, quantity, unit_price,
          discount_percent, discount_amount, tax_rate,
          cgst_amount, sgst_amount, igst_amount, line_total, sort_order
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          tenantId, invoiceId,
          item.itemType || 'product',
          item.skuId || null, item.skuCode || null, item.skuName || null,
          item.hsnCode || null, item.description || null,
          item.quantity || 0, item.unitPrice || 0,
          item.discountPercent || 0, item.discountAmount || 0, item.taxRate || 0,
          item.cgstAmount || 0, item.sgstAmount || 0, item.igstAmount || 0,
          item.lineTotal || 0, i,
        ],
      );
    }
  }

  async deleteItems(invoiceId: string, client?: PoolClient) {
    const query = client ? client.query.bind(client) : this.db.query.bind(this.db);
    await query('DELETE FROM invoice_items WHERE invoice_id = $1', [invoiceId]);
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;

    const mappings: Record<string, string> = {
      type: 'type', soId: 'so_id', poId: 'po_id', grnId: 'grn_id', shipmentId: 'shipment_id',
      customerId: 'customer_id', supplierId: 'supplier_id', warehouseId: 'warehouse_id',
      status: 'status', invoiceDate: 'invoice_date', dueDate: 'due_date',
      paymentTerms: 'payment_terms', gstType: 'gst_type',
      subtotal: 'subtotal', taxAmount: 'tax_amount', totalAmount: 'total_amount',
      cgstAmount: 'cgst_amount', sgstAmount: 'sgst_amount', igstAmount: 'igst_amount',
      discountAmount: 'discount_amount', paidAmount: 'paid_amount',
      billingPeriodStart: 'billing_period_start', billingPeriodEnd: 'billing_period_end',
      notes: 'notes',
    };

    for (const [key, col] of Object.entries(mappings)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(tenantId, id);

    fields.push('updated_at = NOW()');
    const result = await this.db.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM invoices WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateStatus(tenantId: string, id: string, status: string, paidAmount?: number) {
    const fields = ['status = $3', 'updated_at = NOW()'];
    const params: any[] = [id, tenantId, status];
    if (paidAmount !== undefined) { fields.push('paid_amount = $4'); params.push(paidAmount); }

    const result = await this.db.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async getStats(tenantId: string, warehouseId?: string) {
    const params: any[] = [tenantId];
    let warehouseFilter = '';
    if (warehouseId) { warehouseFilter = ' AND warehouse_id = $2'; params.push(warehouseId); }

    const result = await this.db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'paid') as paid,
        COUNT(*) FILTER (WHERE status = 'partial') as partial,
        COUNT(*) FILTER (WHERE status = 'overdue' OR (due_date < CURRENT_DATE AND status NOT IN ('paid','cancelled'))) as overdue,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE type = 'purchase') as purchase_count,
        COUNT(*) FILTER (WHERE type = 'sales') as sales_count,
        COUNT(*) FILTER (WHERE type = 'service') as service_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(total_amount - paid_amount) FILTER (WHERE status NOT IN ('cancelled')), 0) as total_outstanding
       FROM invoices WHERE tenant_id = $1${warehouseFilter}`,
      params,
    );
    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      draft: parseInt(row.draft, 10),
      sent: parseInt(row.sent, 10),
      paid: parseInt(row.paid, 10),
      partial: parseInt(row.partial, 10),
      overdue: parseInt(row.overdue, 10),
      cancelled: parseInt(row.cancelled, 10),
      purchaseCount: parseInt(row.purchase_count, 10),
      salesCount: parseInt(row.sales_count, 10),
      serviceCount: parseInt(row.service_count, 10),
      totalAmount: parseFloat(row.total_amount) || 0,
      totalPaid: parseFloat(row.total_paid) || 0,
      totalOutstanding: parseFloat(row.total_outstanding) || 0,
    };
  }

  private mapRow(row: any) {
    const totalAmount = parseFloat(row.total_amount) || 0;
    const paidAmount = parseFloat(row.paid_amount) || 0;
    const dueDate = row.due_date;
    const isOverdue = row.is_overdue || (dueDate && new Date(dueDate) < new Date() && !['paid', 'cancelled'].includes(row.status));

    return {
      id: row.id,
      tenantId: row.tenant_id,
      invoiceNumber: row.invoice_number,
      type: row.type,
      soId: row.so_id,
      poId: row.po_id,
      grnId: row.grn_id,
      shipmentId: row.shipment_id,
      customerId: row.customer_id,
      supplierId: row.supplier_id,
      warehouseId: row.warehouse_id,
      status: row.status,
      invoiceDate: row.invoice_date || row.created_at,
      dueDate,
      paymentTerms: row.payment_terms || 30,
      gstType: row.gst_type || 'intra-state',
      subtotal: parseFloat(row.subtotal) || 0,
      taxAmount: parseFloat(row.tax_amount) || 0,
      cgstAmount: parseFloat(row.cgst_amount) || 0,
      sgstAmount: parseFloat(row.sgst_amount) || 0,
      igstAmount: parseFloat(row.igst_amount) || 0,
      discountAmount: parseFloat(row.discount_amount) || 0,
      totalAmount,
      paidAmount,
      balanceAmount: totalAmount - paidAmount,
      billingPeriodStart: row.billing_period_start,
      billingPeriodEnd: row.billing_period_end,
      notes: row.notes,
      isOverdue,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      customer: row.customer_name ? { name: row.customer_name } : null,
      supplier: row.supplier_name ? { name: row.supplier_name } : null,
      grn: row.grn_number ? { grnNumber: row.grn_number } : null,
      shipment: row.shipment_number ? { shipmentNumber: row.shipment_number } : null,
      warehouse: row.warehouse_name ? { name: row.warehouse_name } : null,
      purchaseOrder: row.po_number ? { poNumber: row.po_number } : null,
      salesOrder: row.so_number ? { soNumber: row.so_number } : null,
      items: [] as any[],
    };
  }

  private mapItemRow(row: any) {
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      itemType: row.item_type,
      skuId: row.sku_id,
      skuCode: row.sku_code,
      skuName: row.sku_name,
      hsnCode: row.hsn_code,
      description: row.description,
      quantity: parseFloat(row.quantity) || 0,
      unitPrice: parseFloat(row.unit_price) || 0,
      discountPercent: parseFloat(row.discount_percent) || 0,
      discountAmount: parseFloat(row.discount_amount) || 0,
      taxRate: parseFloat(row.tax_rate) || 0,
      cgstAmount: parseFloat(row.cgst_amount) || 0,
      sgstAmount: parseFloat(row.sgst_amount) || 0,
      igstAmount: parseFloat(row.igst_amount) || 0,
      lineTotal: parseFloat(row.line_total) || 0,
      sortOrder: row.sort_order,
    };
  }
}
