import { Module } from '@nestjs/common';
import { SkusController } from './skus.controller';
import { SkusService } from './skus.service';
import { SkusRepository } from './skus.repository';

@Module({
  controllers: [SkusController],
  providers: [SkusService, SkusRepository],
  exports: [SkusService, SkusRepository],
})
export class SkusModule {}
