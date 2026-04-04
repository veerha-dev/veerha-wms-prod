import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryInventoryDto, QueryMovementsDto } from './dto';

@Injectable()
export class InventoryRepository {
  constructor(private db: DatabaseService) {}

  // ─── Stock Levels ───────────────────────────────────────────

  async findAllStockLevels(tenantId: string, query: QueryInventoryDto) {
    const { page = 1, limit = 5000, search, skuId, warehouseId, binId, batchId, sortBy = 'sl.created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['sl.tenant_id = $1'];
    let idx = 2;

    if (search) {
      conditions.push(`(s.code ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (skuId) { conditions.push(`sl.sku_id = $${idx}`); params.push(skuId); idx++; }
    if (warehouseId) { conditions.push(`sl.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (binId) { conditions.push(`sl.bin_id = $${idx}`); params.push(binId); idx++; }
    if (batchId) { conditions.push(`sl.batch_id = $${idx}`); params.push(batchId); idx++; }

    const where = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM stock_levels sl
       LEFT JOIN skus s ON s.id = sl.sku_id
       WHERE ${where}`, params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT sl.*,
              s.code as sku_code, s.name as sku_name, s.min_stock, s.max_stock,
              w.name as warehouse_name,
              bn.code as bin_code,
              z.name as zone_name, z.id as zone_id,
              bat.batch_number
       FROM stock_levels sl
       LEFT JOIN skus s ON s.id = sl.sku_id
       LEFT JOIN warehouses w ON w.id = sl.warehouse_id
       LEFT JOIN bins bn ON bn.id = sl.bin_id
       LEFT JOIN zones z ON z.id = bn.zone_id
       LEFT JOIN batches bat ON bat.id = sl.batch_id
       WHERE ${where}
       ORDER BY sl.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapStockLevel), total };
  }

  async findStockLevelById(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT sl.*,
              s.code as sku_code, s.name as sku_name, s.min_stock, s.max_stock,
              w.name as warehouse_name,
              bn.code as bin_code,
              z.name as zone_name, z.id as zone_id,
              bat.batch_number
       FROM stock_levels sl
       LEFT JOIN skus s ON s.id = sl.sku_id
       LEFT JOIN warehouses w ON w.id = sl.warehouse_id
       LEFT JOIN bins bn ON bn.id = sl.bin_id
       LEFT JOIN zones z ON z.id = bn.zone_id
       LEFT JOIN batches bat ON bat.id = sl.batch_id
       WHERE sl.id = $1 AND sl.tenant_id = $2`, [id, tenantId],
    );
    return result.rows[0] ? this.mapStockLevel(result.rows[0]) : null;
  }

  async createStockLevel(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO stock_levels (tenant_id, sku_id, warehouse_id, bin_id, batch_id, quantity_available, quantity_reserved, quantity_in_transit, quantity_damaged)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [tenantId, data.skuId, data.warehouseId, data.binId || null, data.batchId || null,
       data.quantityAvailable || 0, data.quantityReserved || 0, data.quantityInTransit || 0, data.quantityDamaged || 0],
    );
    return this.findStockLevelById(tenantId, result.rows[0].id);
  }

  async updateStockLevel(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;

    const mappings: Record<string, string> = {
      quantityAvailable: 'quantity_available',
      quantityReserved: 'quantity_reserved',
      quantityInTransit: 'quantity_in_transit',
      quantityDamaged: 'quantity_damaged',
    };

    for (const [key, col] of Object.entries(mappings)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }
    if (fields.length === 0) return this.findStockLevelById(tenantId, id);

    fields.push('last_updated = NOW()');
    await this.db.query(`UPDATE stock_levels SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2`, params);
    return this.findStockLevelById(tenantId, id);
  }

  async deleteStockLevel(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM stock_levels WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Low Stock ──────────────────────────────────────────────

  async findLowStock(tenantId: string) {
    const result = await this.db.query(
      `SELECT sl.*,
              s.code as sku_code, s.name as sku_name, s.min_stock, s.max_stock, s.reorder_point,
              w.name as warehouse_name,
              bn.code as bin_code,
              z.name as zone_name, z.id as zone_id
       FROM stock_levels sl
       JOIN skus s ON s.id = sl.sku_id
       LEFT JOIN warehouses w ON w.id = sl.warehouse_id
       LEFT JOIN bins bn ON bn.id = sl.bin_id
       LEFT JOIN zones z ON z.id = bn.zone_id
       WHERE sl.tenant_id = $1 AND sl.quantity_available <= s.reorder_point AND s.reorder_point > 0
       ORDER BY sl.quantity_available ASC`, [tenantId],
    );
    return result.rows.map(this.mapStockLevel);
  }

  // ─── Expiring Batches ──────────────────────────────────────

  async findExpiring(tenantId: string) {
    const result = await this.db.query(
      `SELECT b.*, s.code as sku_code, s.name as sku_name
       FROM batches b
       JOIN skus s ON s.id = b.sku_id
       WHERE b.tenant_id = $1 AND b.expiry_date IS NOT NULL AND b.expiry_date <= NOW() + INTERVAL '30 days' AND b.status = 'active'
       ORDER BY b.expiry_date ASC`, [tenantId],
    );
    return result.rows.map(row => ({
      id: row.id, skuId: row.sku_id, skuCode: row.sku_code, skuName: row.sku_name,
      batchNumber: row.batch_number, expiryDate: row.expiry_date, quantity: row.quantity, status: row.status,
    }));
  }

  // ─── Stock Movements ───────────────────────────────────────

  async findAllMovements(tenantId: string, query: QueryMovementsDto) {
    const { page = 1, limit = 50, search, skuId, warehouseId, movementType, sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['sm.tenant_id = $1'];
    let idx = 2;

    if (search) {
      conditions.push(`(sm.movement_number ILIKE $${idx} OR s.code ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (skuId) { conditions.push(`sm.sku_id = $${idx}`); params.push(skuId); idx++; }
    if (warehouseId) { conditions.push(`sm.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (movementType) { conditions.push(`sm.movement_type = $${idx}`); params.push(movementType); idx++; }

    const where = conditions.join(' AND ');
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM stock_movements sm LEFT JOIN skus s ON s.id = sm.sku_id WHERE ${where}`, params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT sm.*,
              s.code as sku_code, s.name as sku_name,
              w.name as warehouse_name,
              fb.code as from_bin_code, tb.code as to_bin_code,
              bat.batch_number
       FROM stock_movements sm
       LEFT JOIN skus s ON s.id = sm.sku_id
       LEFT JOIN warehouses w ON w.id = sm.warehouse_id
       LEFT JOIN bins fb ON fb.id = sm.from_bin_id
       LEFT JOIN bins tb ON tb.id = sm.to_bin_id
       LEFT JOIN batches bat ON bat.id = sm.batch_id
       WHERE ${where}
       ORDER BY sm.created_at ${safeOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapMovement), total };
  }

  async getNextMovementNumber(tenantId: string): Promise<string> {
    const result = await this.db.query(
      `SELECT movement_number FROM stock_movements WHERE tenant_id = $1 AND movement_number LIKE 'MOV-%' ORDER BY movement_number DESC LIMIT 1`,
      [tenantId],
    );
    if (result.rows.length === 0) return 'MOV-00001';
    const lastNum = parseInt(result.rows[0].movement_number.replace('MOV-', ''), 10);
    return `MOV-${String(lastNum + 1).padStart(5, '0')}`;
  }

  async createMovement(tenantId: string, data: any) {
    const movementNumber = await this.getNextMovementNumber(tenantId);
    const result = await this.db.query(
      `INSERT INTO stock_movements (tenant_id, movement_number, movement_type, sku_id, batch_id, warehouse_id, from_bin_id, to_bin_id, quantity, reference_type, reference_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [tenantId, movementNumber, data.movementType, data.skuId, data.batchId || null, data.warehouseId || null,
       data.fromBinId || null, data.toBinId || null, data.quantity, data.referenceType || 'manual', data.referenceId || null, data.notes || null],
    );
    return this.mapMovement(result.rows[0]);
  }

  // ─── Transactional: Find stock at specific bin ─────────────

  async findStockAtBin(tenantId: string, skuId: string, binId: string, batchId?: string) {
    let query = 'SELECT * FROM stock_levels WHERE tenant_id = $1 AND sku_id = $2 AND bin_id = $3';
    const params: any[] = [tenantId, skuId, binId];
    if (batchId) {
      query += ' AND batch_id = $4';
      params.push(batchId);
    } else {
      query += ' AND batch_id IS NULL';
    }
    const result = await this.db.query(query, params);
    return result.rows[0] || null;
  }

  // ─── Mappers ───────────────────────────────────────────────

  private mapStockLevel(row: any) {
    const qtyAvailable = row.quantity_available || 0;
    const qtyReserved = row.quantity_reserved || 0;
    const qtyInTransit = row.quantity_in_transit || 0;
    const qtyDamaged = row.quantity_damaged || 0;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      skuId: row.sku_id,
      skuCode: row.sku_code || null,
      skuName: row.sku_name || null,
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name || null,
      zoneId: row.zone_id || null,
      zoneName: row.zone_name || null,
      binId: row.bin_id || null,
      binCode: row.bin_code || null,
      batchId: row.batch_id || null,
      batchNumber: row.batch_number || null,
      quantityAvailable: qtyAvailable,
      quantityReserved: qtyReserved,
      quantityInTransit: qtyInTransit,
      quantityDamaged: qtyDamaged,
      totalQuantity: qtyAvailable + qtyReserved + qtyInTransit + qtyDamaged,
      minStock: row.min_stock || 0,
      maxStock: row.max_stock || 0,
      lastUpdated: row.last_updated,
      lastCountedAt: row.last_counted_at,
      createdAt: row.created_at,
    };
  }

  private mapMovement(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      movementNumber: row.movement_number,
      type: row.movement_type,
      movementType: row.movement_type,
      skuId: row.sku_id,
      skuCode: row.sku_code || null,
      skuName: row.sku_name || null,
      batchId: row.batch_id || null,
      batchNumber: row.batch_number || null,
      warehouseId: row.warehouse_id || null,
      warehouseName: row.warehouse_name || null,
      fromBinId: row.from_bin_id || null,
      fromBinCode: row.from_bin_code || null,
      toBinId: row.to_bin_id || null,
      toBinCode: row.to_bin_code || null,
      quantity: row.quantity,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      timestamp: row.created_at,
    };
  }
}
