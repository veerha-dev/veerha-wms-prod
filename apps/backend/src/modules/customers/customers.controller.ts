import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from './dto';

@Controller('api/v1/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  async findAll(@Query() query: QueryCustomerDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    return { success: true, data: item };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomerDto) {
    const item = await this.service.create(dto);
    return { success: true, data: item };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const item = await this.service.update(id, dto);
    return { success: true, data: item };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, data: { id } };
  }
}
