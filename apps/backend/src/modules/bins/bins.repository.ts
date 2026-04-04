import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBinDto, UpdateBinDto, QueryBinDto } from './dto';

export interface Bin {
  id: string;
  tenantId: string;
  rackId: string;
  zoneId: string;
  warehouseId: string;
  code: string;
  level: number;
  position: number;
  capacity: number;
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  status: string;
  isLocked: boolean;
  lockReason: string | null;
  lastMovementAt: Date | null;
  utilization: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BinsRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryBinDto): Promise<{ data: Bin[]; total: number }> {
    const { page = 1, limit = 50, search, rackId, zoneId, warehouseId, status, isLocked, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    let whereConditions = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (rackId) {
      whereConditions.push(`rack_id = $${paramIndex}`);
      params.push(rackId);
      paramIndex++;
    }

    if (zoneId) {
      whereConditions.push(`zone_id = $${paramIndex}`);
      params.push(zoneId);
      paramIndex++;
    }

    if (warehouseId) {
      whereConditions.push(`warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (isLocked !== undefined) {
      whereConditions.push(`is_locked = $${paramIndex}`);
      params.push(isLocked);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`code ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const validSortColumns = ['code', 'level', 'position', 'status', 'createdAt', 'updatedAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM bins WHERE ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT 
        id,
        tenant_id,
        rack_id,
        zone_id,
        warehouse_id,
        code,
        level,
        position,
        capacity,
        max_weight,
        max_volume,
        current_weight,
        current_volume,
        CASE 
          WHEN max_weight > 0 AND max_volume > 0 THEN 
            GREATEST(
              (current_weight / max_weight * 100),
              (current_volume / max_volume * 100)
            )
          WHEN max_weight > 0 THEN (current_weight / max_weight * 100)
          WHEN max_volume > 0 THEN (current_volume / max_volume * 100)
          ELSE 0
        END as utilization,
        status,
        is_locked,
        lock_reason,
        last_movement_at,
        created_at,
        updated_at
      FROM bins
      WHERE ${whereClause}
      ORDER BY ${this.toSnakeCase(sortColumn)} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, params);

    return {
      data: dataResult.rows.map(this.mapToBin),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Bin | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        rack_id,
        zone_id,
        warehouse_id,
        code,
        level,
        position,
        capacity,
        max_weight,
        max_volume,
        current_weight,
        current_volume,
        CASE 
          WHEN max_weight > 0 AND max_volume > 0 THEN 
            GREATEST(
              (current_weight / max_weight * 100),
              (current_volume / max_volume * 100)
            )
          WHEN max_weight > 0 THEN (current_weight / max_weight * 100)
          WHEN max_volume > 0 THEN (current_volume / max_volume * 100)
          ELSE 0
        END as utilization,
        status,
        is_locked,
        lock_reason,
        last_movement_at,
        created_at,
        updated_at
      FROM bins
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await this.db.query(query, [id, tenantId]);
    return result.rows.length > 0 ? this.mapToBin(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<Bin | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        rack_id,
        zone_id,
        warehouse_id,
        code,
        level,
        position,
        capacity,
        max_weight,
        max_volume,
        current_weight,
        current_volume,
        CASE 
          WHEN max_weight > 0 AND max_volume > 0 THEN 
            GREATEST(
              (current_weight / max_weight * 100),
              (current_volume / max_volume * 100)
            )
          WHEN max_weight > 0 THEN (current_weight / max_weight * 100)
          WHEN max_volume > 0 THEN (current_volume / max_volume * 100)
          ELSE 0
        END as utilization,
        status,
        is_locked,
        lock_reason,
        last_movement_at,
        created_at,
        updated_at
      FROM bins
      WHERE code = $1
    `;

    const result = await this.db.query(query, [code]);
    return result.rows.length > 0 ? this.mapToBin(result.rows[0]) : null;
  }

  async create(tenantId: string, dto: CreateBinDto & { code: string }): Promise<Bin> {
    const query = `
      INSERT INTO bins (
        tenant_id, rack_id, zone_id, warehouse_id, code, level, position,
        capacity, max_weight, max_volume, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const params = [
      tenantId,
      dto.rackId,
      dto.zoneId,
      dto.warehouseId,
      dto.code,
      dto.level,
      dto.position,
      dto.capacity || 0,
      dto.maxWeight || 0,
      dto.maxVolume || 0,
      dto.status || 'empty',
    ];

    const result = await this.db.query(query, params);
    return this.mapToBin(result.rows[0]);
  }

  async update(id: string, tenantId: string, dto: UpdateBinDto): Promise<Bin> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.code !== undefined) {
      updates.push(`code = $${paramIndex}`);
      params.push(dto.code);
      paramIndex++;
    }

    if (dto.level !== undefined) {
      updates.push(`level = $${paramIndex}`);
      params.push(dto.level);
      paramIndex++;
    }

    if (dto.position !== undefined) {
      updates.push(`position = $${paramIndex}`);
      params.push(dto.position);
      paramIndex++;
    }

    if (dto.capacity !== undefined) {
      updates.push(`capacity = $${paramIndex}`);
      params.push(dto.capacity);
      paramIndex++;
    }

    if (dto.maxWeight !== undefined) {
      updates.push(`max_weight = $${paramIndex}`);
      params.push(dto.maxWeight);
      paramIndex++;
    }

    if (dto.maxVolume !== undefined) {
      updates.push(`max_volume = $${paramIndex}`);
      params.push(dto.maxVolume);
      paramIndex++;
    }

    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(dto.status);
      paramIndex++;
    }

    if (dto.isLocked !== undefined) {
      updates.push(`is_locked = $${paramIndex}`);
      params.push(dto.isLocked);
      paramIndex++;
    }

    if (dto.lockReason !== undefined) {
      updates.push(`lock_reason = $${paramIndex}`);
      params.push(dto.lockReason);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    params.push(id, tenantId);

    const query = `
      UPDATE bins
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    return this.mapToBin(result.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const query = 'DELETE FROM bins WHERE id = $1 AND tenant_id = $2';
    await this.db.query(query, [id, tenantId]);
  }

  async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM bins';
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async updateRackBinCount(rackId: string): Promise<void> {
    const query = `
      UPDATE racks
      SET bin_count = (
        SELECT COUNT(*) FROM bins WHERE rack_id = $1
      )
      WHERE id = $1
    `;
    await this.db.query(query, [rackId]);
  }

  async updateZoneBinCount(zoneId: string): Promise<void> {
    const query = `
      UPDATE zones
      SET bin_count = (
        SELECT COUNT(*) FROM bins WHERE zone_id = $1
      )
      WHERE id = $1
    `;
    await this.db.query(query, [zoneId]);
  }

  private mapToBin(row: any): Bin {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      rackId: row.rack_id,
      zoneId: row.zone_id,
      warehouseId: row.warehouse_id,
      code: row.code,
      level: parseInt(row.level, 10),
      position: parseInt(row.position, 10),
      capacity: parseFloat(row.capacity),
      maxWeight: parseFloat(row.max_weight),
      maxVolume: parseFloat(row.max_volume),
      currentWeight: parseFloat(row.current_weight),
      currentVolume: parseFloat(row.current_volume),
      utilization: parseFloat(row.utilization || 0),
      status: row.status,
      isLocked: row.is_locked,
      lockReason: row.lock_reason,
      lastMovementAt: row.last_movement_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
