import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnDto, QueryReturnDto } from './dto';

@Controller('api/v1/returns')
export class ReturnsController {
  constructor(private readonly service: ReturnsService) {}

  @Get('stats')
  async getStats() { return { success: true, data: await this.service.getStats() }; }

  @Get()
  async findAll(@Query() query: QueryReturnDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { return { success: true, data: await this.service.findOne(id) }; }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReturnDto) { return { success: true, data: await this.service.create(dto) }; }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReturnDto) { return { success: true, data: await this.service.update(id, dto) }; }

  @Delete(':id')
  async remove(@Param('id') id: string) { await this.service.remove(id); return { success: true, data: { id } }; }

  @Post(':id/receive')
  @HttpCode(HttpStatus.OK)
  async receive(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'received', { receivedAt: new Date() }) }; }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  async process(@Param('id') id: string, @Body() body: { warehouseId?: string; decision?: string; inspection_notes?: string }) {
    const extraFields: Record<string, any> = { processedAt: new Date() };
    if (body.warehouseId) extraFields.warehouseId = body.warehouseId;
    if (body.decision) extraFields.decision = body.decision;
    if (body.inspection_notes) extraFields.notes = body.inspection_notes;
    return { success: true, data: await this.service.updateStatus(id, 'processed', extraFields) };
  }
}
