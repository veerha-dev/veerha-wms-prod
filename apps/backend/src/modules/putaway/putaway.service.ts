import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PutawayRepository } from './putaway.repository';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class PutawayService {
  constructor(private repository: PutawayRepository) {}


  async findAll(query: any) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id, getCurrentTenantId());
    if (!item) throw new NotFoundException(`Putaway task ${id} not found`);
    return item;
  }

  async create(dto: any) {
    const putawayNumber = await this.generateCode();
    return this.repository.create(getCurrentTenantId(), { ...dto, putawayNumber });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id, getCurrentTenantId());
    if (!deleted) throw new NotFoundException(`Putaway task ${id} not found`);
  }

  async getStats(warehouseId?: string) {
    return this.repository.getEnhancedStats(getCurrentTenantId(), warehouseId);
  }

  async suggestBinsPreview(warehouseId: string, skuId: string) {
    return this.repository.suggestBins(warehouseId, skuId);
  }

  async generateFromGrn(grnId: string) {
    // Verify GRN exists and is completed
    const grnRes = await this.repository['db'].query(
      `SELECT * FROM grn WHERE id = $1 AND tenant_id = $2`,
      [grnId, getCurrentTenantId()],
    );
    const grn = grnRes.rows[0];
    if (!grn) throw new NotFoundException(`GRN ${grnId} not found`);
    if (grn.status !== 'completed') throw new BadRequestException(`GRN ${grnId} is not completed`);

    // Get GRN items
    const itemsRes = await this.repository['db'].query(
      `SELECT * FROM grn_items WHERE grn_id = $1`,
      [grnId],
    );

    const tasks: any[] = [];
    for (const item of itemsRes.rows) {
      const putawayNumber = await this.generateCode();
      const task = await this.repository.create(getCurrentTenantId(), {
        putawayNumber,
        grnId: grn.id,
        grnItemId: item.id,
        skuId: item.sku_id,
        batchId: item.batch_id || null,
        quantity: item.quantity_received || item.quantity_expected,
        warehouseId: grn.warehouse_id,
        priority: 'normal',
        notes: `Auto-generated from GRN ${grn.grn_number}`,
      });
      tasks.push(task);
    }

    return tasks;
  }

  async suggestBins(taskId: string) {
    const task = await this.findOne(taskId);
    if (!task.warehouseId || !task.skuId) {
      throw new BadRequestException('Task must have warehouseId and skuId to suggest bins');
    }
    return this.repository.suggestBins(task.warehouseId, task.skuId);
  }

  async assignBin(taskId: string, binId: string, assignedTo?: string) {
    await this.findOne(taskId);
    const extraFields: Record<string, any> = {
      destinationBinId: binId,
      assignedAt: new Date(),
    };
    if (assignedTo) {
      extraFields.assignedTo = assignedTo;
    }
    return this.repository.updateStatus(taskId, getCurrentTenantId(), 'assigned', extraFields);
  }

  async start(taskId: string) {
    await this.findOne(taskId);
    return this.repository.updateStatus(taskId, getCurrentTenantId(), 'in_progress', {
      startedAt: new Date(),
    });
  }

  async complete(taskId: string) {
    await this.findOne(taskId);
    const result = await this.repository.completePutaway(taskId, getCurrentTenantId());
    if (!result) throw new NotFoundException(`Putaway task ${taskId} not found`);
    return result;
  }

  async cancel(taskId: string) {
    await this.findOne(taskId);
    return this.repository.updateStatus(taskId, getCurrentTenantId(), 'cancelled');
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countByTenant(getCurrentTenantId());
    return `PA-${String(count + 1).padStart(3, '0')}`;
  }
}
