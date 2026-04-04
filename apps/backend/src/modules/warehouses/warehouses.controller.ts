import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehouseDto } from './dto';

@Controller('api/v1/warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  async findAll(@Query() query: QueryWarehouseDto) {
    const result = await this.warehousesService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const warehouse = await this.warehousesService.findOne(id);
    return {
      success: true,
      data: warehouse,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWarehouseDto) {
    const warehouse = await this.warehousesService.create(dto);
    return {
      success: true,
      data: warehouse,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    const warehouse = await this.warehousesService.update(id, dto);
    return {
      success: true,
      data: warehouse,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.warehousesService.remove(id);
    return {
      success: true,
      data: { id },
    };
  }
}
