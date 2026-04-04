import { Module } from '@nestjs/common';
import { PickListsController } from './pick-lists.controller';
import { PickListsService } from './pick-lists.service';
import { PickListsRepository } from './pick-lists.repository';

@Module({
  controllers: [PickListsController],
  providers: [PickListsService, PickListsRepository],
  exports: [PickListsService],
})
export class PickListsModule {}
