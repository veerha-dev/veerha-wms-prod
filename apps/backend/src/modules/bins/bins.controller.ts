import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BinsService } from './bins.service';
import { CreateBinDto, UpdateBinDto, QueryBinDto } from './dto';

@Controller('api/v1/bins')
export class BinsController {
  constructor(private service: BinsService) {}

  @Get()
  async findAll(@Query() query: QueryBinDto) {
    const result = await this.service.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const bin = await this.service.findById(id);
    return {
      success: true,
      data: bin,
    };
  }

  @Post()
  async create(@Body() dto: CreateBinDto) {
    const bin = await this.service.create(dto);
    return {
      success: true,
      data: bin,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBinDto) {
    const bin = await this.service.update(id, dto);
    return {
      success: true,
      data: bin,
    };
  }

  @Post(':id/lock')
  async lock(@Param('id') id: string, @Body() body: { reason: string }) {
    const bin = await this.service.lock(id, body.reason);
    return {
      success: true,
      data: bin,
    };
  }

  @Post(':id/unlock')
  async unlock(@Param('id') id: string) {
    const bin = await this.service.unlock(id);
    return {
      success: true,
      data: bin,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return {
      success: true,
      data: null,
    };
  }
}
