import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateStockLevelDto, UpdateStockLevelDto, TransferStockDto,
  AdjustStockDto, CreateMovementDto, QueryInventoryDto, QueryMovementsDto,
} from './dto';

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  // ─── Stock Levels ───────────────────────────────────────────

  @Get()
  async findAllStockLevels(@Query() query: QueryInventoryDto) {
    const result = await this.service.findAllStockLevels(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('low-stock')
  async findLowStock() {
    const data = await this.service.findLowStock();
    return { success: true, data };
  }

  @Get('expiring')
  async findExpiring() {
    const data = await this.service.findExpiring();
    return { success: true, data };
  }

  @Get('movements')
  async findAllMovements(@Query() query: QueryMovementsDto) {
    const result = await this.service.findAllMovements(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findStockLevelById(@Param('id') id: string) {
    const data = await this.service.findStockLevelById(id);
    return { success: true, data };
  }

  @Post()
  async createStockLevel(@Body() dto: CreateStockLevelDto) {
    const data = await this.service.createStockLevel(dto);
    return { success: true, data };
  }

  @Post('transfer')
  async transferStock(@Body() dto: TransferStockDto) {
    const data = await this.service.transferStock(dto);
    return { success: true, data };
  }

  @Post('adjustment')
  async adjustStock(@Body() dto: AdjustStockDto) {
    const data = await this.service.adjustStock(dto);
    return { success: true, data };
  }

  @Post('movements')
  async createMovement(@Body() dto: CreateMovementDto) {
    const data = await this.service.createMovement(dto);
    return { success: true, data };
  }

  @Put(':id')
  async updateStockLevel(@Param('id') id: string, @Body() dto: UpdateStockLevelDto) {
    const data = await this.service.updateStockLevel(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async deleteStockLevel(@Param('id') id: string) {
    await this.service.deleteStockLevel(id);
    return { success: true, data: { deleted: true } };
  }
}
