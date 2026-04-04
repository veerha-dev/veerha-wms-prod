import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { AdjustmentsRepository } from './adjustments.repository';
import { CreateAdjustmentDto, UpdateAdjustmentDto, QueryAdjustmentDto } from './dto';
import { SkusRepository } from '../skus/skus.repository';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class AdjustmentsService {
  constructor(

    private repository: AdjustmentsRepository,
    private skusRepository: SkusRepository,
  ) {}

  async findAll(query: QueryAdjustmentDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const adjustment = await this.repository.findById(getCurrentTenantId(), id);
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return adjustment;
  }

  async create(dto: CreateAdjustmentDto) {
    let adjustmentNumber = dto.adjustmentNumber;
    if (!adjustmentNumber) {
      adjustmentNumber = await this.repository.getNextCode(getCurrentTenantId());
    }
    const sku = await this.skusRepository.findById(getCurrentTenantId(), dto.skuId);
    if (!sku) throw new NotFoundException('SKU not found');
    // Get first user as default requestor (in production, extract from JWT)
    const userResult = await this.skusRepository['db'].query('SELECT id FROM users LIMIT 1');
    const requestedBy = dto.requestedBy || userResult.rows[0]?.id || null;

    return this.repository.create(getCurrentTenantId(), {
      ...dto,
      adjustmentNumber,
      skuCode: sku.code,
      skuName: sku.name,
      location: `Warehouse ${dto.warehouseId?.substring(0, 8) || 'default'}`,
      requestedBy,
    });
  }

  async update(id: string, dto: UpdateAdjustmentDto) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be updated');
    }
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be deleted');
    }
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async approve(id: string, approvedBy?: string) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be approved');
    }
    return this.repository.approve(getCurrentTenantId(), id, approvedBy);
  }

  async reject(id: string, approvedBy?: string) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be rejected');
    }
    return this.repository.reject(getCurrentTenantId(), id, approvedBy);
  }
}
