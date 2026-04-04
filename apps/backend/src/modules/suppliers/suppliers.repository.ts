import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SuppliersRepository {
  constructor(private db: DatabaseService) {}

  private mapRow(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      code: row.code,
      name: row.name,
      email: row.email,
      phone: row.phone,
      contactPerson: row.contact_person,
      address: [row.address_line1, row.city, row.state].filter(Boolean).join(', ') || null,
      addressLine1: row.address_line1,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      gstNumber: row.gst_number,
      paymentTerms: row.payment_terms || row.lead_time_days || 30,
      leadTimeDays: row.lead_time_days,
      status: row.status,
      isActive: row.status === 'active',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(tenantId: string, query: any): Promise<{ data: any[]; total: number }> {
    const { page: rawPage = 1, limit = 50, search, status } = query;
    const page = Math.max(1, rawPage || 1);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;
    if (search) { conditions.push(`(name ILIKE $${idx} OR code ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`status = $${idx}`); params.push(status); idx++; }
    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) as count FROM suppliers WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(`SELECT * FROM suppliers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
    return { data: dataRes.rows.map(r => this.mapRow(r)), total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`SELECT * FROM suppliers WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return this.mapRow(res.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(`SELECT COUNT(*) as count FROM suppliers WHERE tenant_id = $1`, [tenantId]);
    return parseInt(res.rows[0].count, 10);
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const res = await this.db.query(
      `INSERT INTO suppliers (tenant_id, code, name, email, phone, address_line1, city, gst_number, contact_person, payment_terms, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [tenantId, dto.code, dto.name, dto.email || null, dto.phone || null,
       dto.address || dto.addressLine1 || null, dto.city || null,
       dto.gstNumber || dto.gst_number || null, dto.contactPerson || dto.contact_person || null,
       dto.paymentTerms || dto.payment_terms || null, dto.status || 'active'],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: string, tenantId: string, dto: any): Promise<any> {
    const updates: string[] = []; const params: any[] = []; let idx = 1;
    const fieldMap: Record<string, string> = {
      name: 'name', code: 'code', email: 'email', phone: 'phone',
      contactPerson: 'contact_person', contact_person: 'contact_person',
      address: 'address_line1', addressLine1: 'address_line1',
      city: 'city', state: 'state', postalCode: 'postal_code',
      gstNumber: 'gst_number', gst_number: 'gst_number',
      paymentTerms: 'payment_terms', payment_terms: 'payment_terms',
      status: 'status',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (dto[key] !== undefined) { updates.push(`${col} = $${idx}`); params.push(dto[key]); idx++; }
    }
    if (updates.length === 0) return this.findById(id, tenantId);
    updates.push('updated_at = NOW()');
    params.push(id, tenantId);
    const res = await this.db.query(`UPDATE suppliers SET ${updates.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`, params);
    return this.mapRow(res.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM suppliers WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return (res.rowCount ?? 0) > 0;
  }

  async countByStatus(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`SELECT status, COUNT(*) as count FROM suppliers WHERE tenant_id = $1 GROUP BY status`, [tenantId]);
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
    const res = await this.db.query(`UPDATE suppliers SET ${sets.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`, params);
    return this.mapRow(res.rows[0]);
  }
}
