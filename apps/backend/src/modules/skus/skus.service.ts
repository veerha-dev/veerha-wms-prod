import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { SkusRepository } from './skus.repository';
import { CreateSkuDto, UpdateSkuDto, QuerySkuDto, BulkCreateSkuDto, BulkUpdateSkuDto, BulkImportResultDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class SkusService {
  constructor(private repository: SkusRepository) {}


  async findAll(query: QuerySkuDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const sku = await this.repository.findById(getCurrentTenantId(), id);
    if (!sku) throw new NotFoundException('SKU not found');
    return sku;
  }

  async create(dto: CreateSkuDto) {
    let code = dto.code;
    if (!code) {
      code = await this.repository.getNextCode(getCurrentTenantId());
    }

    const existing = await this.repository.findByCode(getCurrentTenantId(), code);
    if (existing) throw new ConflictException(`SKU code ${code} already exists`);

    return this.repository.create(getCurrentTenantId(), { ...dto, code });
  }

  async update(id: string, dto: UpdateSkuDto) {
    await this.findById(id);
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    // Check if SKU has active stock
    const stockCheck = await this.repository['db'].query(
      'SELECT COUNT(*) as count FROM stock_levels WHERE sku_id = $1 AND (quantity_available > 0 OR quantity_reserved > 0)',
      [id],
    );
    if (parseInt(stockCheck.rows[0].count) > 0) {
      throw new BadRequestException('Cannot delete SKU with active stock. Remove all stock first.');
    }
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async bulkCreate(dto: BulkCreateSkuDto): Promise<BulkImportResultDto> {
    const result: BulkImportResultDto = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      try {
        let code = item.code;
        if (!code) {
          code = await this.repository.getNextCode(getCurrentTenantId());
        }

        const existing = await this.repository.findByCode(getCurrentTenantId(), code);
        if (existing) {
          result.errors.push({ row: i + 1, message: `SKU code ${code} already exists` });
          result.failed++;
          continue;
        }

        await this.repository.create(getCurrentTenantId(), { ...item, code });
        result.created++;
      } catch (error) {
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed++;
      }
    }

    return result;
  }

  async bulkUpdate(dto: BulkUpdateSkuDto): Promise<BulkImportResultDto> {
    const result: BulkImportResultDto = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      try {
        // Check if SKU exists
        const existing = await this.repository.findById(getCurrentTenantId(), item.id);
        if (!existing) {
          result.errors.push({
            row: i + 1,
            message: `SKU with ID ${item.id} not found`,
          });
          result.failed++;
          continue;
        }

        // Update the SKU
        await this.repository.update(getCurrentTenantId(), item.id, item);
        result.updated++;
      } catch (error) {
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        result.failed++;
      }
    }

    return result;
  }
}
