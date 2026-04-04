import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { StockTransfersService } from './stock-transfers.service';
import { CreateStockTransferDto, UpdateStockTransferDto, QueryStockTransferDto } from './dto';

@Controller('api/v1/stock-transfers')
export class StockTransfersController {
  constructor(private readonly service: StockTransfersService) {}

  @Get('stats')
  async getStats(@Query('warehouseId') warehouseId?: string) {
    return { success: true, data: await this.service.getStats(warehouseId) };
  }

  @Get()
  async findAll(@Query() query: QueryStockTransferDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { success: true, data: await this.service.findById(id) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateStockTransferDto) {
    return { success: true, data: await this.service.create(dto) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStockTransferDto) {
    return { success: true, data: await this.service.update(id, dto) };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return { success: true, data: await this.service.approve(id) };
  }

  @Post(':id/start-transit')
  @HttpCode(HttpStatus.OK)
  async startTransit(@Param('id') id: string) {
    return { success: true, data: await this.service.startTransit(id) };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string) {
    return { success: true, data: await this.service.complete(id) };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    return { success: true, data: await this.service.cancel(id) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, data: { deleted: true } };
  }
}
