import { Injectable, NotFoundException } from '@nestjs/common';
import { GrnRepository } from './grn.repository';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class GrnService {
  constructor(private repository: GrnRepository) {}


  async findAll(query: any) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id, getCurrentTenantId());
    if (!item) throw new NotFoundException(`Grn ${id} not found`);
    return item;
  }

  async create(dto: any) {
    const grnNumber = dto.grnNumber || await this.generateCode();
    const { code, ...rest } = dto; return this.repository.create(getCurrentTenantId(), { ...rest, grnNumber });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id, getCurrentTenantId());
    if (!deleted) throw new NotFoundException(`Grn ${id} not found`);
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
    return `GRN-${String(count + 1).padStart(3, '0')}`;
  }
}
