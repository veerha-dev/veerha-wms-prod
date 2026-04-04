import { Controller, Get, Post, Delete, Query, Body, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto';

@Controller('api/v1/reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  // ─── Report Configs (REAL persistence) ────────────────────
  @Get('configs')
  async getConfigs() { return { success: true, data: await this.service.getConfigs() }; }

  @Post('configs')
  async createConfig(@Body() body: any) { return { success: true, data: await this.service.createConfig(body) }; }

  @Delete('configs/:id')
  async deleteConfig(@Param('id') id: string) { return { success: true, data: await this.service.deleteConfig(id) }; }

  // ─── Report History (REAL persistence) ────────────────────
  @Get('history')
  async getHistory(@Query('limit') limit?: string) { return { success: true, data: await this.service.getHistory(parseInt(limit || '10')) }; }

  @Post('history')
  async logExecution(@Body() body: any) { return { success: true, data: await this.service.logExecution(body) }; }

  // ─── Report Endpoints ─────────────────────────────────────
  @Get('stock')
  async getStock(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getStockReport(query) }; }

  @Get('inventory')
  async getInventory(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getStockReport(query) }; }

  @Get('movements')
  async getMovements(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getMovementsReport(query) }; }

  @Get('purchase-register')
  async getPurchaseRegister(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getPurchaseRegister(query) }; }

  @Get('purchase-orders')
  async getPurchaseOrders(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getPurchaseRegister(query) }; }

  @Get('sales-register')
  async getSalesRegister(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getSalesRegister(query) }; }

  @Get('sales-orders')
  async getSalesOrders(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getSalesRegister(query) }; }

  @Get('grn')
  async getGrn(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getGrnReport(query) }; }

  @Get('expiry')
  async getExpiry(@Query() query: any) { return { success: true, data: await this.service.getExpiryReport(query) }; }

  @Get('low-stock')
  async getLowStock(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getLowStockReport(query) }; }

  @Get('warehouse-utilization')
  async getWarehouseUtilization(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getWarehouseUtilization(query) }; }

  @Get('audit-trail')
  async getAuditTrail(@Query() query: ReportQueryDto) { return { success: true, data: await this.service.getAuditTrail(query) }; }
}
