import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { InventoryRepository } from './inventory.repository';
import {
  CreateStockLevelDto, UpdateStockLevelDto, TransferStockDto,
  AdjustStockDto, CreateMovementDto, QueryInventoryDto, QueryMovementsDto,
} from './dto';
import { getCurrentTenantId } from '../common/tenant.context';




@Injectable()
export class InventoryService {
  constructor(

    private repository: InventoryRepository,
    private db: DatabaseService,
  ) {}

  // ─── Stock Levels CRUD ─────────────────────────────────────

  async findAllStockLevels(query: QueryInventoryDto) {
    const { page = 1, limit = 5000 } = query;
    const { data, total } = await this.repository.findAllStockLevels(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findStockLevelById(id: string) {
    const sl = await this.repository.findStockLevelById(getCurrentTenantId(), id);
    if (!sl) throw new NotFoundException('Stock level not found');
    return sl;
  }

  async createStockLevel(dto: CreateStockLevelDto) {
    return this.repository.createStockLevel(getCurrentTenantId(), dto);
  }

  async updateStockLevel(id: string, dto: UpdateStockLevelDto) {
    await this.findStockLevelById(id);
    return this.repository.updateStockLevel(getCurrentTenantId(), id, dto);
  }

  async deleteStockLevel(id: string) {
    await this.findStockLevelById(id);
    return this.repository.deleteStockLevel(getCurrentTenantId(), id);
  }

  // ─── Low Stock & Expiring ─────────────────────────────────

  async findLowStock() {
    return this.repository.findLowStock(getCurrentTenantId());
  }

  async findExpiring() {
    return this.repository.findExpiring(getCurrentTenantId());
  }

  // ─── Movements ─────────────────────────────────────────────

  async findAllMovements(query: QueryMovementsDto) {
    const { page = 1, limit = 50 } = query;
    const { data, total } = await this.repository.findAllMovements(getCurrentTenantId(), query);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createMovement(dto: CreateMovementDto) {
    return this.repository.createMovement(getCurrentTenantId(), dto);
  }

  // ─── Transfer (Transactional) ──────────────────────────────

  async transferStock(dto: TransferStockDto) {
    const { skuId, fromBinId, toBinId, quantity, batchId } = dto;

    if (fromBinId === toBinId) {
      throw new BadRequestException('Source and destination bins must be different');
    }

    return this.db.transaction(async (client) => {
      // 1. Check destination bin is not locked
      const destBin = await client.query('SELECT id, is_locked FROM bins WHERE id = $1', [toBinId]);
      if (destBin.rows.length === 0) throw new NotFoundException('Destination bin not found');
      if (destBin.rows[0].is_locked) throw new BadRequestException('Destination bin is locked');

      // 2. Check source has enough stock
      let sourceQuery = 'SELECT * FROM stock_levels WHERE tenant_id = $1 AND sku_id = $2 AND bin_id = $3';
      const sourceParams: any[] = [getCurrentTenantId(), skuId, fromBinId];
      if (batchId) {
        sourceQuery += ' AND batch_id = $4';
        sourceParams.push(batchId);
      } else {
        sourceQuery += ' AND batch_id IS NULL';
      }
      sourceQuery += ' FOR UPDATE';

      const sourceStock = await client.query(sourceQuery, sourceParams);
      if (sourceStock.rows.length === 0) throw new BadRequestException('No stock found at source bin');
      if (sourceStock.rows[0].quantity_available < quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${sourceStock.rows[0].quantity_available}, Requested: ${quantity}`);
      }

      // 3. Decrement source
      await client.query(
        'UPDATE stock_levels SET quantity_available = quantity_available - $1, last_updated = NOW() WHERE id = $2',
        [quantity, sourceStock.rows[0].id],
      );

      // 4. Increment destination (upsert)
      const warehouseId = dto.warehouseId || sourceStock.rows[0].warehouse_id;
      let destQuery = 'SELECT id FROM stock_levels WHERE tenant_id = $1 AND sku_id = $2 AND bin_id = $3';
      const destParams: any[] = [getCurrentTenantId(), skuId, toBinId];
      if (batchId) {
        destQuery += ' AND batch_id = $4';
        destParams.push(batchId);
      } else {
        destQuery += ' AND batch_id IS NULL';
      }

      const destStock = await client.query(destQuery, destParams);
      if (destStock.rows.length > 0) {
        await client.query(
          'UPDATE stock_levels SET quantity_available = quantity_available + $1, last_updated = NOW() WHERE id = $2',
          [quantity, destStock.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO stock_levels (tenant_id, sku_id, warehouse_id, bin_id, batch_id, quantity_available)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [getCurrentTenantId(), skuId, warehouseId, toBinId, batchId || null, quantity],
        );
      }

      // 5. Record movement
      const movNum = await this.repository.getNextMovementNumber(getCurrentTenantId());
      await client.query(
        `INSERT INTO stock_movements (tenant_id, movement_number, movement_type, sku_id, batch_id, warehouse_id, from_bin_id, to_bin_id, quantity, reference_type, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [getCurrentTenantId(), movNum, 'transfer', skuId, batchId || null, warehouseId, fromBinId, toBinId, quantity, 'manual', `Transfer of ${quantity} units`],
      );

      return { success: true, movementNumber: movNum, quantity, fromBinId, toBinId };
    });
  }

  // ─── Adjustment (Transactional) ────────────────────────────

  async adjustStock(dto: AdjustStockDto) {
    const { skuId, binId, quantity, reason, batchId, notes } = dto;

    return this.db.transaction(async (client) => {
      // 1. Find existing stock at this bin
      let stockQuery = 'SELECT * FROM stock_levels WHERE tenant_id = $1 AND sku_id = $2 AND bin_id = $3';
      const stockParams: any[] = [getCurrentTenantId(), skuId, binId];
      if (batchId) {
        stockQuery += ' AND batch_id = $4';
        stockParams.push(batchId);
      } else {
        stockQuery += ' AND batch_id IS NULL';
      }
      stockQuery += ' FOR UPDATE';

      const existing = await client.query(stockQuery, stockParams);

      if (quantity < 0) {
        // Negative adjustment — must have stock
        if (existing.rows.length === 0) throw new BadRequestException('No stock found at this bin to adjust');
        if (existing.rows[0].quantity_available < Math.abs(quantity)) {
          throw new BadRequestException(`Cannot adjust. Available: ${existing.rows[0].quantity_available}`);
        }
      }

      // 2. Determine movement type from reason
      let movementType = 'adjustment';
      if (reason === 'damage') movementType = 'damage';
      else if (reason === 'scrap') movementType = 'scrap';
      else if (reason === 'return') movementType = 'return';
      else if (reason === 'correction') movementType = 'adjustment';

      // 3. Update or create stock level
      if (existing.rows.length > 0) {
        if (reason === 'damage') {
          // Move to damaged
          await client.query(
            'UPDATE stock_levels SET quantity_available = quantity_available - $1, quantity_damaged = quantity_damaged + $1, last_updated = NOW() WHERE id = $2',
            [Math.abs(quantity), existing.rows[0].id],
          );
        } else {
          await client.query(
            'UPDATE stock_levels SET quantity_available = quantity_available + $1, last_updated = NOW() WHERE id = $2',
            [quantity, existing.rows[0].id],
          );
        }
      } else if (quantity > 0) {
        // Create new stock entry
        const warehouseResult = await client.query('SELECT warehouse_id FROM bins WHERE id = $1', [binId]);
        const warehouseId = dto.warehouseId || warehouseResult.rows[0]?.warehouse_id;
        await client.query(
          `INSERT INTO stock_levels (tenant_id, sku_id, warehouse_id, bin_id, batch_id, quantity_available)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [getCurrentTenantId(), skuId, warehouseId, binId, batchId || null, quantity],
        );
      }

      // 4. Record movement
      const movNum = await this.repository.getNextMovementNumber(getCurrentTenantId());
      const fromBin = quantity < 0 ? binId : null;
      const toBin = quantity > 0 ? binId : null;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, movement_number, movement_type, sku_id, batch_id, warehouse_id, from_bin_id, to_bin_id, quantity, reference_type, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [getCurrentTenantId(), movNum, movementType, skuId, batchId || null, dto.warehouseId || null,
         fromBin, toBin, Math.abs(quantity), 'manual', notes || `${reason}: ${quantity} units`],
      );

      return { success: true, movementNumber: movNum, adjustment: quantity, reason };
    });
  }
}
