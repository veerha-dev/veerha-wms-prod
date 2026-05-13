import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AdjustmentsRepository } from './adjustments.repository';
import { CreateAdjustmentDto, UpdateAdjustmentDto, QueryAdjustmentDto } from './dto';
import { SkusRepository } from '../skus/skus.repository';
import { getCurrentTenantId } from '../common/tenant.context';

// Per workflow doc: adjustments above this threshold require Admin approval.
// Managers cannot approve their own large adjustments — must go to Admin.
const APPROVAL_THRESHOLD = 100;

interface AuthUser {
  id: string;
  role: string;
  warehouseId?: string | null;
}

@Injectable()
export class AdjustmentsService {
  constructor(
    private repository: AdjustmentsRepository,
    private skusRepository: SkusRepository,
  ) {}

  async findAll(query: QueryAdjustmentDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const adjustment = await this.repository.findById(getCurrentTenantId(), id);
    if (!adjustment) throw new NotFoundException('Adjustment not found');
    return adjustment;
  }

  async create(dto: CreateAdjustmentDto, user?: AuthUser) {
    let adjustmentNumber = dto.adjustmentNumber;
    if (!adjustmentNumber) {
      adjustmentNumber = await this.repository.getNextCode(getCurrentTenantId());
    }
    const sku = await this.skusRepository.findById(getCurrentTenantId(), dto.skuId);
    if (!sku) throw new NotFoundException('SKU not found');

    const requestedBy = user?.id || dto.requestedBy || null;
    const qty = Math.abs(Number(dto.quantity ?? 0));

    // Auto-approve: small admin-created adjustments under threshold can be auto-approved.
    // Larger adjustments stay pending and require admin approval per workflow doc.
    const created = await this.repository.create(getCurrentTenantId(), {
      ...dto,
      adjustmentNumber,
      skuCode: sku.code,
      skuName: sku.name,
      location: `Warehouse ${dto.warehouseId?.substring(0, 8) || 'default'}`,
      requestedBy,
    });

    // If admin creates a small adjustment, auto-approve it (admins have approval authority)
    if (user?.role === 'admin' && qty <= APPROVAL_THRESHOLD) {
      return this.repository.approve(getCurrentTenantId(), created.id, requestedBy ?? undefined);
    }

    return created;
  }

  async update(id: string, dto: UpdateAdjustmentDto) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be updated');
    }
    return this.repository.update(getCurrentTenantId(), id, dto);
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be deleted');
    }
    return this.repository.delete(getCurrentTenantId(), id);
  }

  async approve(id: string, user?: AuthUser) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be approved');
    }

    const qty = Math.abs(Number(existing.quantity ?? 0));

    // Manager cannot approve their own large adjustments — must go to Admin
    if (user?.role === 'manager') {
      if (qty > APPROVAL_THRESHOLD) {
        throw new ForbiddenException(
          `Adjustments above ${APPROVAL_THRESHOLD} units require Admin approval`,
        );
      }
      if (existing.requestedBy && existing.requestedBy === user.id) {
        throw new ForbiddenException('You cannot approve your own adjustment request');
      }
    }

    return this.repository.approve(getCurrentTenantId(), id, user?.id);
  }

  async reject(id: string, user?: AuthUser) {
    const existing = await this.findById(id);
    if (existing.status !== 'pending') {
      throw new BadRequestException('Only pending adjustments can be rejected');
    }

    if (user?.role === 'manager' && Math.abs(Number(existing.quantity ?? 0)) > APPROVAL_THRESHOLD) {
      throw new ForbiddenException(
        `Adjustments above ${APPROVAL_THRESHOLD} units require Admin review`,
      );
    }

    return this.repository.reject(getCurrentTenantId(), id, user?.id);
  }
}
