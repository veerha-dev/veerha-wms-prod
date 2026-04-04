import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { CreateZoneDto, UpdateZoneDto, QueryZoneDto, BulkCreateZoneDto } from './dto';

export interface Zone {
  id: string;
  tenantId: string;
  warehouseId: string;
  code: string;
  name: string;
  type: string;
  capacityWeight: number;
  capacityVolume: number;
  currentWeight: number;
  currentVolume: number;
  aisleCount: number;
  rackCount: number;
  binCount: number;
  occupiedBins: number;
  utilization: number;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ZonesRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryZoneDto): Promise<{ data: Zone[]; total: number }> {
    const { page = 1, limit = 50, search, warehouseId, type, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    let whereConditions = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let paramIndex = 2;

    if (warehouseId) {
      whereConditions.push(`warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (isActive !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const validSortColumns = ['code', 'name', 'type', 'createdAt', 'updatedAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM zones WHERE ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT 
        id,
        tenant_id,
        warehouse_id,
        code,
        name,
        type,
        capacity_weight,
        capacity_volume,
        current_weight,
        current_volume,
        aisle_count,
        rack_count,
        bin_count,
        occupied_bins,
        CASE 
          WHEN capacity_weight > 0 AND capacity_volume > 0 THEN 
            GREATEST(
              (current_weight / capacity_weight * 100),
              (current_volume / capacity_volume * 100)
            )
          WHEN capacity_weight > 0 THEN (current_weight / capacity_weight * 100)
          WHEN capacity_volume > 0 THEN (current_volume / capacity_volume * 100)
          ELSE 0
        END as utilization,
        is_active,
        is_locked,
        created_at,
        updated_at
      FROM zones
      WHERE ${whereClause}
      ORDER BY ${this.toSnakeCase(sortColumn)} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, params);

    return {
      data: dataResult.rows.map(this.mapToZone),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Zone | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        warehouse_id,
        code,
        name,
        type,
        capacity_weight,
        capacity_volume,
        current_weight,
        current_volume,
        aisle_count,
        rack_count,
        bin_count,
        occupied_bins,
        CASE 
          WHEN capacity_weight > 0 AND capacity_volume > 0 THEN 
            GREATEST(
              (current_weight / capacity_weight * 100),
              (current_volume / capacity_volume * 100)
            )
          WHEN capacity_weight > 0 THEN (current_weight / capacity_weight * 100)
          WHEN capacity_volume > 0 THEN (current_volume / capacity_volume * 100)
          ELSE 0
        END as utilization,
        is_active,
        is_locked,
        created_at,
        updated_at
      FROM zones
      WHERE id = $1 AND tenant_id = $2
    `;

    const result = await this.db.query(query, [id, tenantId]);
    return result.rows.length > 0 ? this.mapToZone(result.rows[0]) : null;
  }

  async findByCode(code: string): Promise<Zone | null> {
    const query = `
      SELECT 
        id,
        tenant_id,
        warehouse_id,
        code,
        name,
        type,
        capacity_weight,
        capacity_volume,
        current_weight,
        current_volume,
        aisle_count,
        rack_count,
        bin_count,
        occupied_bins,
        CASE 
          WHEN capacity_weight > 0 AND capacity_volume > 0 THEN 
            GREATEST(
              (current_weight / capacity_weight * 100),
              (current_volume / capacity_volume * 100)
            )
          WHEN capacity_weight > 0 THEN (current_weight / capacity_weight * 100)
          WHEN capacity_volume > 0 THEN (current_volume / capacity_volume * 100)
          ELSE 0
        END as utilization,
        is_active,
        is_locked,
        created_at,
        updated_at
      FROM zones
      WHERE code = $1
    `;

    const result = await this.db.query(query, [code]);
    return result.rows.length > 0 ? this.mapToZone(result.rows[0]) : null;
  }

  async create(tenantId: string, dto: CreateZoneDto & { code: string }): Promise<Zone> {
    const query = `
      INSERT INTO zones (
        tenant_id, warehouse_id, code, name, type,
        capacity_weight, capacity_volume, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const params = [
      tenantId,
      dto.warehouseId,
      dto.code,
      dto.name,
      dto.type || 'storage',
      dto.capacityWeight || 0,
      dto.capacityVolume || 0,
      dto.isActive !== undefined ? dto.isActive : true,
    ];

    const result = await this.db.query(query, params);
    return this.mapToZone(result.rows[0]);
  }

  async update(id: string, tenantId: string, dto: UpdateZoneDto): Promise<Zone> {
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

    if (dto.type !== undefined) {
      updates.push(`type = $${paramIndex}`);
      params.push(dto.type);
      paramIndex++;
    }

    if (dto.capacityWeight !== undefined) {
      updates.push(`capacity_weight = $${paramIndex}`);
      params.push(dto.capacityWeight);
      paramIndex++;
    }

    if (dto.capacityVolume !== undefined) {
      updates.push(`capacity_volume = $${paramIndex}`);
      params.push(dto.capacityVolume);
      paramIndex++;
    }

    if (dto.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(dto.isActive);
      paramIndex++;
    }

    if (dto.isLocked !== undefined) {
      updates.push(`is_locked = $${paramIndex}`);
      params.push(dto.isLocked);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);

    params.push(id, tenantId);

    const query = `
      UPDATE zones
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, params);
    return this.mapToZone(result.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const query = 'DELETE FROM zones WHERE id = $1 AND tenant_id = $2';
    await this.db.query(query, [id, tenantId]);
  }

  async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM zones';
    const result = await this.db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async bulkCreate(tenantId: string, dto: BulkCreateZoneDto & { code: string }, client: PoolClient): Promise<Zone> {
    // 1. Create zone
    const zoneResult = await client.query(
      `INSERT INTO zones (tenant_id, warehouse_id, code, name, type, capacity_weight, capacity_volume, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        tenantId,
        dto.warehouseId,
        dto.code,
        dto.name,
        dto.type || 'storage',
        dto.capacityWeight || 0,
        dto.capacityVolume || 0,
        dto.isActive !== undefined ? dto.isActive : true,
      ],
    );
    const zoneId = zoneResult.rows[0].id;

    // 2. Create aisles (if any)
    const aisleIdMap: Map<number, string> = new Map();
    if (dto.aisles && dto.aisles.length > 0) {
      for (let i = 0; i < dto.aisles.length; i++) {
        const aisle = dto.aisles[i];
        const aisleResult = await client.query(
          `INSERT INTO aisles (tenant_id, zone_id, code, name, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [tenantId, zoneId, aisle.code, aisle.name, i],
        );
        aisleIdMap.set(i, aisleResult.rows[0].id);
      }
    }

    // 3. Create racks and bins
    let totalRacks = 0;
    let totalBins = 0;

    if (dto.racks && dto.racks.length > 0) {
      for (const rack of dto.racks) {
        const aisleId = rack.aisleIndex !== undefined ? aisleIdMap.get(rack.aisleIndex) || null : null;

        const rackResult = await client.query(
          `INSERT INTO racks (tenant_id, zone_id, aisle_id, code, name, levels, slots_per_level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            tenantId,
            zoneId,
            aisleId,
            rack.code,
            rack.name,
            rack.levels || 1,
            rack.positionsPerLevel || 1,
          ],
        );
        const rackId = rackResult.rows[0].id;
        totalRacks++;

        // 4. Generate bins for this rack
        const levels = rack.levels || 0;
        const positions = rack.positionsPerLevel || 0;

        if (levels > 0 && positions > 0) {
          const binValues: string[] = [];
          const binParams: any[] = [];
          let binParamIdx = 1;

          for (let level = 1; level <= levels; level++) {
            for (let pos = 1; pos <= positions; pos++) {
              const binCode = `${rack.code}-L${level}P${pos}`;
              binValues.push(
                `($${binParamIdx}, $${binParamIdx + 1}, $${binParamIdx + 2}, $${binParamIdx + 3}, $${binParamIdx + 4}, $${binParamIdx + 5}, $${binParamIdx + 6})`,
              );
              binParams.push(tenantId, rackId, zoneId, dto.warehouseId, binCode, level, pos);
              binParamIdx += 7;
              totalBins++;
            }
          }

          if (binValues.length > 0) {
            await client.query(
              `INSERT INTO bins (tenant_id, rack_id, zone_id, warehouse_id, code, level, position)
               VALUES ${binValues.join(', ')}`,
              binParams,
            );
          }

          // Update rack bin_count
          await client.query(
            `UPDATE racks SET bin_count = $1 WHERE id = $2`,
            [levels * positions, rackId],
          );
        }
      }
    }

    // 5. Update aisle rack_counts
    for (const [index, aisleId] of aisleIdMap.entries()) {
      await client.query(
        `UPDATE aisles SET rack_count = (SELECT COUNT(*) FROM racks WHERE aisle_id = $1) WHERE id = $1`,
        [aisleId],
      );
    }

    // 6. Update zone counters
    await client.query(
      `UPDATE zones SET aisle_count = $1, rack_count = $2, bin_count = $3 WHERE id = $4`,
      [aisleIdMap.size, totalRacks, totalBins, zoneId],
    );

    // 7. Return the created zone
    const finalResult = await client.query(
      `SELECT id, tenant_id, warehouse_id, code, name, type,
              capacity_weight, capacity_volume, current_weight, current_volume,
              aisle_count, rack_count, bin_count, occupied_bins,
              0 as utilization, is_active, is_locked, created_at, updated_at
       FROM zones WHERE id = $1`,
      [zoneId],
    );

    return this.mapToZone(finalResult.rows[0]);
  }

  private mapToZone(row: any): Zone {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      warehouseId: row.warehouse_id,
      code: row.code,
      name: row.name,
      type: row.type,
      capacityWeight: parseFloat(row.capacity_weight),
      capacityVolume: parseFloat(row.capacity_volume),
      currentWeight: parseFloat(row.current_weight),
      currentVolume: parseFloat(row.current_volume),
      aisleCount: parseInt(row.aisle_count || 0, 10),
      rackCount: parseInt(row.rack_count, 10),
      binCount: parseInt(row.bin_count, 10),
      occupiedBins: parseInt(row.occupied_bins, 10),
      utilization: parseFloat(row.utilization || 0),
      isActive: row.is_active,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
