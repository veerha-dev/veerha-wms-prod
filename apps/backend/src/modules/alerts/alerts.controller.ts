import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, QueryAlertDto } from './dto';

@Controller('api/v1/alerts')
export class AlertsController {
  constructor(private service: AlertsService) {}

  @Get()
  async findAll(@Query() query: QueryAlertDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get('summary')
  async getSummary() {
    const data = await this.service.getSummary();
    return { success: true, data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateAlertDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Post(':id/acknowledge')
  async acknowledge(@Param('id') id: string, @Body() body: { acknowledgedBy?: string }) {
    const data = await this.service.acknowledge(id, body.acknowledgedBy);
    return { success: true, data };
  }

  @Post('acknowledge-all')
  async acknowledgeAll(@Body() body: { acknowledgedBy?: string }) {
    const data = await this.service.acknowledgeAll(body.acknowledgedBy);
    return { success: true, data };
  }
}
