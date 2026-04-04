import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DamagedItemsService } from './damaged-items.service';
import { CreateDamagedItemDto, UpdateDamagedItemDto, QueryDamagedItemDto } from './dto';

@ApiTags('Damaged Items')
@Controller('api/v1/damaged-items')
@ApiBearerAuth('JWT-auth')
export class DamagedItemsController {
  constructor(private service: DamagedItemsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List damaged items',
    description: 'Retrieve a paginated list of all damaged goods with optional filtering'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'disposition', required: false, type: String, description: 'Filter by disposition status' })
  @ApiQuery({ name: 'skuId', required: false, type: String, description: 'Filter by SKU ID' })
  @ApiResponse({ status: 200, description: 'Damaged items retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: QueryDamagedItemDto) {
    const result = await this.service.findAll(query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get damaged item by ID',
    description: 'Retrieve detailed information about a specific damaged item'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Damaged item UUID' })
  @ApiResponse({ status: 200, description: 'Damaged item found' })
  @ApiResponse({ status: 404, description: 'Damaged item not found' })
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ 
    summary: 'Report damaged item',
    description: 'Create a new damaged goods report. Automatically adjusts stock levels.'
  })
  @ApiResponse({ status: 201, description: 'Damaged item reported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'SKU or batch not found' })
  async create(@Body() dto: CreateDamagedItemDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update damaged item',
    description: 'Update disposition decision or other details of a damaged item'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Damaged item UUID' })
  @ApiResponse({ status: 200, description: 'Damaged item updated successfully' })
  @ApiResponse({ status: 404, description: 'Damaged item not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(@Param('id') id: string, @Body() dto: UpdateDamagedItemDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Post(':id/dispose')
  @ApiOperation({ 
    summary: 'Dispose damaged item',
    description: 'Mark a damaged item as disposed and remove from inventory'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Damaged item UUID' })
  @ApiResponse({ status: 200, description: 'Damaged item disposed successfully' })
  @ApiResponse({ status: 404, description: 'Damaged item not found' })
  @ApiResponse({ status: 409, description: 'Item already disposed' })
  async dispose(@Param('id') id: string) {
    const data = await this.service.dispose(id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete damaged item record',
    description: 'Remove a damaged item record from the system'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Damaged item UUID' })
  @ApiResponse({ status: 200, description: 'Damaged item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Damaged item not found' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { success: true, data: { deleted: true } };
  }
}
