import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ReturnsRepository {
  constructor(private db: DatabaseService) {}

  private mapRow(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      returnNumber: row.return_number,
      return_number: row.return_number,
      soId: row.so_id,
      customerId: row.customer_id,
      warehouseId: row.warehouse_id,
      reason: row.reason,
      returnReason: row.reason,
      status: row.status,
      condition: row.condition || 'good',
      decision: row.decision || 'pending',
      quantity: row.quantity || 0,
      totalRefund: row.total_refund || 0,
      receivedAt: row.received_at,
      received_at: row.received_at,
      processedAt: row.processed_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Nested for frontend
      salesOrder: row.so_number ? { orderNumber: row.so_number, soNumber: row.so_number } : null,
      customer: row.customer_name ? { name: row.customer_name } : null,
      _count: { items: row.item_count ? parseInt(row.item_count) : (row.quantity || 0) },
    };
  }

  async findAll(tenantId: string, query: any): Promise<{ data: any[]; total: number }> {
    const { page: rawPage = 1, limit = 50, search, status } = query;
    const page = Math.max(1, rawPage || 1);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['r.tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;
    if (search) { conditions.push(`(r.return_number ILIKE $${idx} OR r.reason ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`r.status = $${idx}`); params.push(status); idx++; }
    const where = conditions.join(' AND ');

    const countRes = await this.db.query(`SELECT COUNT(*) as count FROM returns r WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await this.db.query(`
      SELECT r.*, so.so_number, c.name as customer_name,
             (SELECT count(*) FROM return_items WHERE return_id = r.id) as item_count
      FROM returns r
      LEFT JOIN sales_orders so ON r.so_id = so.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE ${where}
      ORDER BY r.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, limit, offset]);

    return { data: dataRes.rows.map(r => this.mapRow(r)), total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`
      SELECT r.*, so.so_number, c.name as customer_name
      FROM returns r
      LEFT JOIN sales_orders so ON r.so_id = so.id
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.id = $1 AND r.tenant_id = $2
    `, [id, tenantId]);
    return this.mapRow(res.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(`SELECT COUNT(*) as count FROM returns WHERE tenant_id = $1`, [tenantId]);
    return parseInt(res.rows[0].count, 10);
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const returnNumber = dto.returnNumber || dto.return_number;
    const soId = dto.soId || dto.so_id || null;
    const customerId = dto.customerId || dto.customer_id || null;
    const warehouseId = dto.warehouseId || dto.warehouse_id || null;
    const reason = dto.reason || dto.order_reference || null;
    const notes = dto.notes || null;
    const condition = dto.condition || 'good';

    const quantity = dto.quantity || 0;

    const res = await this.db.query(
      `INSERT INTO returns (tenant_id, return_number, so_id, customer_id, warehouse_id, reason, condition, quantity, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9) RETURNING *`,
      [tenantId, returnNumber, soId, customerId, warehouseId, reason, condition, quantity, notes],
    );
    return this.findById(res.rows[0].id, tenantId);
  }

  async update(id: string, tenantId: string, dto: any): Promise<any> {
    const updates: string[] = []; const params: any[] = []; let idx = 1;
    const fieldMap: Record<string, string> = {
      reason: 'reason', notes: 'notes', status: 'status',
      condition: 'condition', decision: 'decision',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (dto[key] !== undefined) { updates.push(`${col} = $${idx}`); params.push(dto[key]); idx++; }
    }
    if (updates.length === 0) return this.findById(id, tenantId);
    updates.push('updated_at = NOW()');
    params.push(id, tenantId);
    await this.db.query(`UPDATE returns SET ${updates.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1}`, params);
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM returns WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return (res.rowCount ?? 0) > 0;
  }

  async countByStatus(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`SELECT status, COUNT(*) as count FROM returns WHERE tenant_id = $1 GROUP BY status`, [tenantId]);
    return res.rows;
  }

  async updateStatus(id: string, tenantId: string, status: string, extraFields?: Record<string, any>): Promise<any> {
    const sets = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];
    let idx = 2;
    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) {
        const col = k.replace(/[A-Z]/g, (l: string) => '_' + l.toLowerCase());
        sets.push(`${col} = $${idx}`); params.push(v); idx++;
      }
    }
    params.push(id, tenantId);
    await this.db.query(`UPDATE returns SET ${sets.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1}`, params);
    return this.findById(id, tenantId);
  }
}
