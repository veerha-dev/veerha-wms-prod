import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto, UpdateZoneDto, QueryZoneDto, BulkCreateZoneDto } from './dto';

@Controller('api/v1/zones')
export class ZonesController {
  constructor(private service: ZonesService) {}

  @Get()
  async findAll(@Query() query: QueryZoneDto) {
    const result = await this.service.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const zone = await this.service.findById(id);
    return {
      success: true,
      data: zone,
    };
  }

  @Post('bulk-create')
  async bulkCreate(@Body() dto: BulkCreateZoneDto) {
    const zone = await this.service.bulkCreate(dto);
    return {
      success: true,
      data: zone,
    };
  }

  @Post()
  async create(@Body() dto: CreateZoneDto) {
    const zone = await this.service.create(dto);
    return {
      success: true,
      data: zone,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
    const zone = await this.service.update(id, dto);
    return {
      success: true,
      data: zone,
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
