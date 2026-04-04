import { Injectable, NotFoundException } from '@nestjs/common';
import { DamagedItemsRepository } from './damaged-items.repository';
import { CreateDamagedItemDto, UpdateDamagedItemDto, QueryDamagedItemDto } from './dto';
import { SkusRepository } from '../skus/skus.repository';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class DamagedItemsService {
  constructor(

    private repository: DamagedItemsRepository,
    private skusRepository: SkusRepository,
  ) {}

  async findAll(query: QueryDamagedItemDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const damagedItem = await this.repository.findById(getCurrentTenantId(), id);
    if (!damagedItem) throw new NotFoundException('Damaged item not found');
    return damagedItem;
  }

  async create(dto: CreateDamagedItemDto) {
    // Get SKU details
    const sku = await this.skusRepository.findById(getCurrentTenantId(), dto.skuId);
    if (!sku) throw new NotFoundException('SKU not found');

    // Create damaged item with SKU details
    return this.repository.create(getCurrentTenantId(), {
      ...dto,
      skuCode: sku.code,
      skuName: sku.name,
      reportedBy: null, // Set from JWT user context in production
      reportedByRole: 'operator',
    });
  }

  async update(id: string, dto: UpdateDamagedItemDto) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async dispose(id: string) {
    const damagedItem = await this.findById(id);
    return this.repository.dispose(getCurrentTenantId(), id, null);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(getCurrentTenantId(), id);
  }
}
