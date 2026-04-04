import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAisleDto, UpdateAisleDto, QueryAisleDto } from './dto';

export interface Aisle {
  id: string;
  tenantId: string;
  zoneId: string;
  code: string;
  name: string;
  sortOrder: number;
  rackCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AislesRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryAisleDto): Promise<{ data: Aisle[]; total: number }> {
    const { page = 1, limit = 50, search, zoneId, warehouseId, isActive, sortBy = 'sortOrder', sortOrder = 'asc' } = query;
    const offset = (page - 1) * limit;

    let whereConditions = ['a.tenant_id = $1'];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (zoneId) {
      whereConditions.push(`a.zone_id = $${paramIndex}`);
      params.push(zoneId);
      paramIndex++;
    }

    if (warehouseId) {
      whereConditions.push(`z.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }

    if (isActive !== undefined) {
      whereConditions.push(`a.is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(a.name ILIKE $${paramIndex} OR a.code ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const needsJoin = !!warehouseId;
    const fromClause = needsJoin
      ? 'aisles a JOIN zones z ON a.zone_id = z.id'
      : 'aisles a';

    const validSortColumns = ['code', 'name', 'sortOrder', 'createdAt', 'updatedAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'sortOrder';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM ${fromClause} WHERE ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT
        a.id,
        a.tenant_id,
        a.zone_id,
        a.code,
        a.name,
        a.sort_order,
        a.rack_count,
        a.is_active,
        a.created_at,
        a.updated_at
      FROM ${fromClause}
      WHERE ${whereClause}
      ORDER BY a.${this.toSnakeCase(sortColumn)} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, params);

    return {
      data: dataResult.rows.map(this.mapToAisle),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Aisle | null> {
    const query = `
      SELECT
        id, tenant_id, zone_id, code, name, sort_order,
        rack_count, is_active, created_at, updated_at
      FROM aisles
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await this.db.query(query, [id, tenantId]);
    return result.rows.length > 0 ? this.mapToAisle(result.rows[0]) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<Aisle | null> {
    const query = `
      SELECT
        id, tenant_id, zone_id, code, name, sort_order,
        rack_count, is_active, created_at, updated_at
      FROM aisles
      WHERE code = $1 AND tenant_id = $2
    `;

    const result = await this.db.query(query, [code, tenantId]);
    return result.rows.length > 0 ? this.mapToAisle(result.rows[0]) : null;
  }

  async create(tenantId: string, dto: CreateAisleDto & { code: string }): Promise<Aisle> {
    const query = `
      INSERT INTO aisles (
        tenant_id, zone_id, code, name, sort_order, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const params = [
      tenantId,
      dto.zoneId,
      dto.code,
      dto.name,
      dto.sortOrder || 0,
      dto.isActive !== undefined ? dto.isActive : true,
    ];

    const result = await this.db.query(query, params);
    return this.mapToAisle(result.rows[0]);
  }

  async update(id: string, tenantId: string, dto: UpdateAisleDto): Promise<Aisle> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.code !== undefined) {
      updates.push(`code = $${paramIndex}`);
      params.push(dto.code);
      paramIndex++;
    }

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(dto.name);
      paramIndex++;
    }

    if (dto.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex}`);
      params.push(dto.sortOrder);
      paramIndex++;
    }

    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(dto.isActive);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    params.push(id, tenantId);

    const query = `
      UPDATE aisles
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    return this.mapToAisle(result.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const query = 'DELETE FROM aisles WHERE id = $1 AND tenant_id = $2';
    await this.db.query(query, [id, tenantId]);
  }

  async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM aisles';
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async updateZoneAisleCount(zoneId: string): Promise<void> {
    const query = `
      UPDATE zones
      SET aisle_count = (
        SELECT COUNT(*) FROM aisles WHERE zone_id = $1
      )
      WHERE id = $1
    `;
    await this.db.query(query, [zoneId]);
  }

  private mapToAisle(row: any): Aisle {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      zoneId: row.zone_id,
      code: row.code,
      name: row.name,
      sortOrder: parseInt(row.sort_order, 10),
      rackCount: parseInt(row.rack_count, 10),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
