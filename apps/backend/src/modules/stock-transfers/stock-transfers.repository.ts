import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryStockTransferDto } from './dto';

@Injectable()
export class StockTransfersRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryStockTransferDto) {
    const { page = 1, limit = 50, search, status, transferType, warehouseId, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conds: string[] = ['t.tenant_id = $1'];
    let idx = 2;

    if (search) { conds.push(`(t.transfer_number ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conds.push(`t.status = $${idx}`); params.push(status); idx++; }
    if (transferType) { conds.push(`t.transfer_type = $${idx}`); params.push(transferType); idx++; }
    if (warehouseId) { conds.push(`(t.source_warehouse_id = $${idx} OR t.dest_warehouse_id = $${idx})`); params.push(warehouseId); idx++; }

    const where = conds.join(' AND ');
    const allowedSort = ['transfer_number', 'status', 'quantity', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countRes = await this.db.query(`SELECT COUNT(*) FROM stock_transfers t WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await this.db.query(
      `SELECT t.*,
              sw.name as source_warehouse_name, dw.name as dest_warehouse_name,
              sz.name as source_zone_name, dz.name as dest_zone_name,
              sb.code as source_bin_code, db.code as dest_bin_code,
              s.code as sku_code, s.name as sku_name,
              ru.full_name as requested_by_name, au.full_name as assigned_to_name
       FROM stock_transfers t
       LEFT JOIN warehouses sw ON t.source_warehouse_id = sw.id
       LEFT JOIN warehouses dw ON t.dest_warehouse_id = dw.id
       LEFT JOIN zones sz ON t.source_zone_id = sz.id
       LEFT JOIN zones dz ON t.dest_zone_id = dz.id
       LEFT JOIN bins sb ON t.source_bin_id = sb.id
       LEFT JOIN bins db ON t.dest_bin_id = db.id
       LEFT JOIN skus s ON t.sku_id = s.id
       LEFT JOIN users ru ON t.requested_by = ru.id
       LEFT JOIN users au ON t.assigned_to = au.id
       WHERE ${where} ORDER BY t.${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataRes.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT t.*,
              sw.name as source_warehouse_name, dw.name as dest_warehouse_name,
              sz.name as source_zone_name, dz.name as dest_zone_name,
              sb.code as source_bin_code, db.code as dest_bin_code,
              s.code as sku_code, s.name as sku_name,
              ru.full_name as requested_by_name, au.full_name as assigned_to_name
       FROM stock_transfers t
       LEFT JOIN warehouses sw ON t.source_warehouse_id = sw.id
       LEFT JOIN warehouses dw ON t.dest_warehouse_id = dw.id
       LEFT JOIN zones sz ON t.source_zone_id = sz.id
       LEFT JOIN zones dz ON t.dest_zone_id = dz.id
       LEFT JOIN bins sb ON t.source_bin_id = sb.id
       LEFT JOIN bins db ON t.dest_bin_id = db.id
       LEFT JOIN skus s ON t.sku_id = s.id
       LEFT JOIN users ru ON t.requested_by = ru.id
       LEFT JOIN users au ON t.assigned_to = au.id
       WHERE t.id = $1 AND t.tenant_id = $2`,
      [id, tenantId],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async getNextCode(tenantId: string): Promise<string> {
    const result = await this.db.query(
      `SELECT transfer_number FROM stock_transfers WHERE tenant_id = $1 ORDER BY transfer_number DESC LIMIT 1`,
      [tenantId],
    );
    if (result.rows.length === 0) return 'TRF-001';
    const lastNum = parseInt(result.rows[0].transfer_number.replace('TRF-', ''), 10);
    return `TRF-${String(lastNum + 1).padStart(3, '0')}`;
  }

  async create(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO stock_transfers (
        tenant_id, transfer_number, transfer_type,
        source_warehouse_id, source_zone_id, source_rack_id, source_bin_id,
        dest_warehouse_id, dest_zone_id, dest_rack_id, dest_bin_id,
        sku_id, quantity, reason, priority, status, requested_by, assigned_to, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
      [
        tenantId, data.transferNumber, data.transferType,
        data.sourceWarehouseId || null, data.sourceZoneId || null, data.sourceRackId || null, data.sourceBinId || null,
        data.destWarehouseId || null, data.destZoneId || null, data.destRackId || null, data.destBinId || null,
        data.skuId || null, data.quantity, data.reason || null, data.priority || 'medium',
        'requested', data.requestedBy || null, data.assignedTo || null, data.notes || null,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;
    const mappings: Record<string, string> = {
      assignedTo: 'assigned_to', priority: 'priority', reason: 'reason',
      notes: 'notes', status: 'status', approvedBy: 'approved_by',
      approvedAt: 'approved_at', completedAt: 'completed_at',
    };
    for (const [key, col] of Object.entries(mappings)) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx}`); params.push(data[key]); idx++; }
    }
    if (fields.length === 0) return this.findById(tenantId, id);
    fields.push('updated_at = NOW()');
    const result = await this.db.query(
      `UPDATE stock_transfers SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM stock_transfers WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(tenantId: string, warehouseId?: string) {
    const params: any[] = [tenantId];
    let filter = '';
    if (warehouseId) { filter = ' AND (source_warehouse_id = $2 OR dest_warehouse_id = $2)'; params.push(warehouseId); }
    const result = await this.db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('requested','approved')) as pending,
        COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
        COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= CURRENT_DATE) as completed_today
       FROM stock_transfers WHERE tenant_id = $1${filter}`,
      params,
    );
    const row = result.rows[0];
    return {
      pending: parseInt(row.pending, 10),
      inTransit: parseInt(row.in_transit, 10),
      completedToday: parseInt(row.completed_today, 10),
    };
  }

  private mapRow(row: any) {
    return {
      id: row.id, tenantId: row.tenant_id,
      transferNumber: row.transfer_number, transferType: row.transfer_type,
      sourceWarehouseId: row.source_warehouse_id, sourceWarehouseName: row.source_warehouse_name || null,
      sourceZoneId: row.source_zone_id, sourceZoneName: row.source_zone_name || null,
      sourceRackId: row.source_rack_id, sourceBinId: row.source_bin_id, sourceBinCode: row.source_bin_code || null,
      destWarehouseId: row.dest_warehouse_id, destWarehouseName: row.dest_warehouse_name || null,
      destZoneId: row.dest_zone_id, destZoneName: row.dest_zone_name || null,
      destRackId: row.dest_rack_id, destBinId: row.dest_bin_id, destBinCode: row.dest_bin_code || null,
      skuId: row.sku_id, skuCode: row.sku_code || null, skuName: row.sku_name || null,
      quantity: parseInt(row.quantity, 10), reason: row.reason, priority: row.priority, status: row.status,
      requestedBy: row.requested_by, requestedByName: row.requested_by_name || null,
      assignedTo: row.assigned_to, assignedToName: row.assigned_to_name || null,
      approvedBy: row.approved_by, approvedAt: row.approved_at,
      completedAt: row.completed_at, notes: row.notes,
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  }
}
