import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PutawayService } from './putaway.service';
import { CreatePutawayDto, UpdatePutawayDto, QueryPutawayDto } from './dto';

@Controller('api/v1/putaway')
export class PutawayController {
  constructor(private readonly service: PutawayService) {}

  @Get('stats')
  async getStats(@Query('warehouseId') warehouseId?: string) {
    return { success: true, data: await this.service.getStats(warehouseId) };
  }

  @Get('suggest-bins-preview')
  async suggestBinsPreview(
    @Query('warehouseId') warehouseId: string,
    @Query('skuId') skuId: string,
  ) {
    return { success: true, data: await this.service.suggestBinsPreview(warehouseId, skuId) };
  }

  @Get()
  async findAll(@Query() query: QueryPutawayDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.service.findOne(id) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePutawayDto) {
    return { success: true, data: await this.service.create(dto) };
  }

  @Post('generate-from-grn/:grnId')
  @HttpCode(HttpStatus.CREATED)
  async generateFromGrn(@Param('grnId') grnId: string) {
    return { success: true, data: await this.service.generateFromGrn(grnId) };
  }

  @Get(':id/suggest-bins')
  async suggestBins(@Param('id') id: string) {
    return { success: true, data: await this.service.suggestBins(id) };
  }

  @Post(':id/assign-bin')
  @HttpCode(HttpStatus.OK)
  async assignBin(@Param('id') id: string, @Body() body: { binId: string; assignedTo?: string }) {
    return { success: true, data: await this.service.assignBin(id, body.binId, body.assignedTo) };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string) {
    return { success: true, data: await this.service.start(id) };
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

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePutawayDto) {
    return { success: true, data: await this.service.update(id, dto) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, data: { id } };
  }
}
