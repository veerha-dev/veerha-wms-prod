import { Module } from '@nestjs/common';
import { RacksController } from './racks.controller';
import { RacksService } from './racks.service';
import { RacksRepository } from './racks.repository';

@Module({
  controllers: [RacksController],
  providers: [RacksService, RacksRepository],
  exports: [RacksService],
})
export class RacksModule {}
