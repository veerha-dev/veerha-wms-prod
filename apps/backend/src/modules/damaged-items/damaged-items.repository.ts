import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryDamagedItemDto } from './dto';

@Injectable()
export class DamagedItemsRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryDamagedItemDto) {
    const { page = 1, limit = 50, search, skuId, warehouseId, disposition, damageType, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['di.tenant_id = $1'];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(di.sku_code ILIKE $${paramIndex} OR di.sku_name ILIKE $${paramIndex} OR di.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (skuId) {
      conditions.push(`di.sku_id = $${paramIndex}`);
      params.push(skuId);
      paramIndex++;
    }
    if (warehouseId) {
      conditions.push(`di.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (disposition) {
      conditions.push(`di.disposition = $${paramIndex}`);
      params.push(disposition);
      paramIndex++;
    }
    if (damageType) {
      conditions.push(`di.damage_type = $${paramIndex}`);
      params.push(damageType);
      paramIndex++;
    }

    const allowedSort = ['created_at', 'damage_type', 'disposition', 'quantity'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');

    const countResult = await this.db.query(`SELECT COUNT(*) FROM damaged_items di WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT di.*, s.name as sku_name, s.code as sku_code, w.name as warehouse_name, b.code as bin_code
       FROM damaged_items di
       LEFT JOIN skus s ON di.sku_id = s.id
       LEFT JOIN warehouses w ON di.warehouse_id = w.id
       LEFT JOIN bins b ON di.location_id = b.id
       WHERE ${where} 
       ORDER BY di.${safeSort} ${safeOrder} 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows, total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT di.*, s.name as sku_name, s.code as sku_code, w.name as warehouse_name, b.code as bin_code
       FROM damaged_items di
       LEFT JOIN skus s ON di.sku_id = s.id
       LEFT JOIN warehouses w ON di.warehouse_id = w.id
       LEFT JOIN bins b ON di.location_id = b.id
       WHERE di.id = $1 AND di.tenant_id = $2`,
      [id, tenantId],
    );
    return result.rows[0] || null;
  }

  async create(tenantId: string, data: any) {
    // Get batch number if batchId is provided
    let batchNumber = null;
    if (data.batchId) {
      const batchResult = await this.db.query('SELECT batch_number FROM batches WHERE id = $1', [data.batchId]);
      if (batchResult.rows.length > 0) {
        batchNumber = batchResult.rows[0].batch_number;
      }
    }

    const result = await this.db.query(
      `INSERT INTO damaged_items (tenant_id, sku_id, sku_code, sku_name, batch_id, batch_number, quantity, damage_type, description, photos, location_id, location, warehouse_id, disposition, reported_by, reported_by_role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        tenantId, data.skuId, data.skuCode, data.skuName, data.batchId || null, batchNumber,
        data.quantity, data.damageType, data.description, data.photos || null,
        data.locationId || null, data.location, data.warehouseId || null,
        data.disposition || 'pending', data.reportedBy,
        data.reportedByRole || 'operator',
      ],
    );
    return result.rows[0];
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;

    const mappings: Record<string, string> = {
      quantity: 'quantity',
      damageType: 'damage_type',
      description: 'description',
      photos: 'photos',
      disposition: 'disposition',
      decidedBy: 'decided_by',
      decidedAt: 'decided_at',
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
      `UPDATE damaged_items SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] || null;
  }

  async dispose(tenantId: string, id: string, disposedBy: string | null) {
    const result = await this.db.query(
      `UPDATE damaged_items 
       SET disposition = 'disposed', decided_by = $3, decided_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2 
       RETURNING *`,
      [id, tenantId, disposedBy],
    );
    return result.rows[0] || null;
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM damaged_items WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }
}
