import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { DatabaseService } from '../../database/database.service';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




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
