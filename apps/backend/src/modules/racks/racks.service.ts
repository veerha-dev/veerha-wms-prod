import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RacksRepository, Rack } from './racks.repository';
import { CreateRackDto, UpdateRackDto, QueryRackDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class RacksService {
  constructor(private repository: RacksRepository) {}


  async findAll(query: QueryRackDto): Promise<{
    data: Rack[];
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

  async findById(id: string): Promise<Rack> {
    const rack = await this.repository.findById(id, getCurrentTenantId());
    if (!rack) {
      throw new NotFoundException(`Rack with ID ${id} not found`);
    }
    return rack;
  }

  async create(dto: CreateRackDto): Promise<Rack> {
    let code = dto.code;

    if (!code) {
      code = await this.generateCode();
    } else {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(`Rack with code ${code} already exists`);
      }
    }

    const rack = await this.repository.create(getCurrentTenantId(), { ...dto, code });

    await this.repository.updateZoneRackCount(rack.zoneId);
    if (rack.aisleId) {
      await this.repository.updateAisleRackCount(rack.aisleId);
    }

    return rack;
  }

  async update(id: string, dto: UpdateRackDto): Promise<Rack> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Rack with ID ${id} not found`);
    }

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.repository.findByCode(dto.code);
      if (codeExists) {
        throw new ConflictException(`Rack with code ${dto.code} already exists`);
      }
    }

    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Rack with ID ${id} not found`);
    }

    const zoneId = existing.zoneId;
    const aisleId = existing.aisleId;
    await this.repository.delete(id, getCurrentTenantId());

    await this.repository.updateZoneRackCount(zoneId);
    if (aisleId) {
      await this.repository.updateAisleRackCount(aisleId);
    }
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countAll();
    return `RK-${String(count + 1).padStart(3, '0')}`;
  }
}
