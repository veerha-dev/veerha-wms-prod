import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryCycleCountDto } from './dto';

@Injectable()
export class CycleCountsRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryCycleCountDto) {
    const { page = 1, limit = 50, search, status, warehouseId, assignedTo, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['cc.tenant_id = $1'];
    let idx = 2;

    if (search) { conditions.push(`(cc.count_number ILIKE $${idx} OR cc.name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`cc.status = $${idx}`); params.push(status); idx++; }
    if (warehouseId) { conditions.push(`cc.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (assignedTo) { conditions.push(`cc.assigned_to = $${idx}`); params.push(assignedTo); idx++; }

    const where = conditions.join(' AND ');
    const allowedSort = ['count_number', 'name', 'status', 'scheduled_date', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await this.db.query(`SELECT COUNT(*) FROM cycle_counts cc WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT cc.*, w.name as warehouse_name, u.full_name as assignee_name,
              z.name as zone_name, z.code as zone_code,
              r.name as rack_name, r.code as rack_code,
              b.code as bin_code_ref,
              s.code as sku_code_ref, s.name as sku_name_ref,
              (SELECT COUNT(*) FROM cycle_count_items WHERE cycle_count_id = cc.id) as item_count,
              (SELECT COUNT(*) FROM cycle_count_items WHERE cycle_count_id = cc.id AND variance IS NOT NULL AND variance != 0) as variance_count
       FROM cycle_counts cc
       LEFT JOIN warehouses w ON cc.warehouse_id = w.id
       LEFT JOIN users u ON cc.assigned_to = u.id
       LEFT JOIN zones z ON cc.zone_id = z.id
       LEFT JOIN racks r ON cc.rack_id = r.id
       LEFT JOIN bins b ON cc.bin_id = b.id
       LEFT JOIN skus s ON cc.sku_id = s.id
       WHERE ${where} ORDER BY cc.${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT cc.*, w.name as warehouse_name, u.full_name as assignee_name,
              z.name as zone_name, z.code as zone_code,
              r.name as rack_name, r.code as rack_code,
              b.code as bin_code_ref, s.code as sku_code_ref, s.name as sku_name_ref
       FROM cycle_counts cc
       LEFT JOIN warehouses w ON cc.warehouse_id = w.id
       LEFT JOIN users u ON cc.assigned_to = u.id
       LEFT JOIN zones z ON cc.zone_id = z.id
       LEFT JOIN racks r ON cc.rack_id = r.id
       LEFT JOIN bins b ON cc.bin_id = b.id
       LEFT JOIN skus s ON cc.sku_id = s.id
       WHERE cc.id = $1 AND cc.tenant_id = $2`,
      [id, tenantId],
    );
    if (!result.rows[0]) return null;

    const cc = this.mapRow(result.rows[0]);

    // Fetch items
    const items = await this.db.query(
      `SELECT * FROM cycle_count_items WHERE cycle_count_id = $1 ORDER BY sku_code, bin_code`,
      [id],
    );
    cc.items = items.rows.map(this.mapItemRow);
    return cc;
  }

  async getNextCode(tenantId: string): Promise<string> {
    const result = await this.db.query(
      `SELECT count_number FROM cycle_counts WHERE tenant_id = $1 ORDER BY count_number DESC LIMIT 1`,
      [tenantId],
    );
    if (result.rows.length === 0) return 'CC-001';
    const lastNum = parseInt(result.rows[0].count_number.replace('CC-', ''), 10);
    return `CC-${String(lastNum + 1).padStart(3, '0')}`;
  }

  async create(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO cycle_counts (tenant_id, count_number, name, warehouse_id, count_scope, zone_id, rack_id, bin_id, sku_id, assigned_to, scheduled_date, priority, status, instructions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        tenantId, data.countNumber, data.name, data.warehouseId || null,
        data.countScope, data.zoneId || null, data.rackId || null, data.binId || null, data.skuId || null,
        data.assignedTo || null, data.scheduledDate || null, data.priority || 'medium',
        data.assignedTo ? 'assigned' : 'scheduled', data.instructions || null,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async createItems(tenantId: string, cycleCountId: string, items: any[]) {
    if (items.length === 0) return;
    const values: string[] = [];
    const params: any[] = [];
    let idx = 1;
    for (const item of items) {
      values.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6})`);
      params.push(tenantId, cycleCountId, item.skuId, item.skuCode, item.skuName, item.binId || null, item.systemQty || 0);
      idx += 7;
    }
    await this.db.query(
      `INSERT INTO cycle_count_items (tenant_id, cycle_count_id, sku_id, sku_code, sku_name, bin_id, system_qty) VALUES ${values.join(',')}`,
      params,
    );
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;
    const mappings: Record<string, string> = {
      name: 'name', assignedTo: 'assigned_to', scheduledDate: 'scheduled_date',
      priority: 'priority', instructions: 'instructions', status: 'status',
      reviewedBy: 'reviewed_by', reviewedAt: 'reviewed_at', completedAt: 'completed_at',
    };
    for (const [key, col] of Object.entries(mappings)) {
      if (data[key] !== undefined) { fields.push(`${col} = $${idx}`); params.push(data[key]); idx++; }
    }
    if (fields.length === 0) return this.findById(tenantId, id);
    fields.push('updated_at = NOW()');
    const result = await this.db.query(
      `UPDATE cycle_counts SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      params,
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async updateItems(cycleCountId: string, items: { id: string; physicalQty?: number; action?: string; notes?: string }[]) {
    for (const item of items) {
      const fields: string[] = [];
      const params: any[] = [item.id];
      let idx = 2;
      if (item.physicalQty !== undefined) {
        fields.push(`physical_qty = $${idx}`, `counted_at = NOW()`);
        params.push(item.physicalQty);
        idx++;
        // Variance auto-calculated
        fields.push(`variance = $${idx} - system_qty`);
        params.push(item.physicalQty);
        idx++;
        fields.push(`variance_percent = CASE WHEN system_qty > 0 THEN ROUND(($${idx} - system_qty)::numeric / system_qty * 100, 2) ELSE 0 END`);
        params.push(item.physicalQty);
        idx++;
      }
      if (item.action !== undefined) { fields.push(`action = $${idx}`); params.push(item.action); idx++; }
      if (item.notes !== undefined) { fields.push(`notes = $${idx}`); params.push(item.notes); idx++; }
      if (fields.length > 0) {
        await this.db.query(`UPDATE cycle_count_items SET ${fields.join(', ')} WHERE id = $1`, params);
      }
    }
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM cycle_counts WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(tenantId: string, warehouseId?: string) {
    const params: any[] = [tenantId];
    let filter = '';
    if (warehouseId) { filter = ' AND warehouse_id = $2'; params.push(warehouseId); }
    const result = await this.db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status IN ('assigned', 'in_progress')) as in_progress,
        COUNT(*) FILTER (WHERE status IN ('counted', 'under_review')) as pending_review,
        COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= date_trunc('month', CURRENT_DATE)) as completed_this_month
       FROM cycle_counts WHERE tenant_id = $1${filter}`,
      params,
    );
    const row = result.rows[0];
    return {
      scheduled: parseInt(row.scheduled, 10),
      inProgress: parseInt(row.in_progress, 10),
      pendingReview: parseInt(row.pending_review, 10),
      completedThisMonth: parseInt(row.completed_this_month, 10),
    };
  }

  async getStockForScope(tenantId: string, scope: string, warehouseId?: string, zoneId?: string, rackId?: string, binId?: string, skuId?: string) {
    let conditions = ['sl.tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;

    if (scope === 'full_zone' && zoneId) {
      conditions.push(`b.zone_id = $${idx}`); params.push(zoneId); idx++;
    } else if (scope === 'specific_rack' && rackId) {
      conditions.push(`b.rack_id = $${idx}`); params.push(rackId); idx++;
    } else if (scope === 'specific_bin' && binId) {
      conditions.push(`sl.bin_id = $${idx}`); params.push(binId); idx++;
    } else if (scope === 'sku_based' && skuId) {
      conditions.push(`sl.sku_id = $${idx}`); params.push(skuId); idx++;
      if (warehouseId) { conditions.push(`sl.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    }

    const result = await this.db.query(
      `SELECT sl.sku_id, s.code as sku_code, s.name as sku_name,
              sl.bin_id, b.code as bin_code,
              COALESCE(sl.quantity_available, 0) as system_qty
       FROM stock_levels sl
       JOIN skus s ON sl.sku_id = s.id
       LEFT JOIN bins b ON sl.bin_id = b.id
       WHERE ${conditions.join(' AND ')} AND COALESCE(sl.quantity_available, 0) > 0
       ORDER BY s.code, b.code`,
      params,
    );

    return result.rows.map((r: any) => ({
      skuId: r.sku_id,
      skuCode: r.sku_code,
      skuName: r.sku_name,
      binId: r.bin_id,
      binCode: r.bin_code,
      systemQty: parseInt(r.system_qty, 10),
    }));
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      countNumber: row.count_number,
      name: row.name,
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name || null,
      countScope: row.count_scope,
      zoneId: row.zone_id,
      zoneName: row.zone_name || null,
      zoneCode: row.zone_code || null,
      rackId: row.rack_id,
      rackName: row.rack_name || null,
      rackCode: row.rack_code || null,
      binId: row.bin_id,
      binCode: row.bin_code_ref || null,
      skuId: row.sku_id,
      skuCode: row.sku_code_ref || null,
      skuName: row.sku_name_ref || null,
      assignedTo: row.assigned_to,
      assigneeName: row.assignee_name || null,
      scheduledDate: row.scheduled_date,
      priority: row.priority,
      status: row.status,
      instructions: row.instructions,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      completedAt: row.completed_at,
      itemCount: parseInt(row.item_count || 0, 10),
      varianceCount: parseInt(row.variance_count || 0, 10),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: [] as any[],
    };
  }

  private mapItemRow(row: any) {
    return {
      id: row.id,
      cycleCountId: row.cycle_count_id,
      skuId: row.sku_id,
      skuCode: row.sku_code,
      skuName: row.sku_name,
      binId: row.bin_id,
      binCode: row.bin_code,
      systemQty: parseInt(row.system_qty, 10),
      physicalQty: row.physical_qty !== null ? parseInt(row.physical_qty, 10) : null,
      variance: row.variance !== null ? parseInt(row.variance, 10) : null,
      variancePercent: row.variance_percent !== null ? parseFloat(row.variance_percent) : null,
      action: row.action,
      notes: row.notes,
      countedAt: row.counted_at,
    };
  }
}
