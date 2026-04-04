import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryUserDto } from './dto';

@Injectable()
export class UsersRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryUserDto) {
    const { page = 1, limit = 50, search, status, role, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['u.tenant_id = $1'];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      const isActive = status === 'active';
      conditions.push(`u.is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }
    if (role) {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    const allowedSort = ['email', 'full_name', 'role', 'created_at', 'last_login'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');

    const countResult = await this.db.query(`SELECT COUNT(*) FROM users u WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT u.* FROM users u WHERE ${where} ORDER BY u.${safeSort} ${safeOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByEmail(tenantId: string, email: string) {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1 AND tenant_id = $2', [email, tenantId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO users (tenant_id, email, full_name, password_hash, role, is_active, warehouse_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenantId,
        data.email,
        data.fullName || data.full_name || data.name || data.email,
        data.passwordHash || null,
        data.role || 'worker',
        data.isActive !== undefined ? data.isActive : true,
        data.warehouseId || null,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;

    const mappings: Record<string, string> = {
      email: 'email',
      fullName: 'full_name',
      passwordHash: 'password_hash',
      role: 'role',
      isActive: 'is_active',
      lastLogin: 'last_login',
      warehouseId: 'warehouse_id',
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
      `UPDATE users SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  async setActive(tenantId: string, id: string, isActive: boolean) {
    const result = await this.db.query(
      `UPDATE users SET is_active = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, tenantId, isActive],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async getStats(tenantId: string) {
    const result = await this.db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
       FROM users WHERE tenant_id = $1`,
      [tenantId],
    );
    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      active: parseInt(row.active, 10),
      inactive: parseInt(row.inactive, 10),
    };
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      fullName: row.full_name,
      full_name: row.full_name,
      phone: row.phone || null,
      role: row.role,
      warehouseId: row.warehouse_id || null,
      warehouse_id: row.warehouse_id || null,
      isActive: row.is_active,
      is_active: row.is_active,
      lastLogin: row.last_login,
      last_login: row.last_login,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
