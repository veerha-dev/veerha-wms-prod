import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WarehousesRepository, Warehouse } from './warehouses.repository';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';

// Default tenant for development (skip auth for now)



@Injectable()
export class WarehousesService {
  constructor(private repository: WarehousesRepository) {}


  async findAll(query: QueryWarehouseDto): Promise<{
    data: Warehouse[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.repository.findById(id, getCurrentTenantId());

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    // Generate code if not provided
    let code = dto.code;
    if (!code) {
      code = await this.generateCode();
    } else {
      // Check if code already exists
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(`Warehouse with code ${code} already exists`);
      }
    }

    return this.repository.create(getCurrentTenantId(), { ...dto, code });
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    // Check if warehouse exists
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    const updated = await this.repository.update(id, getCurrentTenantId(), dto);
    if (!updated) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repository.delete(id, getCurrentTenantId());

    if (!deleted) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countByTenant(getCurrentTenantId());
    return `WH-${String(count + 1).padStart(3, '0')}`;
  }
}
