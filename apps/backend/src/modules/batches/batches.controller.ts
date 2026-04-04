import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto, UpdateBatchDto, QueryBatchDto } from './dto';

@Controller('api/v1/batches')
export class BatchesController {
  constructor(private service: BatchesService) {}

  @Get()
  async findAll(@Query() query: QueryBatchDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateBatchDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, data: { deleted: true } };
  }
}
