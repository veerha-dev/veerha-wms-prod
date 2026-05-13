import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { ShipmentsRepository } from './shipments.repository';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [InvoicesModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentsRepository],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
