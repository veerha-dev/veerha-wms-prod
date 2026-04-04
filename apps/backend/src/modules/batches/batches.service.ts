import { Injectable, NotFoundException } from '@nestjs/common';
import { BatchesRepository } from './batches.repository';
import { CreateBatchDto, UpdateBatchDto, QueryBatchDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class BatchesService {
  constructor(private repository: BatchesRepository) {}


  async findAll(query: QueryBatchDto) {
    const { page = 1, limit = 500 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const batch = await this.repository.findById(getCurrentTenantId(), id);
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(dto: CreateBatchDto) {
    return this.repository.create(getCurrentTenantId(), dto);
  }

  async update(id: string, dto: UpdateBatchDto) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(getCurrentTenantId(), id);
  }
}
