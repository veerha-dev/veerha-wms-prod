import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PutawayRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: any): Promise<{ data: any[]; total: number }> {
    const { page: rawPage = 1, limit = 50, search, status, priority, warehouseId } = query;
    const page = Math.max(1, rawPage || 1);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['pt.tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;

    if (search) {
      conditions.push(`(pt.putaway_number ILIKE $${idx} OR sk.code ILIKE $${idx} OR sk.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) { conditions.push(`pt.status = $${idx}`); params.push(status); idx++; }
    if (priority) { conditions.push(`pt.priority = $${idx}`); params.push(priority); idx++; }
    if (warehouseId) { conditions.push(`pt.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }

    const where = conditions.join(' AND ');

    const countRes = await this.db.query(
      `SELECT COUNT(*) as count FROM putaway_tasks pt
       LEFT JOIN skus sk ON pt.sku_id = sk.id
       WHERE ${where}`,
      params,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const dataRes = await this.db.query(`
      SELECT pt.*,
             sk.code as sku_code, sk.name as sku_name,
             g.grn_number,
             sb.code as source_bin_code,
             db.code as destination_bin_code,
             sgb.code as suggested_bin_code,
             u.full_name as assignee_full_name, u.email as assignee_email
      FROM putaway_tasks pt
      LEFT JOIN skus sk ON pt.sku_id = sk.id
      LEFT JOIN grn g ON pt.grn_id = g.id
      LEFT JOIN bins sb ON pt.source_bin_id = sb.id
      LEFT JOIN bins db ON pt.destination_bin_id = db.id
      LEFT JOIN bins sgb ON pt.suggested_bin_id = sgb.id
      LEFT JOIN users u ON pt.assigned_to = u.id
      WHERE ${where}
      ORDER BY pt.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, limit, offset]);

    return { data: dataRes.rows.map(r => this.mapRow(r)), total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`
      SELECT pt.*,
             sk.code as sku_code, sk.name as sku_name,
             g.grn_number,
             sb.code as source_bin_code,
             db.code as destination_bin_code,
             sgb.code as suggested_bin_code,
             u.full_name as assignee_full_name, u.email as assignee_email
      FROM putaway_tasks pt
      LEFT JOIN skus sk ON pt.sku_id = sk.id
      LEFT JOIN grn g ON pt.grn_id = g.id
      LEFT JOIN bins sb ON pt.source_bin_id = sb.id
      LEFT JOIN bins db ON pt.destination_bin_id = db.id
      LEFT JOIN bins sgb ON pt.suggested_bin_id = sgb.id
      LEFT JOIN users u ON pt.assigned_to = u.id
      WHERE pt.id = $1 AND pt.tenant_id = $2
    `, [id, tenantId]);
    if (!res.rows[0]) return null;
    return this.mapRow(res.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(`SELECT COUNT(*) as count FROM putaway_tasks WHERE tenant_id = $1`, [tenantId]);
    return parseInt(res.rows[0].count, 10);
  }

  async countByStatus(tenantId: string): Promise<any[]> {
    const res = await this.db.query(
      `SELECT status, COUNT(*) as count FROM putaway_tasks WHERE tenant_id = $1 GROUP BY status`,
      [tenantId],
    );
    return res.rows;
  }

  async getEnhancedStats(tenantId: string, warehouseId?: string): Promise<any> {
    const params: any[] = [tenantId];
    let warehouseFilter = '';
    if (warehouseId) {
      warehouseFilter = ' AND warehouse_id = $2';
      params.push(warehouseId);
    }

    const res = await this.db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= CURRENT_DATE) as completed_today,
        COALESCE(SUM(quantity) FILTER (WHERE status IN ('pending', 'assigned', 'in_progress')), 0) as items_to_putaway
       FROM putaway_tasks
       WHERE tenant_id = $1${warehouseFilter}`,
      params,
    );

    const row = res.rows[0];
    return {
      pending: parseInt(row.pending, 10),
      inProgress: parseInt(row.in_progress, 10),
      completedToday: parseInt(row.completed_today, 10),
      itemsToPutaway: parseInt(row.items_to_putaway, 10),
    };
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const res = await this.db.query(
      `INSERT INTO putaway_tasks (
        tenant_id, putaway_number, grn_id, grn_item_id, sku_id, batch_id,
        quantity, quantity_putaway, warehouse_id, source_zone_id, source_bin_id,
        destination_zone_id, destination_bin_id, suggested_bin_id,
        priority, status, assigned_to, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, 0, $8, $9, $10,
        $11, $12, $13,
        $14, 'pending', $15, $16
      ) RETURNING *`,
      [
        tenantId,
        dto.putawayNumber,
        dto.grnId || null,
        dto.grnItemId || null,
        dto.skuId || null,
        dto.batchId || null,
        dto.quantity || 0,
        dto.warehouseId || null,
        dto.sourceZoneId || null,
        dto.sourceBinId || null,
        dto.destinationZoneId || null,
        dto.destinationBinId || null,
        dto.suggestedBinId || null,
        dto.priority || 'normal',
        dto.assignedTo || null,
        dto.notes || null,
      ],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: string, tenantId: string, dto: any): Promise<any> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      skuId: 'sku_id',
      warehouseId: 'warehouse_id',
      quantity: 'quantity',
      grnId: 'grn_id',
      grnItemId: 'grn_item_id',
      batchId: 'batch_id',
      priority: 'priority',
      notes: 'notes',
      sourceZoneId: 'source_zone_id',
      sourceBinId: 'source_bin_id',
      destinationZoneId: 'destination_zone_id',
      destinationBinId: 'destination_bin_id',
      suggestedBinId: 'suggested_bin_id',
      status: 'status',
      assignedTo: 'assigned_to',
      assignedAt: 'assigned_at',
      startedAt: 'started_at',
      completedAt: 'completed_at',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (dto[key] !== undefined) {
        updates.push(`${col} = $${idx}`);
        params.push(dto[key]);
        idx++;
      }
    }

    if (updates.length === 0) return this.findById(id, tenantId);
    updates.push('updated_at = NOW()');
    params.push(id, tenantId);

    const res = await this.db.query(
      `UPDATE putaway_tasks SET ${updates.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
      params,
    );
    return this.mapRow(res.rows[0]);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM putaway_tasks WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return (res.rowCount ?? 0) > 0;
  }

  async updateStatus(id: string, tenantId: string, status: string, extraFields?: Record<string, any>): Promise<any> {
    const sets = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];
    let idx = 2;

    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) {
        const col = k.replace(/[A-Z]/g, (l: string) => '_' + l.toLowerCase());
        sets.push(`${col} = $${idx}`);
        params.push(v);
        idx++;
      }
    }

    params.push(id, tenantId);
    const res = await this.db.query(
      `UPDATE putaway_tasks SET ${sets.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
      params,
    );
    return this.mapRow(res.rows[0]);
  }

  async suggestBins(warehouseId: string, skuId: string): Promise<any[]> {
    const res = await this.db.query(`
      SELECT
        b.id as bin_id,
        b.code as bin_code,
        b.status as bin_status,
        b.level,
        z.name as zone_name,
        z.type as zone_type,
        r.code as rack_code,
        sk.storage_type as sku_storage_type,
        (
          CASE WHEN z.type = sk.storage_type THEN 10 ELSE 0 END
          + CASE WHEN EXISTS(SELECT 1 FROM stock_levels sl2 WHERE sl2.bin_id = b.id AND sl2.sku_id = $2) THEN 5 ELSE 0 END
          + CASE WHEN b.status = 'empty' THEN 3 ELSE 0 END
          + CASE WHEN EXISTS(SELECT 1 FROM stock_levels sl3 WHERE sl3.bin_id = b.id AND sl3.sku_id != $2) THEN -5 ELSE 0 END
          + GREATEST(0, 3 - COALESCE(b.level, 1))
        ) as score,
        CASE
          WHEN z.type = sk.storage_type THEN 'Zone type matches SKU'
          WHEN b.status = 'empty' THEN 'Empty bin available'
          ELSE 'Available bin'
        END as reason
      FROM bins b
      LEFT JOIN zones z ON b.zone_id = z.id
      LEFT JOIN racks r ON b.rack_id = r.id
      LEFT JOIN skus sk ON sk.id = $2
      WHERE b.warehouse_id = $1
        AND b.is_locked = false
        AND b.status != 'full'
      ORDER BY score DESC, b.code ASC
      LIMIT 5
    `, [warehouseId, skuId]);

    return res.rows.map((r: any) => ({
      binId: r.bin_id,
      binCode: r.bin_code,
      binStatus: r.bin_status,
      level: r.level,
      zoneName: r.zone_name,
      zoneType: r.zone_type,
      rackCode: r.rack_code,
      score: parseInt(r.score, 10),
      reason: r.reason,
    }));
  }

  async completePutaway(id: string, tenantId: string): Promise<any> {
    return this.db.transaction(async (client) => {
      // Get the task
      const taskRes = await client.query(
        `SELECT * FROM putaway_tasks WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
      const task = taskRes.rows[0];
      if (!task) return null;

      // 1. Get next movement number
      const movNumRes = await client.query(
        `SELECT COALESCE(MAX(CAST(REPLACE(movement_number, 'MOV-', '') AS INTEGER)), 0) + 1 as next FROM stock_movements WHERE tenant_id = $1`,
        [tenantId],
      );
      const movNumber = `MOV-${String(movNumRes.rows[0].next).padStart(5, '0')}`;

      // 2. Create stock_movement
      await client.query(
        `INSERT INTO stock_movements (
          tenant_id, movement_number, movement_type, sku_id, batch_id, warehouse_id,
          to_bin_id, quantity, reference_type, reference_id, notes
        ) VALUES ($1, $2, 'putaway', $3, $4, $5, $6, $7, 'putaway_task', $8, 'Putaway completed')`,
        [
          tenantId, movNumber,
          task.sku_id, task.batch_id, task.warehouse_id,
          task.destination_bin_id, task.quantity, task.id,
        ],
      );

      // 3. Check if stock_level exists for this SKU+warehouse+bin
      const existingStock = await client.query(
        `SELECT id FROM stock_levels WHERE sku_id = $1 AND warehouse_id = $2 AND bin_id = $3 AND tenant_id = $4`,
        [task.sku_id, task.warehouse_id, task.destination_bin_id, tenantId],
      );
      if (existingStock.rows.length > 0) {
        await client.query(
          `UPDATE stock_levels SET quantity_available = quantity_available + $1, updated_at = NOW() WHERE id = $2`,
          [task.quantity, existingStock.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO stock_levels (tenant_id, sku_id, warehouse_id, bin_id, quantity_available)
           VALUES ($1, $2, $3, $4, $5)`,
          [tenantId, task.sku_id, task.warehouse_id, task.destination_bin_id, task.quantity],
        );
      }

      // 4. Update task status=completed
      const updatedRes = await client.query(
        `UPDATE putaway_tasks SET status = 'completed', quantity_putaway = quantity, completed_at = NOW(), updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, tenantId],
      );

      return this.mapRow(updatedRes.rows[0]);
    });
  }

  private mapRow(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      putawayNumber: row.putaway_number,
      grnId: row.grn_id,
      grnItemId: row.grn_item_id,
      skuId: row.sku_id,
      batchId: row.batch_id,
      quantity: row.quantity,
      quantityPutaway: row.quantity_putaway,
      warehouseId: row.warehouse_id,
      sourceZoneId: row.source_zone_id,
      sourceBinId: row.source_bin_id,
      destinationZoneId: row.destination_zone_id,
      destinationBinId: row.destination_bin_id,
      suggestedBinId: row.suggested_bin_id,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      assignedAt: row.assigned_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Nested objects from JOINs
      sku: row.sku_code ? { code: row.sku_code, name: row.sku_name } : null,
      grn: row.grn_number ? { grnNumber: row.grn_number } : null,
      sourceBin: row.source_bin_code ? { code: row.source_bin_code } : null,
      destinationBin: row.destination_bin_code ? { code: row.destination_bin_code } : null,
      suggestedBin: row.suggested_bin_code ? { code: row.suggested_bin_code } : null,
      assignee: row.assignee_full_name ? { fullName: row.assignee_full_name, email: row.assignee_email } : null,
    };
  }
}
