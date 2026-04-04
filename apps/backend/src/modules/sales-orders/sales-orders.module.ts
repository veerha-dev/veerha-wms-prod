import { Module } from '@nestjs/common';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersRepository } from './sales-orders.repository';

@Module({
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, SalesOrdersRepository],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
