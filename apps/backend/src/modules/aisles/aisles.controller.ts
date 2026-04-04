import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AislesService } from './aisles.service';
import { CreateAisleDto, UpdateAisleDto, QueryAisleDto } from './dto';

@Controller('api/v1/aisles')
export class AislesController {
  constructor(private service: AislesService) {}

  @Get()
  async findAll(@Query() query: QueryAisleDto) {
    const result = await this.service.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const aisle = await this.service.findById(id);
    return {
      success: true,
      data: aisle,
    };
  }

  @Post()
  async create(@Body() dto: CreateAisleDto) {
    const aisle = await this.service.create(dto);
    return {
      success: true,
      data: aisle,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAisleDto) {
    const aisle = await this.service.update(id, dto);
    return {
      success: true,
      data: aisle,
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
