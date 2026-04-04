import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryAlertDto } from './dto';

@Injectable()
export class AlertsRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryAlertDto) {
    const { page = 1, limit = 50, search, status, type, severity, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['a.tenant_id = $1'];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(a.title ILIKE $${paramIndex} OR a.message ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      const isAcknowledged = status === 'acknowledged';
      conditions.push(`a.is_acknowledged = $${paramIndex}`);
      params.push(isAcknowledged);
      paramIndex++;
    }
    if (type) {
      conditions.push(`a.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }
    if (severity) {
      conditions.push(`a.severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }

    const allowedSort = ['type', 'severity', 'title', 'created_at', 'is_acknowledged'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');

    const countResult = await this.db.query(`SELECT COUNT(*) FROM inventory_alerts a WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT a.* FROM inventory_alerts a WHERE ${where} ORDER BY a.${safeSort} ${safeOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query('SELECT * FROM inventory_alerts WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO inventory_alerts (tenant_id, type, severity, title, message, sku_id, warehouse_id, is_acknowledged)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)
       RETURNING *`,
      [
        tenantId,
        data.type,
        data.severity,
        data.title,
        data.message || null,
        data.skuId || null,
        data.warehouseId || null,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async acknowledge(tenantId: string, id: string, acknowledgedBy?: string) {
    const result = await this.db.query(
      `UPDATE inventory_alerts SET is_acknowledged = true, acknowledged_at = NOW(), acknowledged_by = $3
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, tenantId, acknowledgedBy || null],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async acknowledgeAll(tenantId: string, acknowledgedBy?: string) {
    const result = await this.db.query(
      `UPDATE inventory_alerts SET is_acknowledged = true, acknowledged_at = NOW(), acknowledged_by = $2
       WHERE tenant_id = $1 AND is_acknowledged = false`,
      [tenantId, acknowledgedBy || null],
    );
    return result.rowCount ?? 0;
  }

  async getSummary(tenantId: string) {
    const severityResult = await this.db.query(
      `SELECT severity, COUNT(*) as count
       FROM inventory_alerts WHERE tenant_id = $1 AND is_acknowledged = false
       GROUP BY severity`,
      [tenantId],
    );

    const typeResult = await this.db.query(
      `SELECT type, COUNT(*) as count
       FROM inventory_alerts WHERE tenant_id = $1 AND is_acknowledged = false
       GROUP BY type`,
      [tenantId],
    );

    const totalResult = await this.db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_acknowledged = false) as unacknowledged,
        COUNT(*) FILTER (WHERE is_acknowledged = true) as acknowledged
       FROM inventory_alerts WHERE tenant_id = $1`,
      [tenantId],
    );

    const bySeverity: Record<string, number> = {};
    for (const row of severityResult.rows) {
      bySeverity[row.severity] = parseInt(row.count, 10);
    }

    const byType: Record<string, number> = {};
    for (const row of typeResult.rows) {
      byType[row.type] = parseInt(row.count, 10);
    }

    const totals = totalResult.rows[0];
    return {
      total: parseInt(totals.total, 10),
      unacknowledged: parseInt(totals.unacknowledged, 10),
      acknowledged: parseInt(totals.acknowledged, 10),
      bySeverity,
      byType,
    };
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      severity: row.severity,
      title: row.title,
      message: row.message,
      skuId: row.sku_id,
      warehouseId: row.warehouse_id,
      isAcknowledged: row.is_acknowledged,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at,
      createdAt: row.created_at,
    };
  }
}
