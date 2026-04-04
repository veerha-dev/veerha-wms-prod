import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class CustomersService {
  constructor(private repository: CustomersRepository) {}


  async findAll(query: QueryCustomerDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id, getCurrentTenantId());
    if (!item) throw new NotFoundException(`Customer with ID ${id} not found`);
    return item;
  }

  async create(dto: CreateCustomerDto) {
    const code = dto.code || await this.generateCode();
    return this.repository.create(getCurrentTenantId(), { ...dto, code });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const updated = await this.repository.update(id, getCurrentTenantId(), dto);
    if (!updated) throw new NotFoundException(`Customer with ID ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id, getCurrentTenantId());
    if (!deleted) throw new NotFoundException(`Customer with ID ${id} not found`);
  }

  async getStats() {
    const rows = await this.repository.countByStatus(getCurrentTenantId());
    const stats: Record<string, number> = {};
    rows.forEach((r: any) => { stats[r.status] = parseInt(r.count, 10); });
    return stats;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    const updated = await this.repository.updateStatus(id, getCurrentTenantId(), status);
    if (!updated) throw new NotFoundException(`Customer with ID ${id} not found`);
    return updated;
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countByTenant(getCurrentTenantId());
    return `CUST-${String(count + 1).padStart(3, '0')}`;
  }
}
