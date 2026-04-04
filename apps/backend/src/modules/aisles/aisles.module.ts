import { Module } from '@nestjs/common';
import { AislesController } from './aisles.controller';
import { AislesService } from './aisles.service';
import { AislesRepository } from './aisles.repository';

@Module({
  controllers: [AislesController],
  providers: [AislesService, AislesRepository],
  exports: [AislesService],
})
export class AislesModule {}
