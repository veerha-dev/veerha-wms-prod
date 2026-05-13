import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { DatabaseService } from '../../database/database.service';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';
import { decideGstType } from './gst.util';




@Injectable()
export class InvoicesService {
  constructor(

    private repository: InvoicesRepository,
    private db: DatabaseService,
  ) {}

  async findAll(query: QueryInvoiceDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const invoice = await this.repository.findById(getCurrentTenantId(), id);
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const type = dto.type || 'sales';
    let invoiceNumber = dto.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await this.repository.getNextCode(getCurrentTenantId(), type);
    }

    const existing = await this.repository.findByNumber(getCurrentTenantId(), invoiceNumber);
    if (existing) throw new ConflictException(`Invoice number ${invoiceNumber} already exists`);

    // Calculate GST from items
    const gstType = dto.gstType || 'intra-state';
    const calculatedItems = this.calculateGST(dto.items || [], gstType);

    const subtotal = calculatedItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
    const totalDiscount = calculatedItems.reduce((s, i) => s + i.discountAmount, 0);
    const totalCgst = calculatedItems.reduce((s, i) => s + i.cgstAmount, 0);
    const totalSgst = calculatedItems.reduce((s, i) => s + i.sgstAmount, 0);
    const totalIgst = calculatedItems.reduce((s, i) => s + i.igstAmount, 0);
    const taxAmount = totalCgst + totalSgst + totalIgst;
    const totalAmount = subtotal - totalDiscount + taxAmount;

    // Calculate due date from payment terms
    let dueDate = dto.dueDate;
    if (!dueDate && dto.paymentTerms) {
      const invoiceDate = dto.invoiceDate ? new Date(dto.invoiceDate) : new Date();
      const due = new Date(invoiceDate);
      due.setDate(due.getDate() + dto.paymentTerms);
      dueDate = due.toISOString();
    }

    // Use transaction to create invoice + items atomically
    return this.db.transaction(async (client) => {
      const invoice = await this.repository.create(getCurrentTenantId(), {
        ...dto,
        invoiceNumber,
        type,
        soId: dto.soId || dto.salesOrderId || null,
        gstType,
        subtotal,
        taxAmount,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        discountAmount: totalDiscount,
        totalAmount,
        dueDate,
      }, client);

      if (calculatedItems.length > 0) {
        await this.repository.createItems(getCurrentTenantId(), invoice.id, calculatedItems, client);
      }

      invoice.items = calculatedItems;
      return invoice;
    });
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findById(id);

    // If items are provided, recalculate GST and update items
    if (dto.items && dto.items.length > 0) {
      const gstType = dto.gstType || 'intra-state';
      const calculatedItems = this.calculateGST(dto.items, gstType);

      const subtotal = calculatedItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
      const totalDiscount = calculatedItems.reduce((s, i) => s + i.discountAmount, 0);
      const totalCgst = calculatedItems.reduce((s, i) => s + i.cgstAmount, 0);
      const totalSgst = calculatedItems.reduce((s, i) => s + i.sgstAmount, 0);
      const totalIgst = calculatedItems.reduce((s, i) => s + i.igstAmount, 0);
      const taxAmount = totalCgst + totalSgst + totalIgst;
      const totalAmount = subtotal - totalDiscount + taxAmount;

      return this.db.transaction(async (client) => {
        await this.repository.deleteItems(id, client);
        await this.repository.createItems(getCurrentTenantId(), id, calculatedItems, client);

        const updated = await this.repository.update(getCurrentTenantId(), id, {
          ...dto,
          subtotal, taxAmount, totalAmount,
          cgstAmount: totalCgst, sgstAmount: totalSgst, igstAmount: totalIgst,
          discountAmount: totalDiscount,
        });
        return updated;
      });
    }

    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async updateStatus(id: string, status: string, paidAmount?: number) {
    await this.findById(id);
    return this.repository.updateStatus(getCurrentTenantId(), id, status, paidAmount);
  }

  async getStats(warehouseId?: string) {
    return this.repository.getStats(getCurrentTenantId(), warehouseId);
  }

  // ─── Idempotent auto-create from upstream events ────────────────────

