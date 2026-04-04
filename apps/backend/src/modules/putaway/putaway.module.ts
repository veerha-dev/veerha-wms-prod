import { Module } from '@nestjs/common';
import { PutawayController } from './putaway.controller';
import { PutawayService } from './putaway.service';
import { PutawayRepository } from './putaway.repository';

@Module({
  controllers: [PutawayController],
  providers: [PutawayService, PutawayRepository],
  exports: [PutawayService],
})
export class PutawayModule {}
