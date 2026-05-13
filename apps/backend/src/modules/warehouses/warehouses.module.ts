import { Module } from '@nestjs/common';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { WarehousesRepository } from './warehouses.repository';
import { WarehousesLayoutService } from './warehouses-layout.service';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService, WarehousesRepository, WarehousesLayoutService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
