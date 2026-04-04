import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TasksRepository {
  constructor(private db: DatabaseService) {}

  private mapRow(row: any) {
    if (!row) return null;
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
      quantity: row.metadata?.quantity || null,
      notes: row.metadata?.notes || null,
      dueDate: row.due_date,
      due_at: row.due_date,
      sla_breached: false,
      startedAt: row.started_at,
      started_at: row.started_at,
      completedAt: row.completed_at,
      completed_at: row.completed_at,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      updated_at: row.updated_at,
      warehouse_id: row.warehouse_id || null,
    };
  }

  async findAll(tenantId: string, query: any): Promise<{ data: any[]; total: number }> {
    const { page: rawPage = 1, limit = 50, search, status } = query;
    const page = Math.max(1, rawPage || 1);
    const offset = (page - 1) * limit;
    const conditions: string[] = ['tenant_id = $1'];
    const params: any[] = [tenantId];
    let idx = 2;
    if (search) { conditions.push(`(task_number ILIKE $${idx} OR title ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (status) { conditions.push(`status = $${idx}`); params.push(status); idx++; }
    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) as count FROM tasks WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(`SELECT * FROM tasks WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
    return { data: dataRes.rows.map(r => this.mapRow(r)), total };
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const res = await this.db.query(`SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    return this.mapRow(res.rows[0]);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const res = await this.db.query(`SELECT COUNT(*) as count FROM tasks WHERE tenant_id = $1`, [tenantId]);
    return parseInt(res.rows[0].count, 10);
  }

  async create(tenantId: string, dto: any): Promise<any> {
    const taskNumber = dto.taskNumber || dto.task_number;
    const taskType = dto.taskType || dto.task_type || dto.type || 'general';
    const title = dto.title || `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Task`;
    const description = dto.description || dto.instructions || null;
    const priority = dto.priority || 'medium';
    const assignedTo = dto.assignedTo || dto.assigned_to || null;
    const dueDate = dto.dueDate || dto.due_date || null;
    const metadata = JSON.stringify({ quantity: dto.quantity || null, notes: dto.notes || null });

    const res = await this.db.query(
      `INSERT INTO tasks (tenant_id, task_number, title, description, task_type, priority, status, assigned_to, due_date, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9) RETURNING *`,
      [tenantId, taskNumber, title, description, taskType, priority, assignedTo, dueDate, metadata],
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
