import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get('stats')
  async getStats() { return { success: true, data: await this.service.getStats() }; }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: QueryTaskDto, @Req() req: any) {
    const result = await this.service.findAll(query, req.user);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { return { success: true, data: await this.service.findOne(id) }; }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTaskDto, @Req() req: any) { return { success: true, data: await this.service.create(dto, req.user) }; }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) { return { success: true, data: await this.service.update(id, dto) }; }

  @Delete(':id')
  async remove(@Param('id') id: string) { await this.service.remove(id); return { success: true, data: { id } }; }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(@Param('id') id: string, @Body() body: { userId: string }) { return { success: true, data: await this.service.updateStatus(id, 'assigned', { assignedTo: body.userId }) }; }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'in_progress', { startedAt: new Date() }) }; }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string, @Body() body: { notes?: string }) { return { success: true, data: await this.service.updateStatus(id, 'completed', { completedAt: new Date(), description: body.notes }) }; }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'cancelled') }; }
}
