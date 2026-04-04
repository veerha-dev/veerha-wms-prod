import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from './dto';

@Controller('api/v1/invoices')
export class InvoicesController {
  constructor(private service: InvoicesService) {}

  @Get('stats')
  async getStats(@Query('warehouseId') warehouseId?: string) {
    const data = await this.service.getStats(warehouseId);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: QueryInvoiceDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateInvoiceDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string; paidAmount?: number }) {
    const data = await this.service.updateStatus(id, body.status, body.paidAmount);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, data: { deleted: true } };
  }
}
