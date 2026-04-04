import { Module } from '@nestjs/common';
import { DamagedItemsController } from './damaged-items.controller';
import { DamagedItemsService } from './damaged-items.service';
import { DamagedItemsRepository } from './damaged-items.repository';
import { DatabaseModule } from '../../database/database.module';
import { SkusModule } from '../skus/skus.module';

@Module({
  imports: [DatabaseModule, SkusModule],
  controllers: [DamagedItemsController],
  providers: [DamagedItemsService, DamagedItemsRepository],
  exports: [DamagedItemsService],
})
export class DamagedItemsModule {}
