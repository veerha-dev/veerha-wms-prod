import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QuerySerialDto } from './dto';

export interface SerialNumber {
  id: string;
  tenantId: string;
  serialNumber: string;
  skuId: string;
  skuCode?: string;
  skuName?: string;
  batchId?: string;
  status: string;
  warehouseId?: string;
  warehouseName?: string;
  zoneId?: string;
  binId?: string;
  binCode?: string;
  grnId?: string;
  grnNumber?: string;
  poId?: string;
  supplierId?: string;
  soId?: string;
  pickListId?: string;
  shipmentId?: string;
  customerId?: string;
  customerName?: string;
  receivedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SerialsRepository {
  constructor(private db: DatabaseService) {}

  private readonly selectFields = `
    sn.*, sk.code as sku_code, sk.name as sku_name,
    w.name as warehouse_name, b.code as bin_code,
    g.grn_number, c.name as customer_name
  `;

  private readonly joinClause = `
    FROM serial_numbers sn
    LEFT JOIN skus sk ON sn.sku_id = sk.id
    LEFT JOIN warehouses w ON sn.warehouse_id = w.id
    LEFT JOIN bins b ON sn.bin_id = b.id
    LEFT JOIN grn g ON sn.grn_id = g.id
    LEFT JOIN customers c ON sn.customer_id = c.id
  `;

  async findAll(tenantId: string, query: QuerySerialDto) {
    const { page = 1, limit = 50, search, skuId, status, warehouseId, binId, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['sn.tenant_id = $1'];
    let idx = 2;

    if (search) { conditions.push(`(sn.serial_number ILIKE $${idx} OR sk.code ILIKE $${idx} OR sk.name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (skuId) { conditions.push(`sn.sku_id = $${idx}`); params.push(skuId); idx++; }
    if (status) { conditions.push(`sn.status = $${idx}`); params.push(status); idx++; }
    if (warehouseId) { conditions.push(`sn.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (binId) { conditions.push(`sn.bin_id = $${idx}`); params.push(binId); idx++; }

    const where = conditions.join(' AND ');
    const allowedSort = ['serial_number', 'status', 'created_at', 'received_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await this.db.query(`SELECT COUNT(*) ${this.joinClause} WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT ${this.selectFields} ${this.joinClause} WHERE ${where} ORDER BY sn.${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string): Promise<SerialNumber | null> {
    const result = await this.db.query(
      `SELECT ${this.selectFields} ${this.joinClause} WHERE sn.id = $1 AND sn.tenant_id = $2`,
      [id, tenantId],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findBySkuAndBin(tenantId: string, skuId: string, binId: string) {
    const result = await this.db.query(
      `SELECT ${this.selectFields} ${this.joinClause} WHERE sn.tenant_id = $1 AND sn.sku_id = $2 AND sn.bin_id = $3 AND sn.status = 'in_stock' ORDER BY sn.serial_number`,
      [tenantId, skuId, binId],
    );
    return result.rows.map(this.mapRow);
  }

  async findBySku(tenantId: string, skuId: string) {
    const result = await this.db.query(
      `SELECT ${this.selectFields} ${this.joinClause} WHERE sn.tenant_id = $1 AND sn.sku_id = $2 ORDER BY sn.serial_number`,
      [tenantId, skuId],
    );
    return result.rows.map(this.mapRow);
  }

  async bulkCreate(tenantId: string, serials: any[]): Promise<SerialNumber[]> {
    if (serials.length === 0) return [];

    const values: string[] = [];
    const params: any[] = [];
    let idx = 1;

    for (const s of serials) {
      values.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7},$${idx+8},$${idx+9},$${idx+10})`);
      params.push(
        tenantId, s.serialNumber, s.skuId, s.batchId || null,
        s.status || 'in_stock', s.warehouseId || null,
        s.grnId || null, s.grnItemId || null,
        s.poId || null, s.supplierId || null,
        s.receivedAt || new Date(),
      );
      idx += 11;
    }

    const result = await this.db.query(
      `INSERT INTO serial_numbers (tenant_id, serial_number, sku_id, batch_id, status, warehouse_id, grn_id, grn_item_id, po_id, supplier_id, received_at)
       VALUES ${values.join(',')} RETURNING *`,
      params,
    );

    return result.rows.map(this.mapRow);
  }

  async updateStatus(tenantId: string, id: string, status: string, extra?: Record<string, any>) {
    const fields = ['status = $3', 'updated_at = NOW()'];
    const params: any[] = [id, tenantId, status];
    let idx = 4;

    const mappings: Record<string, string> = {
      soId: 'so_id', pickListId: 'pick_list_id', shipmentId: 'shipment_id',
      customerId: 'customer_id', binId: 'bin_id', zoneId: 'zone_id',
      warehouseId: 'warehouse_id', shippedAt: 'shipped_at', deliveredAt: 'delivered_at',
    };

    if (extra) {
      for (const [key, col] of Object.entries(mappings)) {
        if (extra[key] !== undefined) {
          fields.push(`${col} = $${idx}`);
          params.push(extra[key]);
          idx++;
        }
      }
    }

    const result = await this.db.query(
      `UPDATE serial_numbers SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async bulkUpdateStatus(tenantId: string, ids: string[], status: string, extra?: Record<string, any>) {
    if (ids.length === 0) return [];

    const fields = ['status = $2', 'updated_at = NOW()'];
    const params: any[] = [tenantId, status];
    let idx = 3;

    const mappings: Record<string, string> = {
      soId: 'so_id', pickListId: 'pick_list_id', customerId: 'customer_id',
    };

    if (extra) {
      for (const [key, col] of Object.entries(mappings)) {
        if (extra[key] !== undefined) {
          fields.push(`${col} = $${idx}`);
          params.push(extra[key]);
          idx++;
        }
      }
    }

    const placeholders = ids.map((_, i) => `$${idx + i}`).join(',');
    params.push(...ids);

    const result = await this.db.query(
      `UPDATE serial_numbers SET ${fields.join(', ')} WHERE tenant_id = $1 AND id IN (${placeholders}) RETURNING *`,
      params,
    );
    return result.rows.map(this.mapRow);
  }

  async getTimeline(tenantId: string, serialId: string) {
    const result = await this.db.query(
      `SELECT sm.*, u.full_name as performed_by_name
       FROM serial_movements sm
       LEFT JOIN users u ON sm.performed_by = u.id
       WHERE sm.serial_number_id = $1 AND sm.tenant_id = $2
       ORDER BY sm.created_at ASC`,
      [serialId, tenantId],
    );
    return result.rows.map((r: any) => ({
      id: r.id,
      serialNumberId: r.serial_number_id,
      movementType: r.movement_type,
      fromLocation: r.from_location,
      toLocation: r.to_location,
      referenceType: r.reference_type,
      referenceId: r.reference_id,
      performedBy: r.performed_by,
      performedByName: r.performed_by_name,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  async addMovement(tenantId: string, data: any) {
    await this.db.query(
      `INSERT INTO serial_movements (tenant_id, serial_number_id, movement_type, from_location, to_location, reference_type, reference_id, performed_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        tenantId, data.serialNumberId, data.movementType,
        data.fromLocation || null, data.toLocation || null,
        data.referenceType || null, data.referenceId || null,
        data.performedBy || null, data.notes || null,
      ],
    );
  }

  async bulkAddMovements(tenantId: string, movements: any[]) {
    if (movements.length === 0) return;
    const values: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const m of movements) {
      values.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7},$${idx+8})`);
      params.push(tenantId, m.serialNumberId, m.movementType, m.fromLocation || null, m.toLocation || null, m.referenceType || null, m.referenceId || null, m.performedBy || null, m.notes || null);
      idx += 9;
    }
    await this.db.query(
      `INSERT INTO serial_movements (tenant_id, serial_number_id, movement_type, from_location, to_location, reference_type, reference_id, performed_by, notes) VALUES ${values.join(',')}`,
      params,
    );
  }

  async countByStatus(tenantId: string, warehouseId?: string) {
    const params: any[] = [tenantId];
    let filter = '';
    if (warehouseId) { filter = ' AND warehouse_id = $2'; params.push(warehouseId); }

    const result = await this.db.query(
      `SELECT status, COUNT(*) as count FROM serial_numbers WHERE tenant_id = $1${filter} GROUP BY status`,
      params,
    );
    const stats: Record<string, number> = { in_stock: 0, picked: 0, shipped: 0, delivered: 0, returned: 0, damaged: 0 };
    result.rows.forEach((r: any) => { stats[r.status] = parseInt(r.count, 10); });
    return { ...stats, total: Object.values(stats).reduce((a, b) => a + b, 0) };
  }

  private mapRow(row: any): SerialNumber {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      serialNumber: row.serial_number,
      skuId: row.sku_id,
      skuCode: row.sku_code || null,
      skuName: row.sku_name || null,
      batchId: row.batch_id || null,
      status: row.status,
      warehouseId: row.warehouse_id || null,
      warehouseName: row.warehouse_name || null,
      zoneId: row.zone_id || null,
      binId: row.bin_id || null,
      binCode: row.bin_code || null,
      grnId: row.grn_id || null,
      grnNumber: row.grn_number || null,
      poId: row.po_id || null,
      supplierId: row.supplier_id || null,
      soId: row.so_id || null,
      pickListId: row.pick_list_id || null,
      shipmentId: row.shipment_id || null,
      customerId: row.customer_id || null,
      customerName: row.customer_name || null,
      receivedAt: row.received_at,
      shippedAt: row.shipped_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
