import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BinsRepository, Bin } from './bins.repository';
import { CreateBinDto, UpdateBinDto, QueryBinDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class BinsService {
  constructor(private repository: BinsRepository) {}


  async findAll(query: QueryBinDto): Promise<{
    data: Bin[];
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

  async findById(id: string): Promise<Bin> {
    const bin = await this.repository.findById(id, getCurrentTenantId());
    if (!bin) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }
    return bin;
  }

  async create(dto: CreateBinDto): Promise<Bin> {
    let code = dto.code;

    if (!code) {
      code = await this.generateCode();
    } else {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new ConflictException(`Bin with code ${code} already exists`);
      }
    }

    const bin = await this.repository.create(getCurrentTenantId(), { ...dto, code });
    
    await this.repository.updateRackBinCount(bin.rackId);
    await this.repository.updateZoneBinCount(bin.zoneId);
    
    return bin;
  }

  async update(id: string, dto: UpdateBinDto): Promise<Bin> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.repository.findByCode(dto.code);
      if (codeExists) {
        throw new ConflictException(`Bin with code ${dto.code} already exists`);
      }
    }

    return this.repository.update(id, getCurrentTenantId(), dto);
  }

  async lock(id: string, reason: string): Promise<Bin> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    return this.repository.update(id, getCurrentTenantId(), {
      isLocked: true,
      lockReason: reason,
    });
  }

  async unlock(id: string): Promise<Bin> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    return this.repository.update(id, getCurrentTenantId(), {
      isLocked: false,
      lockReason: undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id, getCurrentTenantId());
    if (!existing) {
      throw new NotFoundException(`Bin with ID ${id} not found`);
    }

    const rackId = existing.rackId;
    const zoneId = existing.zoneId;
    
    await this.repository.delete(id, getCurrentTenantId());
    
    await this.repository.updateRackBinCount(rackId);
    await this.repository.updateZoneBinCount(zoneId);
  }

  private async generateCode(): Promise<string> {
    const count = await this.repository.countAll();
    return `BIN-${String(count + 1).padStart(3, '0')}`;
  }
}
