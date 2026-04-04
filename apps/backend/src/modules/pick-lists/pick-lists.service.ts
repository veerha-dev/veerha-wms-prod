import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PickListsRepository } from './pick-lists.repository';
import { GeneratePickListDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class PickListsService {
  constructor(private repository: PickListsRepository) {}


  async findAll(query: any) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id, getCurrentTenantId());
    if (!item) throw new NotFoundException(`PickList ${id} not found`);
    return item;
  }

  async create(dto: any) {
    const pickListNumber = dto.pickListNumber || await this.generateCode();
    return this.repository.create(getCurrentTenantId(), { ...dto, pickListNumber });
  }

  async generate(dto: GeneratePickListDto) {
    const { strategy, orderIds, warehouseId, assignedTo, priority, batchSize, notes } = dto;

    if (!orderIds || orderIds.length === 0) {
      throw new BadRequestException('At least one order ID is required');
    }

    // 1. Query sales order items for all orders
    const soItems = await this.repository.findSalesOrderItems(getCurrentTenantId(), orderIds);
    if (soItems.length === 0) {
      throw new BadRequestException('No items found for the selected orders');
    }

    // 2. Generate pick list number
    const pickListNumber = await this.generateCode();

    // 3. Create pick list header
    const pickList = await this.repository.create(getCurrentTenantId(), {
      pickListNumber,
      soId: strategy === 'single' ? orderIds[0] : null,
      warehouseId,
      strategy: strategy || 'single',
      priority: priority || 'medium',
      batchSize: strategy === 'batch' ? (batchSize || orderIds.length) : null,
      assignedTo: assignedTo || null,
      notes: notes || `${strategy === 'batch' ? 'Batch' : 'Single'} pick for ${orderIds.length} order(s)`,
      status: assignedTo ? 'assigned' : 'pending',
    });

    // 4. Allocate items — find bins with stock for each SKU
    const pickItems: any[] = [];

    for (const soItem of soItems) {
      const qtyNeeded = soItem.quantityOrdered - soItem.quantityPicked;
      if (qtyNeeded <= 0) continue;

      // Find bins with available stock, ordered by proximity
      const bins = await this.repository.findAvailableStock(getCurrentTenantId(), soItem.skuId, warehouseId);

      let remaining = qtyNeeded;
      for (const bin of bins) {
        if (remaining <= 0) break;
        const pickQty = Math.min(remaining, bin.available);
        pickItems.push({
          skuId: soItem.skuId,
          binId: bin.binId,
          quantityRequired: pickQty,
          soId: soItem.soId,
        });
        remaining -= pickQty;
      }

      // If no bins found or insufficient stock, create item without bin (worker finds it)
      if (remaining > 0) {
        pickItems.push({
          skuId: soItem.skuId,
          binId: null,
          quantityRequired: remaining,
          soId: soItem.soId,
        });
      }
    }

    // 5. Sort by bin proximity for efficient walking
    pickItems.sort((a, b) => {
      if (!a.binId) return 1;
      if (!b.binId) return -1;
      return 0; // bins already sorted by proximity from findAvailableStock
    });

    // 6. Insert pick list items
    if (pickItems.length > 0) {
      await this.repository.createItems(pickList.id, pickItems);
    }

    // 7. Return complete pick list with items
    return this.repository.findById(pickList.id, getCurrentTenantId());
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id, getCurrentTenantId());
    if (!deleted) throw new NotFoundException(`PickList ${id} not found`);
  }

  async getStats() {
    const rows = await this.repository.countByStatus(getCurrentTenantId());
    const stats: Record<string, number> = {};
    rows.forEach((r: any) => stats[r.status] = parseInt(r.count, 10));
    return stats;
  }

  async updateStatus(id: string, status: string, extraFields?: Record<string, any>) {
    await this.findOne(id);
    return this.repository.updateStatus(id, getCurrentTenantId(), status, extraFields);
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countByTenant(getCurrentTenantId());
    return `PL-${String(count + 1).padStart(3, '0')}`;
  }
}
