import { Module } from '@nestjs/common';
import { GrnController } from './grn.controller';
import { GrnService } from './grn.service';
import { GrnRepository } from './grn.repository';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [InvoicesModule],
  controllers: [GrnController],
  providers: [GrnService, GrnRepository],
  exports: [GrnService],
})
export class GrnModule {}
