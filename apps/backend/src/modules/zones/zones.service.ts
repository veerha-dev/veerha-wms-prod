import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ZonesRepository, Zone } from './zones.repository';
import { DatabaseService } from '../../database/database.service';
import { CreateZoneDto, UpdateZoneDto, QueryZoneDto, BulkCreateZoneDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class ZonesService {
  constructor(

    private repository: ZonesRepository,
    private db: DatabaseService,
  ) {}

  async findAll(query: QueryZoneDto): Promise<{
    data: Zone[];
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

  async findById(id: string): Promise<Zone> {
    const zone = await this.repository.findById(id, getCurrentTenantId());
    if (!zone) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }
    return zone;
  }

  async create(dto: CreateZoneDto): Promise<Zone> {
    let code = dto.code;

    if (!code) {
      code = await this.generateCode();
    } else {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(`Zone with code ${code} already exists`);
      }
    }

    return this.repository.create(getCurrentTenantId(), { ...dto, code });
  }

  async update(id: string, dto: UpdateZoneDto): Promise<Zone> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.repository.findByCode(dto.code);
      if (codeExists) {
        throw new ConflictException(`Zone with code ${dto.code} already exists`);
      }
    }

    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Zone with ID ${id} not found`);
    }

    await this.repository.delete(id, getCurrentTenantId());
  }

  async bulkCreate(dto: BulkCreateZoneDto): Promise<Zone> {
    let code = dto.code;

    if (!code) {
      code = await this.generateCode();
    } else {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(`Zone with code ${code} already exists`);
      }
    }

    return this.db.transaction(async (client) => {
      return this.repository.bulkCreate(getCurrentTenantId(), { ...dto, code }, client);
    });
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countAll();
    return `ZN-${String(count + 1).padStart(3, '0')}`;
  }
}
