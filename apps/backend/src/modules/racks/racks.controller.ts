import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RacksService } from './racks.service';
import { CreateRackDto, UpdateRackDto, QueryRackDto } from './dto';

@Controller('api/v1/racks')
export class RacksController {
  constructor(private service: RacksService) {}

  @Get()
  async findAll(@Query() query: QueryRackDto) {
    const result = await this.service.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const rack = await this.service.findById(id);
    return {
      success: true,
      data: rack,
    };
  }

  @Post()
  async create(@Body() dto: CreateRackDto) {
    const rack = await this.service.create(dto);
    return {
      success: true,
      data: rack,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRackDto) {
    const rack = await this.service.update(id, dto);
    return {
      success: true,
      data: rack,
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