  /**
   * Generate a purchase invoice from a completed GRN.
   * Idempotent — returns the existing invoice if one already exists for this GRN.
   */
  async createFromGrn(grnId: string): Promise<{ invoice: any; created: boolean }> {
    const tid = getCurrentTenantId();

    // Idempotency check via unique index
    const existing = await this.db.query(
      `SELECT id FROM invoices WHERE tenant_id = $1 AND grn_id = $2 AND type = 'purchase' LIMIT 1`,
      [tid, grnId],
    );
    if ((existing.rowCount ?? 0) > 0) {
      const invoice = await this.findById(existing.rows[0].id);
      return { invoice, created: false };
    }

    // Load GRN with items, PO, supplier, warehouse
    const grnRes = await this.db.query(
      `SELECT g.*, po.po_number, po.supplier_id, s.name AS supplier_name, s.state AS supplier_state,
              w.state AS warehouse_state
         FROM grn g
         LEFT JOIN purchase_orders po ON g.po_id = po.id
         LEFT JOIN suppliers s ON po.supplier_id = s.id
         LEFT JOIN warehouses w ON g.warehouse_id = w.id
        WHERE g.id = $1 AND g.tenant_id = $2`,
      [grnId, tid],
    );
    const grn = grnRes.rows[0];
    if (!grn) throw new NotFoundException(`GRN ${grnId} not found`);

    const itemsRes = await this.db.query(
      `SELECT gi.*, sk.code AS sku_code, sk.name AS sku_name, sk.hsn_code, sk.gst_rate, sk.cost_price
         FROM grn_items gi
         LEFT JOIN skus sk ON gi.sku_id = sk.id
        WHERE gi.grn_id = $1`,
      [grnId],
    );

    const gstType = decideGstType(grn.warehouse_state, grn.supplier_state);
    const items = itemsRes.rows.map((row: any) => ({
      itemType: 'product',
      skuId: row.sku_id,
      skuCode: row.sku_code,
      skuName: row.sku_name,
      hsnCode: row.hsn_code,
      quantity: parseFloat(row.quantity_received || row.quantity_expected || 0),
      unitPrice: parseFloat(row.cost_price || 0),
      taxRate: parseFloat(row.gst_rate || 0),
    }));

    const invoice = await this.create({
      type: 'purchase',
      poId: grn.po_id,
      grnId: grn.id,
      supplierId: grn.supplier_id,
      warehouseId: grn.warehouse_id,
      gstType,
      invoiceDate: new Date().toISOString(),
      paymentTerms: 30,
      status: 'draft',
      notes: `Auto-generated from GRN ${grn.grn_number}`,
      items,
    } as CreateInvoiceDto);

    // Tag source_event so the UI can show an "auto-generated" badge
    await this.db.query(
      `UPDATE invoices SET source_event = 'grn_complete' WHERE id = $1`,
      [(invoice as any).id],
    );
    return { invoice, created: true };
  }

  /**
   * Generate a sales invoice from a dispatched shipment.
   * Idempotent — returns the existing invoice if one already exists for this shipment.
   */
  async createFromShipment(shipmentId: string): Promise<{ invoice: any; created: boolean }> {
    const tid = getCurrentTenantId();

    const existing = await this.db.query(
      `SELECT id FROM invoices WHERE tenant_id = $1 AND shipment_id = $2 AND type = 'sales' LIMIT 1`,
      [tid, shipmentId],
    );
    if ((existing.rowCount ?? 0) > 0) {
      const invoice = await this.findById(existing.rows[0].id);
      return { invoice, created: false };
    }

    const shipRes = await this.db.query(
      `SELECT sh.*, so.customer_id, so.so_number, so.warehouse_id AS so_warehouse_id,
              c.name AS customer_name, c.state AS customer_state,
              w.state AS warehouse_state
         FROM shipments sh
         LEFT JOIN sales_orders so ON sh.so_id = so.id
         LEFT JOIN customers c ON so.customer_id = c.id
         LEFT JOIN warehouses w ON COALESCE(sh.warehouse_id, so.warehouse_id) = w.id
        WHERE sh.id = $1 AND sh.tenant_id = $2`,
      [shipmentId, tid],
    );
    const ship = shipRes.rows[0];
    if (!ship) throw new NotFoundException(`Shipment ${shipmentId} not found`);
    if (!ship.so_id) {
      throw new BadRequestException(`Shipment ${shipmentId} is not linked to a sales order — cannot auto-invoice`);
    }

    const itemsRes = await this.db.query(
      `SELECT soi.*, sk.code AS sku_code, sk.name AS sku_name, sk.hsn_code, sk.gst_rate
         FROM sales_order_items soi
         LEFT JOIN skus sk ON soi.sku_id = sk.id
        WHERE soi.so_id = $1`,
      [ship.so_id],
    );

    const gstType = decideGstType(ship.warehouse_state, ship.customer_state);
    const items = itemsRes.rows.map((row: any) => ({
      itemType: 'product',
      skuId: row.sku_id,
      skuCode: row.sku_code,
      skuName: row.sku_name,
      hsnCode: row.hsn_code,
      quantity: parseFloat(row.quantity || 0),
      unitPrice: parseFloat(row.unit_price || row.price || 0),
      taxRate: parseFloat(row.tax_rate || row.gst_rate || row.gst_percent || 0),
      discountPercent: parseFloat(row.discount_percent || 0),
    }));

    const invoice = await this.create({
      type: 'sales',
      soId: ship.so_id,
      shipmentId: ship.id,
      customerId: ship.customer_id,
      warehouseId: ship.warehouse_id || ship.so_warehouse_id,
      gstType,
      invoiceDate: new Date().toISOString(),
      paymentTerms: 30,
      status: 'draft',
      notes: `Auto-generated from Shipment ${ship.shipment_number}`,
      items,
    } as CreateInvoiceDto);

    await this.db.query(
      `UPDATE invoices SET source_event = 'shipment_dispatch' WHERE id = $1`,
      [(invoice as any).id],
    );
    return { invoice, created: true };
  }

