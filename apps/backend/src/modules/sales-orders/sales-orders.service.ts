import { Injectable, NotFoundException } from '@nestjs/common';
import { SalesOrdersRepository } from './sales-orders.repository';
import { DatabaseService } from '../../database/database.service';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class SalesOrdersService {
  constructor(

    private repository: SalesOrdersRepository,
    private db: DatabaseService,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id, getCurrentTenantId());
    if (!item) throw new NotFoundException(`SalesOrder ${id} not found`);
    return item;
  }

  async findById(id: string) { return this.findOne(id); }

  async create(dto: any) {
    const soNumber = dto.soNumber || await this.generateCode();

    // If customer_name provided but no customer_id, look up or create customer
    let customerId = dto.customerId || dto.customer_id || null;
    const customerName = dto.customer_name || dto.customerName;
    if (!customerId && customerName) {
      const existing = await this.db.query(
        `SELECT id FROM customers WHERE name = $1 AND tenant_id = $2 LIMIT 1`,
        [customerName, getCurrentTenantId()],
      );
      if (existing.rows[0]) {
        customerId = existing.rows[0].id;
      } else {
        // Auto-create customer
        const countRes = await this.db.query(`SELECT COUNT(*) as count FROM customers WHERE tenant_id = $1`, [getCurrentTenantId()]);
        const code = `CUST-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;
        const newCust = await this.db.query(
          `INSERT INTO customers (tenant_id, code, name, phone, status) VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
          [getCurrentTenantId(), code, customerName, dto.customer_contact || null],
        );
        customerId = newCust.rows[0].id;
      }
    }

    const { code, customer_name, customerName: cn, customer_code, customer_contact, ...rest } = dto;
    return this.repository.create(getCurrentTenantId(), {
      ...rest,
      soNumber,
      customerId,
      shippingAddress: dto.customer_address || dto.shipping_address || dto.shippingAddress || null,
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id, getCurrentTenantId());
    if (!deleted) throw new NotFoundException(`SalesOrder ${id} not found`);
  }

  async delete(id: string) { return this.remove(id); }

  async getStats() {
    const rows = await this.repository.countByStatus(getCurrentTenantId());
    const stats: Record<string, number> = {};
    rows.forEach((r: any) => stats[r.status] = parseInt(r.count, 10));
    return stats;
  }

  async updateStatus(id: string, status: string, extraFields?: Record<string, any>) {
    await this.findOne(id);
    return this.repository.updateStatus(id, getCurrentTenantId(), status, extraFields);
  }

  async submit(id: string) { return this.updateStatus(id, 'submitted'); }
  async approve(id: string, approvedBy?: string) { return this.updateStatus(id, 'approved', { approvedBy, approvedAt: new Date() }); }
  async cancel(id: string) { return this.updateStatus(id, 'cancelled'); }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countByTenant(getCurrentTenantId());
    return `SO-${String(count + 1).padStart(3, '0')}`;
  }
}
