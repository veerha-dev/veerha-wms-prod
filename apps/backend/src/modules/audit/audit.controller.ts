import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService, AuditQuery } from './audit.service';

@Controller('api/v1/audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  async findAll(@Query() query: AuditQuery) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }
}
