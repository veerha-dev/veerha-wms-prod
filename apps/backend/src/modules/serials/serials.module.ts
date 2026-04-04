import { Module } from '@nestjs/common';
import { SerialsController } from './serials.controller';
import { SerialsService } from './serials.service';
import { SerialsRepository } from './serials.repository';

@Module({
  controllers: [SerialsController],
  providers: [SerialsService, SerialsRepository],
  exports: [SerialsService, SerialsRepository],
})
export class SerialsModule {}
