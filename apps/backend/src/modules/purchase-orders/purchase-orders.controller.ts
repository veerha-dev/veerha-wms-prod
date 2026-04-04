import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  QueryPurchaseOrderDto,
} from './dto';

@Controller('api/v1/purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  @Get()
  async findAll(@Query() query: QueryPurchaseOrderDto) {
    const result = await this.purchaseOrdersService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('stats')
  async getStats() {
    const data = await this.purchaseOrdersService.getStats();
    return { success: true, data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.purchaseOrdersService.findById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto) {
    const data = await this.purchaseOrdersService.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    const data = await this.purchaseOrdersService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.purchaseOrdersService.delete(id);
    return { success: true, data };
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    const data = await this.purchaseOrdersService.submit(id);
    return { success: true, data };
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('approved_by') approvedBy?: string,
  ) {
    const data = await this.purchaseOrdersService.approve(id, approvedBy);
    return { success: true, data };
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    const data = await this.purchaseOrdersService.cancel(id);
    return { success: true, data };
  }
}
