import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CycleCountsRepository } from './cycle-counts.repository';
import { CreateCycleCountDto, UpdateCycleCountDto, QueryCycleCountDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class CycleCountsService {
  constructor(private repository: CycleCountsRepository) {}


  async findAll(query: QueryCycleCountDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const cc = await this.repository.findById(getCurrentTenantId(), id);
    if (!cc) throw new NotFoundException('Cycle count not found');
    return cc;
  }

  async create(dto: CreateCycleCountDto) {
    const countNumber = await this.repository.getNextCode(getCurrentTenantId());

    const cc = await this.repository.create(getCurrentTenantId(), { ...dto, countNumber });

    // Auto-populate items from stock_levels based on scope
    const stockItems = await this.repository.getStockForScope(
      getCurrentTenantId(), dto.countScope,
      dto.warehouseId, dto.zoneId, dto.rackId, dto.binId, dto.skuId,
    );

    if (stockItems.length > 0) {
      await this.repository.createItems(getCurrentTenantId(), cc.id, stockItems);
    }

    return this.repository.findById(getCurrentTenantId(), cc.id);
  }

  async update(id: string, dto: UpdateCycleCountDto) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async assign(id: string, assignedTo: string) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, { assignedTo, status: 'assigned' });
  }

  async start(id: string) {
    const cc = await this.findById(id);
    if (!['scheduled', 'assigned'].includes(cc.status)) {
      throw new BadRequestException(`Cannot start count in ${cc.status} status`);
    }
    return this.repository.update(getCurrentTenantId(), id, { status: 'in_progress' });
  }

  async submit(id: string, items: { id: string; physicalQty: number }[]) {
    const cc = await this.findById(id);
    if (cc.status !== 'in_progress') {
      throw new BadRequestException(`Cannot submit count in ${cc.status} status`);
    }

    await this.repository.updateItems(id, items.map(i => ({ id: i.id, physicalQty: i.physicalQty })));

    // Check if any variance exists
    const updated = await this.repository.findById(getCurrentTenantId(), id);
    const hasVariance = updated?.items?.some((item: any) => item.variance !== null && item.variance !== 0);

    await this.repository.update(getCurrentTenantId(), id, {
      status: hasVariance ? 'under_review' : 'counted',
    });

    return this.repository.findById(getCurrentTenantId(), id);
  }

  async review(id: string, items: { id: string; action: string; notes?: string }[]) {
    const cc = await this.findById(id);
    if (!['counted', 'under_review'].includes(cc.status)) {
      throw new BadRequestException(`Cannot review count in ${cc.status} status`);
    }

    await this.repository.updateItems(id, items);
    return this.repository.findById(getCurrentTenantId(), id);
  }

  async complete(id: string) {
    const cc = await this.findById(id);
    if (!['counted', 'under_review'].includes(cc.status)) {
      throw new BadRequestException(`Cannot complete count in ${cc.status} status`);
    }

    return this.repository.update(getCurrentTenantId(), id, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  async cancel(id: string) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, { status: 'cancelled' });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async getStats(warehouseId?: string) {
    return this.repository.getStats(getCurrentTenantId(), warehouseId);
  }
}
