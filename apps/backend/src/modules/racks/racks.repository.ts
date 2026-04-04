import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateRackDto, UpdateRackDto, QueryRackDto } from './dto';

export interface Rack {
  id: string;
  tenantId: string;
  zoneId: string;
  aisleId: string | null;
  code: string;
  name: string;
  rowPosition: number | null;
  columnPosition: number | null;
  levels: number;
  slotsPerLevel: number;
  maxWeightKg: number;
  maxVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  binCount: number;
  utilization: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RacksRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryRackDto): Promise<{ data: Rack[]; total: number }> {
    const { page = 1, limit = 50, search, zoneId, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    let whereConditions = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (zoneId) {
      whereConditions.push(`zone_id = $${paramIndex}`);
      params.push(zoneId);
      paramIndex++;
    }

    if ((query as any).aisleId) {
      whereConditions.push(`aisle_id = $${paramIndex}`);
      params.push((query as any).aisleId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const validSortColumns = ['code', 'name', 'levels', 'createdAt', 'updatedAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM racks WHERE ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT 
        id,
        tenant_id,
        zone_id,
        aisle_id,
        code,
        name,
        row_position,
        column_position,
        levels,
        slots_per_level,
        max_weight_kg,
        max_volume_m3,
        current_weight_kg,
        current_volume_m3,
        bin_count,
        CASE 
          WHEN max_weight_kg > 0 AND max_volume_m3 > 0 THEN 
            GREATEST(
              (current_weight_kg / max_weight_kg * 100),
              (current_volume_m3 / max_volume_m3 * 100)
            )
          WHEN max_weight_kg > 0 THEN (current_weight_kg / max_weight_kg * 100)
          WHEN max_volume_m3 > 0 THEN (current_volume_m3 / max_volume_m3 * 100)
          ELSE 0
        END as utilization,
        status,
        created_at,
        updated_at
      FROM racks
      WHERE ${whereClause}
      ORDER BY ${this.toSnakeCase(sortColumn)} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, params);

    return {
      data: dataResult.rows.map(this.mapToRack),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Rack | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        zone_id,
        aisle_id,
        code,
        name,
        row_position,
        column_position,
        levels,
        slots_per_level,
        max_weight_kg,
        max_volume_m3,
        current_weight_kg,
        current_volume_m3,
        bin_count,
        CASE 
          WHEN max_weight_kg > 0 AND max_volume_m3 > 0 THEN 
            GREATEST(
              (current_weight_kg / max_weight_kg * 100),
              (current_volume_m3 / max_volume_m3 * 100)
            )
          WHEN max_weight_kg > 0 THEN (current_weight_kg / max_weight_kg * 100)
          WHEN max_volume_m3 > 0 THEN (current_volume_m3 / max_volume_m3 * 100)
          ELSE 0
        END as utilization,
        status,
        created_at,
        updated_at
      FROM racks
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await this.db.query(query, [id, tenantId]);
    return result.rows.length > 0 ? this.mapToRack(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<Rack | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        zone_id,
        aisle_id,
        code,
        name,
        row_position,
        column_position,
        levels,
        slots_per_level,
        max_weight_kg,
        max_volume_m3,
        current_weight_kg,
        current_volume_m3,
        bin_count,
        CASE 
          WHEN max_weight_kg > 0 AND max_volume_m3 > 0 THEN 
            GREATEST(
              (current_weight_kg / max_weight_kg * 100),
              (current_volume_m3 / max_volume_m3 * 100)
            )
          WHEN max_weight_kg > 0 THEN (current_weight_kg / max_weight_kg * 100)
          WHEN max_volume_m3 > 0 THEN (current_volume_m3 / max_volume_m3 * 100)
          ELSE 0
        END as utilization,
        status,
        created_at,
        updated_at
      FROM racks
      WHERE code = $1
    `;

    const result = await this.db.query(query, [code]);
    return result.rows.length > 0 ? this.mapToRack(result.rows[0]) : null;
  }

  async create(tenantId: string, dto: CreateRackDto & { code: string }): Promise<Rack> {
    const query = `
      INSERT INTO racks (
        tenant_id, zone_id, aisle_id, code, name, row_position, column_position,
        levels, slots_per_level, max_weight_kg, max_volume_m3, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const params = [
      tenantId,
      dto.zoneId,
      dto.aisleId || null,
      dto.code,
      dto.name,
      dto.rowPosition || null,
      dto.columnPosition || null,
      dto.levels || 1,
      dto.slotsPerLevel || 1,
      dto.maxWeightKg || 0,
      dto.maxVolumeM3 || 0,
      dto.status || 'active',
    ];

    const result = await this.db.query(query, params);
    return this.mapToRack(result.rows[0]);
  }

  async update(id: string, tenantId: string, dto: UpdateRackDto): Promise<Rack> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (dto.aisleId !== undefined) {
      updates.push(`aisle_id = $${paramIndex}`);
      params.push(dto.aisleId || null);
      paramIndex++;
    }

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

    if (dto.rowPosition !== undefined) {
      updates.push(`row_position = $${paramIndex}`);
      params.push(dto.rowPosition);
      paramIndex++;
    }

    if (dto.columnPosition !== undefined) {
      updates.push(`column_position = $${paramIndex}`);
      params.push(dto.columnPosition);
      paramIndex++;
    }

    if (dto.levels !== undefined) {
      updates.push(`levels = $${paramIndex}`);
      params.push(dto.levels);
      paramIndex++;
    }

    if (dto.slotsPerLevel !== undefined) {
      updates.push(`slots_per_level = $${paramIndex}`);
      params.push(dto.slotsPerLevel);
      paramIndex++;
    }

    if (dto.maxWeightKg !== undefined) {
      updates.push(`max_weight_kg = $${paramIndex}`);
      params.push(dto.maxWeightKg);
      paramIndex++;
    }

    if (dto.maxVolumeM3 !== undefined) {
      updates.push(`max_volume_m3 = $${paramIndex}`);
      params.push(dto.maxVolumeM3);
      paramIndex++;
    }

    if (dto.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(dto.status);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    params.push(id, tenantId);

    const query = `
      UPDATE racks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    return this.mapToRack(result.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const query = 'DELETE FROM racks WHERE id = $1 AND tenant_id = $2';
    await this.db.query(query, [id, tenantId]);
  }

  async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM racks';
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async updateAisleRackCount(aisleId: string): Promise<void> {
    const query = `
      UPDATE aisles
      SET rack_count = (
        SELECT COUNT(*) FROM racks WHERE aisle_id = $1
      )
      WHERE id = $1
    `;
    await this.db.query(query, [aisleId]);
  }

  async updateZoneRackCount(zoneId: string): Promise<void> {
    const query = `
      UPDATE zones
      SET rack_count = (
        SELECT COUNT(*) FROM racks WHERE zone_id = $1
      )
      WHERE id = $1
    `;
    await this.db.query(query, [zoneId]);
  }

  private mapToRack(row: any): Rack {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      zoneId: row.zone_id,
      aisleId: row.aisle_id || null,
      code: row.code,
      name: row.name,
      rowPosition: row.row_position,
      columnPosition: row.column_position,
      levels: parseInt(row.levels, 10),
      slotsPerLevel: parseInt(row.slots_per_level, 10),
      maxWeightKg: parseFloat(row.max_weight_kg),
      maxVolumeM3: parseFloat(row.max_volume_m3),
      currentWeightKg: parseFloat(row.current_weight_kg),
      currentVolumeM3: parseFloat(row.current_volume_m3),
      binCount: parseInt(row.bin_count, 10),
      utilization: parseFloat(row.utilization || 0),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
