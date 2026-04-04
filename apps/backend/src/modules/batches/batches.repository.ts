import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { QueryBatchDto } from './dto';

@Injectable()
export class BatchesRepository {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: QueryBatchDto) {
    const { page = 1, limit = 500, search, skuId, status, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * limit;
    const params: any[] = [tenantId];
    const conditions: string[] = ['b.tenant_id = $1'];
    let idx = 2;

    if (search) {
      conditions.push(`(b.batch_number ILIKE $${idx} OR s.code ILIKE $${idx} OR s.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (skuId) {
      conditions.push(`b.sku_id = $${idx}`);
      params.push(skuId);
      idx++;
    }
    if (status) {
      conditions.push(`b.status = $${idx}`);
      params.push(status);
      idx++;
    }

    const allowedSort = ['batch_number', 'expiry_date', 'manufacture_date', 'created_at', 'quantity'];
    const safeSort = allowedSort.includes(sortBy) ? `b.${sortBy}` : 'b.created_at';
    const safeOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM batches b LEFT JOIN skus s ON s.id = b.sku_id WHERE ${where}`, params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT b.*, s.code as sku_code, s.name as sku_name
       FROM batches b LEFT JOIN skus s ON s.id = b.sku_id
       WHERE ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    );

    return { data: dataResult.rows.map(this.mapRow), total };
  }

  async findById(tenantId: string, id: string) {
    const result = await this.db.query(
      `SELECT b.*, s.code as sku_code, s.name as sku_name
       FROM batches b LEFT JOIN skus s ON s.id = b.sku_id
       WHERE b.id = $1 AND b.tenant_id = $2`, [id, tenantId],
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async create(tenantId: string, data: any) {
    const result = await this.db.query(
      `INSERT INTO batches (tenant_id, sku_id, batch_number, manufacture_date, expiry_date, supplier_reference, quantity, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tenantId, data.skuId, data.batchNumber, data.manufactureDate || null, data.expiryDate || null,
       data.supplierReference || null, data.quantity || 0, data.status || 'active'],
    );
    // Re-fetch with join to get sku_code/sku_name
    return this.findById(tenantId, result.rows[0].id);
  }

  async update(tenantId: string, id: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, tenantId];
    let idx = 3;

    const mappings: Record<string, string> = {
      batchNumber: 'batch_number', manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
      supplierReference: 'supplier_reference', quantity: 'quantity', status: 'status',
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
    await this.db.query(`UPDATE batches SET ${fields.join(', ')} WHERE id = $1 AND tenant_id = $2`, params);
    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string) {
    const result = await this.db.query('DELETE FROM batches WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, tenantId]);
    return (result.rowCount ?? 0) > 0;
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      skuId: row.sku_id,
      skuCode: row.sku_code || null,
      skuName: row.sku_name || null,
      batchNumber: row.batch_number,
      manufactureDate: row.manufacture_date,
      expiryDate: row.expiry_date,
      supplierReference: row.supplier_reference,
      quantity: row.quantity,
      status: row.status,
      fifoRank: row.fifo_rank,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
