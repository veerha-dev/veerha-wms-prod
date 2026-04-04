import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { GrnService } from './grn.service';
import { CreateGrnDto, UpdateGrnDto, QueryGrnDto } from './dto';

@Controller('api/v1/grn')
export class GrnController {
  constructor(private readonly service: GrnService) {}

  @Get('stats')
  async getStats() { return { success: true, data: await this.service.getStats() }; }

  @Get()
  async findAll(@Query() query: QueryGrnDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { return { success: true, data: await this.service.findOne(id) }; }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateGrnDto) { return { success: true, data: await this.service.create(dto) }; }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGrnDto) { return { success: true, data: await this.service.update(id, dto) }; }

  @Delete(':id')
  async remove(@Param('id') id: string) { await this.service.remove(id); return { success: true, data: { id } }; }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'completed', { receivedDate: new Date() }) }; }
}