  /**
   * Service invoice (3PL only) — billed against a customer for storage / handling / value-added services
   * over a billing period. Uses the same invoices table with type='service' and items.itemType in
   * (storage, handling, vas, other).
   */
  async createServiceInvoice(dto: {
    customerId: string;
    warehouseId?: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    storageCharges?: number;
    handlingCharges?: number;
    vasCharges?: number;
    taxRate?: number;
    notes?: string;
  }) {
    const tid = getCurrentTenantId();

    // 3PL gate
    const tenant = await this.db.query<{ company_type: string | null }>(
      `SELECT company_type FROM tenants WHERE id = $1`,
      [tid],
    );
    if ((tenant.rows[0]?.company_type || '').toLowerCase() !== '3pl') {
      throw new BadRequestException('Service invoices are only available for 3PL tenants');
    }

    const taxRate = dto.taxRate ?? 18;

    // Look up state for GST decision
    const stateRes = await this.db.query<{ customer_state: string | null; warehouse_state: string | null }>(
      `SELECT c.state AS customer_state, w.state AS warehouse_state
         FROM customers c
         LEFT JOIN warehouses w ON w.id = $2
        WHERE c.id = $1 AND c.tenant_id = $3`,
      [dto.customerId, dto.warehouseId || null, tid],
    );
    const gstType = decideGstType(stateRes.rows[0]?.warehouse_state, stateRes.rows[0]?.customer_state);

    const items: any[] = [];
    if (dto.storageCharges && dto.storageCharges > 0) {
      items.push({ itemType: 'storage', skuName: 'Storage charges', quantity: 1, unitPrice: dto.storageCharges, taxRate });
    }
    if (dto.handlingCharges && dto.handlingCharges > 0) {
      items.push({ itemType: 'handling', skuName: 'Handling charges', quantity: 1, unitPrice: dto.handlingCharges, taxRate });
    }
    if (dto.vasCharges && dto.vasCharges > 0) {
      items.push({ itemType: 'vas', skuName: 'Value-added services', quantity: 1, unitPrice: dto.vasCharges, taxRate });
    }
    if (items.length === 0) {
      throw new BadRequestException('At least one of storageCharges, handlingCharges, vasCharges must be > 0');
    }

    const invoice = await this.create({
      type: 'service',
      customerId: dto.customerId,
      warehouseId: dto.warehouseId,
      billingPeriodStart: dto.billingPeriodStart,
      billingPeriodEnd: dto.billingPeriodEnd,
      gstType,
      invoiceDate: new Date().toISOString(),
      paymentTerms: 30,
      status: 'draft',
      notes: dto.notes,
      items,
    } as CreateInvoiceDto);

    await this.db.query(
      `UPDATE invoices SET source_event = 'service_billing' WHERE id = $1`,
      [(invoice as any).id],
    );
    return invoice;
  }

  private calculateGST(items: any[], gstType: string): any[] {
    return items.map((item) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const discountPercent = item.discountPercent || 0;
      const taxRate = item.taxRate || 0;

      const lineSubtotal = quantity * unitPrice;
      const discountAmount = lineSubtotal * (discountPercent / 100);
      const taxableAmount = lineSubtotal - discountAmount;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (gstType === 'inter-state') {
        igstAmount = taxableAmount * (taxRate / 100);
      } else {
        cgstAmount = taxableAmount * (taxRate / 2 / 100);
        sgstAmount = taxableAmount * (taxRate / 2 / 100);
      }

      const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

      return {
        ...item,
        discountAmount: Math.round(discountAmount * 100) / 100,
        cgstAmount: Math.round(cgstAmount * 100) / 100,
        sgstAmount: Math.round(sgstAmount * 100) / 100,
        igstAmount: Math.round(igstAmount * 100) / 100,
        lineTotal: Math.round(lineTotal * 100) / 100,
      };
    });
  }
}
