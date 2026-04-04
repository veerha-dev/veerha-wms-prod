import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from './dto';

@Injectable()
export class CustomersRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryCustomerDto): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 50, search, status } = query;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;

    if (search) { conditions.push(`(name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`status = $${idx}`); params.push(status); idx++; }

    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) as count FROM customers WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(`SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
    return { data: dataRes.rows, total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`SELECT * FROM customers WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return res.rows[0] || null;
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(`SELECT COUNT(*) as count FROM customers WHERE tenant_id = $1`, [tenantId]);
    return parseInt(res.rows[0].count, 10);
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const res = await this.db.query(
      `INSERT INTO customers (tenant_id, code, name, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [tenantId, dto.code, dto.name || '', dto.status || 'active']
    );
    return res.rows[0];
  }

  async update(id: string, tenantId: string, dto: any): Promise<any> {
    const updates: string[] = []; const params: any[] = []; let idx = 1;
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) { updates.push(`${key} = $${idx}`); params.push(val); idx++; }
    }
    if (updates.length === 0) return this.findById(id, tenantId);
    updates.push('updated_at = NOW()');
    params.push(id, tenantId);
    const res = await this.db.query(`UPDATE customers SET ${updates.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`, params);
    return res.rows[0] || null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM customers WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return (res.rowCount ?? 0) > 0;
  }

  async countByStatus(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`SELECT status, COUNT(*) as count FROM customers WHERE tenant_id = $1 GROUP BY status`, [tenantId]);
    return res.rows;
  }

  async updateStatus(id: string, tenantId: string, status: string): Promise<any> {
    const res = await this.db.query(`UPDATE customers SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *`, [status, id, tenantId]);
    return res.rows[0] || null;
  }
}
