import { Controller, Get, Post, Put, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SerialsService } from './serials.service';
import { QuerySerialDto, BulkCreateSerialsDto, UpdateSerialStatusDto } from './dto';

@Controller('api/v1/serials')
export class SerialsController {
  constructor(private readonly service: SerialsService) {}

  @Get('stats')
  async getStats(@Query('warehouseId') warehouseId?: string) {
    return { success: true, data: await this.service.getStats(warehouseId) };
  }

  @Get('available')
  async findAvailable(@Query('skuId') skuId: string, @Query('binId') binId: string) {
    return { success: true, data: await this.service.findAvailable(skuId, binId) };
  }

  @Get('by-sku/:skuId')
  async findBySku(@Param('skuId') skuId: string) {
    return { success: true, data: await this.service.findBySku(skuId) };
  }

  @Get()
  async findAll(@Query() query: QuerySerialDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { success: true, data: await this.service.findById(id) };
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    return { success: true, data: await this.service.getTimeline(id) };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() dto: BulkCreateSerialsDto) {
    return { success: true, data: await this.service.bulkCreate(dto) };
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateSerialStatusDto) {
    const { status, ...extra } = dto;
    return { success: true, data: await this.service.updateStatus(id, status, extra) };
  }

  @Post('pick')
  @HttpCode(HttpStatus.OK)
  async pickSerials(@Body() body: { serialIds: string[]; pickListId: string; soId?: string; customerId?: string }) {
    return { success: true, data: await this.service.pickSerials(body.serialIds, body.pickListId, body.soId, body.customerId) };
  }
}
