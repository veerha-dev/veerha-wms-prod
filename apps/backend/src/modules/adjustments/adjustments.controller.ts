import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { CreateAdjustmentDto, UpdateAdjustmentDto, QueryAdjustmentDto } from './dto';

@Controller('api/v1/adjustments')
export class AdjustmentsController {
  constructor(private service: AdjustmentsService) {}

  @Get()
  async findAll(@Query() query: QueryAdjustmentDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateAdjustmentDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() body: { approvedBy?: string }) {
    const data = await this.service.approve(id, body.approvedBy);
    return { success: true, data };
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { approvedBy?: string }) {
    const data = await this.service.reject(id, body.approvedBy);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAdjustmentDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, data: { deleted: true } };
  }
}
