import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ReportQueryDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  // ─── Report Configs ─────────────────────────────────────────
  async getConfigs() {
    const result = await this.db.query(
      'SELECT * FROM report_configs WHERE tenant_id = $1 ORDER BY created_at DESC',
      [getCurrentTenantId()],
    );
    return result.rows;
  }

  async createConfig(data: any) {
    const result = await this.db.query(
      `INSERT INTO report_configs (tenant_id, name, report_type, filters, schedule, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [getCurrentTenantId(), data.name, data.reportType || data.report_type, JSON.stringify(data.filters || {}), data.schedule || 'on_demand', data.createdBy || null],
    );
    return result.rows[0];
  }

  async deleteConfig(id: string) {
    await this.db.query('DELETE FROM report_configs WHERE id = $1 AND tenant_id = $2', [id, getCurrentTenantId()]);
    return { id };
  }

  // ─── Report History ─────────────────────────────────────────
  async getHistory(limit = 10) {
    const result = await this.db.query(
      'SELECT * FROM report_history WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2',
      [getCurrentTenantId(), limit],
    );
    return result.rows;
  }

  async logExecution(data: any) {
    const result = await this.db.query(
      `INSERT INTO report_history (tenant_id, report_type, report_name, filters, row_count, export_format, generated_by, execution_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [getCurrentTenantId(), data.reportType || data.report_type, data.reportName || data.report_name || null, JSON.stringify(data.filters || {}), data.rowCount || data.row_count || 0, data.exportFormat || data.export_format || 'view', data.generatedBy || data.generated_by || null, data.executionTimeMs || data.execution_time_ms || 0],
    );
    return result.rows[0];
  }

  // ─── Stock Report ───────────────────────────────────────────
  async getStockReport(query: ReportQueryDto) {
    const { warehouseId, startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['sl.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`sl.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`sl.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`sl.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT sl.*, s.code as sku_code, s.name as sku_name, s.category,
              s.cost_price as unit_cost, s.reorder_point,
              w.name as warehouse_name, w.code as warehouse_code,
              (sl.quantity_available * COALESCE(s.cost_price, 0)) as stock_value
       FROM stock_levels sl
       LEFT JOIN skus s ON sl.sku_id = s.id
       LEFT JOIN warehouses w ON sl.warehouse_id = w.id
       WHERE ${where}
       ORDER BY s.code ASC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Movements Report ──────────────────────────────────────
  async getMovementsReport(query: ReportQueryDto) {
    const { warehouseId, startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['sm.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`sm.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`sm.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`sm.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT sm.*, s.code as sku_code, s.name as sku_name
       FROM stock_movements sm
       LEFT JOIN skus s ON sm.sku_id = s.id
       WHERE ${where}
       ORDER BY sm.created_at DESC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Purchase Register ─────────────────────────────────────
  async getPurchaseRegister(query: ReportQueryDto) {
    const { startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['po.tenant_id = $1'];
    let paramIndex = 2;

    if (startDate) {
      conditions.push(`po.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`po.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT po.*, sup.name as supplier_name, sup.code as supplier_code,
              w.name as warehouse_name,
              (SELECT COUNT(*) FROM grn g WHERE g.po_id = po.id) as grn_count
       FROM purchase_orders po
       LEFT JOIN suppliers sup ON po.supplier_id = sup.id
       LEFT JOIN warehouses w ON po.warehouse_id = w.id
       WHERE ${where}
       ORDER BY po.created_at DESC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Sales Register ────────────────────────────────────────
  async getSalesRegister(query: ReportQueryDto) {
    const { startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['so.tenant_id = $1'];
    let paramIndex = 2;

    if (startDate) {
      conditions.push(`so.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`so.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT so.*, c.name as customer_name, c.code as customer_code,
              w.name as warehouse_name,
              (SELECT COUNT(*) FROM shipments sh WHERE sh.so_id = so.id) as shipment_count,
              (SELECT COUNT(*) FROM sales_order_items soi WHERE soi.so_id = so.id) as item_count,
              (SELECT COALESCE(SUM(soi.quantity_ordered), 0) FROM sales_order_items soi WHERE soi.so_id = so.id) as total_quantity
       FROM sales_orders so
       LEFT JOIN customers c ON so.customer_id = c.id
       LEFT JOIN warehouses w ON so.warehouse_id = w.id
       WHERE ${where}
       ORDER BY so.created_at DESC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── GRN Report ────────────────────────────────────────────
  async getGrnReport(query: ReportQueryDto) {
    const { warehouseId, startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['g.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`g.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`g.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`g.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT g.*, w.name as warehouse_name
       FROM grn g
       LEFT JOIN warehouses w ON g.warehouse_id = w.id
       WHERE ${where}
       ORDER BY g.created_at DESC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Expiry Report (FIXED: uses daysAhead param) ──────────
  async getExpiryReport(query: any) {
    const { warehouseId, limit = 500 } = query;
    const daysAhead = parseInt(query.daysAhead || query.days_ahead || '90', 10) || 90;
    const params: any[] = [getCurrentTenantId(), daysAhead];
    const conditions: string[] = ['b.tenant_id = $1', `b.expiry_date <= NOW() + ($2 || ' days')::INTERVAL`];
    let paramIndex = 3;

    if (warehouseId) {
      conditions.push(`sl.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT b.*, s.code as sku_code, s.name as sku_name, s.cost_price as unit_cost,
              EXTRACT(DAY FROM (b.expiry_date - NOW()))::integer as days_until_expiry,
              CASE
                WHEN b.expiry_date < NOW() THEN 'expired'
                WHEN EXTRACT(DAY FROM (b.expiry_date - NOW())) <= 7 THEN 'critical'
                WHEN EXTRACT(DAY FROM (b.expiry_date - NOW())) <= 30 THEN 'warning'
                ELSE 'normal'
              END as severity
       FROM batches b
       LEFT JOIN skus s ON b.sku_id = s.id
       LEFT JOIN stock_levels sl ON sl.sku_id = b.sku_id AND sl.tenant_id = b.tenant_id
       WHERE ${where}
       GROUP BY b.id, s.code, s.name, s.cost_price, sl.warehouse_id
       ORDER BY b.expiry_date ASC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Low Stock Report ──────────────────────────────────────
  async getLowStockReport(query: ReportQueryDto) {
    const { warehouseId, startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['sl.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`sl.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`sl.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`sl.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT sl.*, s.code as sku_code, s.name as sku_name, s.category,
              s.reorder_point, s.cost_price as unit_cost,
              w.name as warehouse_name,
              (sl.quantity_available - sl.quantity_reserved) as net_available,
              GREATEST(0, COALESCE(s.reorder_point, 0) - sl.quantity_available) as deficit,
              CASE
                WHEN sl.quantity_available = 0 THEN 'critical'
                WHEN sl.quantity_available <= COALESCE(s.reorder_point, 0) * 0.5 THEN 'high'
                ELSE 'medium'
              END as severity
       FROM stock_levels sl
       LEFT JOIN skus s ON sl.sku_id = s.id
       LEFT JOIN warehouses w ON sl.warehouse_id = w.id
       WHERE ${where} AND sl.quantity_available <= COALESCE(s.reorder_point, 0) AND COALESCE(s.reorder_point, 0) > 0
       ORDER BY sl.quantity_available ASC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Warehouse Utilization ─────────────────────────────────
  async getWarehouseUtilization(query: ReportQueryDto) {
    const { warehouseId, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['w.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`w.id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT w.*,
              CASE WHEN w.total_capacity > 0 THEN ROUND((COALESCE(w.current_occupancy, 0)::numeric / w.total_capacity) * 100, 2) ELSE 0 END as utilization_percent,
              (SELECT COUNT(*) FROM zones z WHERE z.warehouse_id = w.id) as total_zones,
              (SELECT COUNT(*) FROM bins b2 JOIN zones z2 ON b2.zone_id = z2.id WHERE z2.warehouse_id = w.id) as total_bins,
              (SELECT COUNT(DISTINCT sl.sku_id) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as total_sku_count,
              (SELECT COALESCE(SUM(sl.quantity_available), 0) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as total_stock_qty
       FROM warehouses w
       WHERE ${where}
       ORDER BY w.name ASC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }

  // ─── Audit Trail (uses stock_movements as inventory audit) ─
  async getAuditTrail(query: ReportQueryDto) {
    const { warehouseId, startDate, endDate, limit = 500 } = query;
    const params: any[] = [getCurrentTenantId()];
    const conditions: string[] = ['sm.tenant_id = $1'];
    let paramIndex = 2;

    if (warehouseId) {
      conditions.push(`sm.warehouse_id = $${paramIndex}`);
      params.push(warehouseId);
      paramIndex++;
    }
    if (startDate) {
      conditions.push(`sm.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      conditions.push(`sm.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const where = conditions.join(' AND ');
    params.push(limit);

    const result = await this.db.query(
      `SELECT sm.*, s.code as sku_code, s.name as sku_name,
              CASE
                WHEN sm.movement_type IN ('stock_in', 'return', 'putaway') THEN 'create'
                WHEN sm.movement_type IN ('adjustment', 'transfer') THEN 'update'
                WHEN sm.movement_type IN ('stock_out', 'damage', 'scrap') THEN 'delete'
                ELSE 'update'
              END as action,
              'inventory' as entity_type
       FROM stock_movements sm
       LEFT JOIN skus s ON sm.sku_id = s.id
       WHERE ${where}
       ORDER BY sm.created_at DESC
       LIMIT $${paramIndex}`,
      params,
    );

    return result.rows;
  }
}
