import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TasksRepository {
  constructor(private db: DatabaseService) {}

  private mapRow(row: any) {
    if (!row) return null;
    const meta = row.metadata || {};
    return {
      id: row.id,
      tenantId: row.tenant_id,
      taskNumber: row.task_number,
      task_number: row.task_number,
      title: row.title,
      description: row.description,
      instructions: row.description,
      type: row.task_type,
      task_type: row.task_type,
      taskType: row.task_type,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      assigned_to: row.assigned_to,
      assignedToId: row.assigned_to,
      createdBy: row.created_by,
      quantity: meta.quantity != null ? meta.quantity : null,
      notes: meta.notes || null,
      dueDate: row.due_date,
      due_at: row.due_date,
      sla_breached: row.due_date && !['completed', 'cancelled'].includes(row.status) && new Date(row.due_date) < new Date(),
      startedAt: row.started_at,
      started_at: row.started_at,
      completedAt: row.completed_at,
      completed_at: row.completed_at,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      updated_at: row.updated_at,
      warehouse_id: row.warehouse_id || null,
      // Extended metadata fields
      linkedSoId: meta.linkedSoId || null,
      linkedGrnId: meta.linkedGrnId || null,
      sourceBinId: meta.sourceBinId || null,
      destinationBinId: meta.destinationBinId || null,
      zoneId: meta.zoneId || null,
      rackId: meta.rackId || null,
      binId: meta.binId || null,
      skuId: meta.skuId || null,
      countScope: meta.countScope || null,
      sourceLocation: meta.sourceLocation || null,
      recurrence: meta.recurrence || 'one_time',
      repeatPattern: meta.repeatPattern || null,
      daysOfWeek: meta.daysOfWeek || null,
      // Joined display fields
      warehouse: row.warehouse_name ? { name: row.warehouse_name } : null,
      assignee: row.assignee_name ? { full_name: row.assignee_name } : null,
      linkedSoNumber: row.linked_so_number || null,
      linkedGrnNumber: row.linked_grn_number || null,
      sourceBinCode: row.source_bin_code || null,
      destinationBinCode: row.destination_bin_code || null,
      zoneName: row.zone_name || null,
      binCode: row.bin_code_ref || null,
    };
  }

  async findAll(tenantId: string, query: any): Promise<{ data: any[]; total: number }> {
    const { page: rawPage = 1, limit = 50, search, status, type, priority, warehouseId, slaBreached } = query;
    const page = Math.max(1, rawPage || 1);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['t.tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;
    if (search) { conditions.push(`(t.task_number ILIKE $${idx} OR t.title ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`t.status = $${idx}`); params.push(status); idx++; }
    if (type) { conditions.push(`t.task_type = $${idx}`); params.push(type); idx++; }
    if (priority) { conditions.push(`t.priority = $${idx}`); params.push(priority); idx++; }
    if (warehouseId) { conditions.push(`t.warehouse_id = $${idx}`); params.push(warehouseId); idx++; }
    if (slaBreached === 'true' || slaBreached === true) {
      conditions.push(`t.due_date < NOW() AND t.status NOT IN ('completed', 'cancelled')`);
    }
    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) as count FROM tasks t WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(
      `SELECT t.*,
        w.name as warehouse_name,
        u.full_name as assignee_name,
        so.so_number as linked_so_number,
        g.grn_number as linked_grn_number,
        sb.code as source_bin_code,
        db.code as destination_bin_code,
        z.name as zone_name,
        b.code as bin_code_ref
      FROM tasks t
      LEFT JOIN warehouses w ON t.warehouse_id = w.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN sales_orders so ON (t.metadata->>'linkedSoId')::uuid = so.id
      LEFT JOIN grn g ON (t.metadata->>'linkedGrnId')::uuid = g.id
      LEFT JOIN bins sb ON (t.metadata->>'sourceBinId')::uuid = sb.id
      LEFT JOIN bins db ON (t.metadata->>'destinationBinId')::uuid = db.id
      LEFT JOIN zones z ON (t.metadata->>'zoneId')::uuid = z.id
      LEFT JOIN bins b ON (t.metadata->>'binId')::uuid = b.id
      WHERE ${where}
      ORDER BY t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );
    return { data: dataRes.rows.map(r => this.mapRow(r)), total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return this.mapRow(res.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(
      `SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(task_number, '[^0-9]', '', 'g') AS INTEGER)), 0) as max_num FROM tasks WHERE tenant_id = $1`,
      [tenantId],
    );
    return parseInt(res.rows[0].max_num, 10);
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const taskNumber = dto.taskNumber || dto.task_number;
    const taskType = dto.taskType || dto.task_type || dto.type || 'general';
    const title = dto.title || `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task`;
    const description = dto.description || dto.instructions || null;
    const priority = dto.priority || 'medium';
    const assignedTo = dto.assignedTo || dto.assigned_to || null;
    const dueDate = dto.dueDate || dto.due_date || null;
    const warehouseId = dto.warehouseId || dto.warehouse_id || null;
    const status = assignedTo ? 'assigned' : 'pending';
    const metadata = JSON.stringify({
      quantity: dto.quantity != null ? dto.quantity : null,
      notes: dto.notes || null,
      linkedSoId: dto.linkedSoId || dto.linked_so_id || null,
      linkedGrnId: dto.linkedGrnId || dto.linked_grn_id || null,
      sourceBinId: dto.sourceBinId || dto.source_bin_id || null,
      destinationBinId: dto.destinationBinId || dto.destination_bin_id || null,
      zoneId: dto.zoneId || dto.zone_id || null,
      rackId: dto.rackId || dto.rack_id || null,
      binId: dto.binId || dto.bin_id || null,
      skuId: dto.skuId || dto.sku_id || null,
      countScope: dto.countScope || dto.count_scope || null,
      sourceLocation: dto.sourceLocation || dto.source_location || null,
      recurrence: dto.recurrence || null,
      repeatPattern: dto.repeatPattern || null,
      daysOfWeek: dto.daysOfWeek || null,
    });

    const res = await this.db.query(
      `INSERT INTO tasks (tenant_id, task_number, title, description, task_type, priority, status, assigned_to, due_date, warehouse_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [tenantId, taskNumber, title, description, taskType, priority, status, assignedTo, dueDate, warehouseId, metadata],
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: string, tenantId: string, dto: any): Promise<any> {
    const updates: string[] = []; const params: any[] = []; let idx = 1;
    const fieldMap: Record<string, string> = {
      title: 'title', description: 'description',
      priority: 'priority', status: 'status',
      assignedTo: 'assigned_to', assigned_to: 'assigned_to',
      dueDate: 'due_date', due_date: 'due_date',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (dto[key] !== undefined) { updates.push(`${col} = $${idx}`); params.push(dto[key]); idx++; }
    }
    if (updates.length === 0) return this.findById(id, tenantId);
    updates.push('updated_at = NOW()');
    params.push(id, tenantId);
    await this.db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1}`, params);
    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const res = await this.db.query(`DELETE FROM tasks WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return (res.rowCount ?? 0) > 0;
  }

  async countByStatus(tenantId: string): Promise<any[]> {
    const res = await this.db.query(`SELECT status, COUNT(*) as count FROM tasks WHERE tenant_id = $1 GROUP BY status`, [tenantId]);
    return res.rows;
  }

  async updateStatus(id: string, tenantId: string, status: string, extraFields?: Record<string, any>): Promise<any> {
    const sets = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status];
    let idx = 2;
    if (extraFields) {
      for (const [k, v] of Object.entries(extraFields)) {
        const col = k.replace(/[A-Z]/g, (l: string) => '_' + l.toLowerCase());
        sets.push(`${col} = $${idx}`); params.push(v); idx++;
      }
    }
    params.push(id, tenantId);
    await this.db.query(`UPDATE tasks SET ${sets.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1}`, params);
    return this.findById(id, tenantId);
  }
}
