import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AislesRepository, Aisle } from './aisles.repository';
import { CreateAisleDto, UpdateAisleDto, QueryAisleDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class AislesService {
  constructor(private repository: AislesRepository) {}


  async findAll(query: QueryAisleDto): Promise<{
    data: Aisle[];
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

  async findById(id: string): Promise<Aisle> {
    const aisle = await this.repository.findById(id, getCurrentTenantId());
    if (!aisle) {
      throw new NotFoundException(`Aisle with ID ${id} not found`);
    }
    return aisle;
  }

  async create(dto: CreateAisleDto): Promise<Aisle> {
    let code = dto.code;

    if (!code) {
      code = await this.generateCode();
    } else {
      const existing = await this.repository.findByCode(code, getCurrentTenantId());
      if (existing) {
        throw new ConflictException(`Aisle with code ${code} already exists`);
      }
    }

    const aisle = await this.repository.create(getCurrentTenantId(), { ...dto, code });

    await this.repository.updateZoneAisleCount(aisle.zoneId);

    return aisle;
  }

  async update(id: string, dto: UpdateAisleDto): Promise<Aisle> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Aisle with ID ${id} not found`);
    }

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.repository.findByCode(dto.code, getCurrentTenantId());
      if (codeExists) {
        throw new ConflictException(`Aisle with code ${dto.code} already exists`);
      }
    }

    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Aisle with ID ${id} not found`);
    }

    const zoneId = existing.zoneId;
    await this.repository.delete(id, getCurrentTenantId());

    await this.repository.updateZoneAisleCount(zoneId);
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countAll();
    return `AL-${String(count + 1).padStart(3, '0')}`;
  }
}
