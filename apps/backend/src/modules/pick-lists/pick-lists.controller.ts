import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PickListsService } from './pick-lists.service';
import { CreatePickListDto, GeneratePickListDto, UpdatePickListDto, QueryPickListDto } from './dto';

@Controller('api/v1/pick-lists')
export class PickListsController {
  constructor(private readonly service: PickListsService) {}

  @Get('stats')
  async getStats() { return { success: true, data: await this.service.getStats() }; }

  @Get()
  async findAll(@Query() query: QueryPickListDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { return { success: true, data: await this.service.findOne(id) }; }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePickListDto) { return { success: true, data: await this.service.create(dto) }; }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePickListDto) { return { success: true, data: await this.service.update(id, dto) }; }

  @Delete(':id')
  async remove(@Param('id') id: string) { await this.service.remove(id); return { success: true, data: { id } }; }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() dto: GeneratePickListDto) { return { success: true, data: await this.service.generate(dto) }; }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(@Param('id') id: string, @Body() body: { userId: string }) { return { success: true, data: await this.service.updateStatus(id, 'assigned', { assignedTo: body.userId }) }; }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'in_progress', { startedAt: new Date() }) }; }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id') id: string) { return { success: true, data: await this.service.updateStatus(id, 'completed', { completedAt: new Date() }) }; }

  @Post(':id/pick/:itemId')
  @HttpCode(HttpStatus.OK)
  async pickItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() body: { quantityPicked: number }) { return { success: true, data: { id, itemId, quantityPicked: body.quantityPicked } }; }
}
