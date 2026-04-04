import { Module } from '@nestjs/common';
import { CycleCountsController } from './cycle-counts.controller';
import { CycleCountsService } from './cycle-counts.service';
import { CycleCountsRepository } from './cycle-counts.repository';

@Module({
  controllers: [CycleCountsController],
  providers: [CycleCountsService, CycleCountsRepository],
  exports: [CycleCountsService],
})
export class CycleCountsModule {}
