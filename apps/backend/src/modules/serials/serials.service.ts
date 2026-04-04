import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SerialsRepository } from './serials.repository';
import { DatabaseService } from '../../database/database.service';
import { QuerySerialDto, BulkCreateSerialsDto } from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class SerialsService {
  constructor(

    private repository: SerialsRepository,
    private db: DatabaseService,
  ) {}

  async findAll(query: QuerySerialDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAll(getCurrentTenantId(), query);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const serial = await this.repository.findById(getCurrentTenantId(), id);
    if (!serial) throw new NotFoundException('Serial number not found');
    return serial;
  }

  async findBySku(skuId: string) {
    return this.repository.findBySku(getCurrentTenantId(), skuId);
  }

  async findAvailable(skuId: string, binId: string) {
    return this.repository.findBySkuAndBin(getCurrentTenantId(), skuId, binId);
  }

  async getTimeline(serialId: string) {
    await this.findById(serialId);
    return this.repository.getTimeline(getCurrentTenantId(), serialId);
  }

  async getStats(warehouseId?: string) {
    return this.repository.countByStatus(getCurrentTenantId(), warehouseId);
  }

  async bulkCreate(dto: BulkCreateSerialsDto) {
    // Validate no duplicates in input
    const uniqueSerials = [...new Set(dto.serialNumbers)];
    if (uniqueSerials.length !== dto.serialNumbers.length) {
      throw new BadRequestException('Duplicate serial numbers in input');
    }

    // Check for existing serials in DB
    for (const sn of uniqueSerials) {
      const existing = await this.db.query(
        'SELECT id FROM serial_numbers WHERE serial_number = $1 AND tenant_id = $2',
        [sn, getCurrentTenantId()],
      );
      if (existing.rows.length > 0) {
        throw new BadRequestException(`Serial number ${sn} already exists`);
      }
    }

    const serials = uniqueSerials.map(sn => ({
      serialNumber: sn,
      skuId: dto.skuId,
      batchId: dto.batchId,
      warehouseId: dto.warehouseId,
      grnId: dto.grnId,
      grnItemId: dto.grnItemId,
      poId: dto.poId,
      supplierId: dto.supplierId,
      status: 'in_stock',
      receivedAt: new Date(),
    }));

    const created = await this.repository.bulkCreate(getCurrentTenantId(), serials);

    // Create movement records
    const movements = created.map(s => ({
      serialNumberId: s.id,
      movementType: 'received',
      toLocation: dto.warehouseId ? `Warehouse receiving` : 'Received',
      referenceType: dto.grnId ? 'grn' : null,
      referenceId: dto.grnId || null,
      notes: `Received via GRN`,
    }));

    await this.repository.bulkAddMovements(getCurrentTenantId(), movements);

    return created;
  }

  async updateStatus(id: string, status: string, extra?: Record<string, any>) {
    await this.findById(id);
    const updated = await this.repository.updateStatus(getCurrentTenantId(), id, status, extra);

    await this.repository.addMovement(getCurrentTenantId(), {
      serialNumberId: id,
      movementType: status === 'picked' ? 'picked' : status === 'shipped' ? 'shipped' : 'status_change',
      referenceType: extra?.pickListId ? 'pick_list' : extra?.shipmentId ? 'shipment' : null,
      referenceId: extra?.pickListId || extra?.shipmentId || null,
      notes: `Status changed to ${status}`,
    });

    return updated;
  }

  async pickSerials(serialIds: string[], pickListId: string, soId?: string, customerId?: string) {
    // Validate all serials are in_stock
    for (const id of serialIds) {
      const serial = await this.repository.findById(getCurrentTenantId(), id);
      if (!serial) throw new NotFoundException(`Serial ${id} not found`);
      if (serial.status !== 'in_stock') throw new BadRequestException(`Serial ${serial.serialNumber} is not in stock (status: ${serial.status})`);
    }

    const updated = await this.repository.bulkUpdateStatus(getCurrentTenantId(), serialIds, 'picked', {
      soId, pickListId, customerId,
    });

    const movements = updated.map(s => ({
      serialNumberId: s.id,
      movementType: 'picked',
      fromLocation: s.binCode ? `Bin ${s.binCode}` : 'Warehouse',
      referenceType: 'pick_list',
      referenceId: pickListId,
      notes: `Picked for sales order`,
    }));

    await this.repository.bulkAddMovements(getCurrentTenantId(), movements);

    return updated;
  }

  async updateLocationForGrnItem(grnItemId: string, binId: string, zoneId?: string) {
    const result = await this.db.query(
      'SELECT id FROM serial_numbers WHERE grn_item_id = $1 AND tenant_id = $2',
      [grnItemId, getCurrentTenantId()],
    );

    for (const row of result.rows) {
      await this.repository.updateStatus(getCurrentTenantId(), row.id, 'in_stock', { binId, zoneId });
      await this.repository.addMovement(getCurrentTenantId(), {
        serialNumberId: row.id,
        movementType: 'putaway',
        toLocation: `Bin assigned`,
        referenceType: 'putaway',
        notes: 'Putaway completed — serial assigned to bin',
      });
    }
  }
}
