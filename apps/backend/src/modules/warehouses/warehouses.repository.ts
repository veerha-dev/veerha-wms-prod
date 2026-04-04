import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto } from './dto';

export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  totalCapacity: number;
  totalAreaSqft: number | null;
  currentOccupancy: number;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DbWarehouseRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  type: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  total_capacity: number;
  total_area_sqft: number | null;
  current_occupancy: number;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class WarehousesRepository {
  constructor(private db: DatabaseService) {}

  private mapRowToWarehouse(row: DbWarehouseRow): Warehouse {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      code: row.code,
      name: row.name,
      type: row.type,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      totalCapacity: row.total_capacity,
      totalAreaSqft: row.total_area_sqft ? Number(row.total_area_sqft) : null,
      currentOccupancy: row.current_occupancy,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAll(
    tenantId: string,
    query: QueryWarehouseDto,
  ): Promise<{ data: Warehouse[]; total: number }> {
    const { page = 1, limit = 50, search, type, status, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ['created_at', 'updated_at', 'name', 'code', 'city', 'status'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM warehouses WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const dataResult = await this.db.query<DbWarehouseRow>(
      `SELECT * FROM warehouses 
       WHERE ${whereClause} 
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return {
      data: dataResult.rows.map((row) => this.mapRowToWarehouse(row)),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Warehouse | null> {
    const result = await this.db.query<DbWarehouseRow>(
      'SELECT * FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [id, tenantId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToWarehouse(result.rows[0]);
  }

  async findByCode(code: string): Promise<Warehouse | null> {
    const result = await this.db.query<DbWarehouseRow>(
      'SELECT * FROM warehouses WHERE code = $1',
      [code],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToWarehouse(result.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM warehouses WHERE tenant_id = $1',
      [tenantId],
    );
    return parseInt(result.rows[0].count, 10);
  }

  async create(tenantId: string, dto: CreateWarehouseDto & { code: string }): Promise<Warehouse> {
    const result = await this.db.query<DbWarehouseRow>(
      `INSERT INTO warehouses (
        tenant_id, code, name, type, address_line1, address_line2,
        city, state, postal_code, country, total_capacity, total_area_sqft,
        contact_phone, contact_email, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        tenantId,
        dto.code,
        dto.name,
        dto.type || 'distribution',
        dto.addressLine1,
        dto.addressLine2 || null,
        dto.city,
        dto.state,
        dto.postalCode || null,
        dto.country || 'India',
        dto.totalCapacity,
        dto.totalAreaSqft || null,
        dto.contactPhone || null,
        dto.contactEmail || null,
        dto.status || 'active',
      ],
    );

    return this.mapRowToWarehouse(result.rows[0]);
  }

  async update(id: string, tenantId: string, dto: UpdateWarehouseDto): Promise<Warehouse | null> {
    // Build dynamic UPDATE query
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      type: 'type',
      addressLine1: 'address_line1',
      addressLine2: 'address_line2',
      city: 'city',
      state: 'state',
      postalCode: 'postal_code',
      country: 'country',
      totalCapacity: 'total_capacity',
      totalAreaSqft: 'total_area_sqft',
      contactPhone: 'contact_phone',
      contactEmail: 'contact_email',
      status: 'status',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (dto[key as keyof UpdateWarehouseDto] !== undefined) {
        updates.push(`${column} = $${paramIndex}`);
        params.push(dto[key as keyof UpdateWarehouseDto]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id, tenantId);
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    params.push(id, tenantId);

    const result = await this.db.query<DbWarehouseRow>(
      `UPDATE warehouses 
       SET ${updates.join(', ')} 
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToWarehouse(result.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM warehouses WHERE id = $1 AND tenant_id = $2',
      [id, tenantId],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
