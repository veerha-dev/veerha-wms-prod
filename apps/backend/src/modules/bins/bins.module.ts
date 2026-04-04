import { Module } from '@nestjs/common';
import { BinsController } from './bins.controller';
import { BinsService } from './bins.service';
import { BinsRepository } from './bins.repository';

@Module({
  controllers: [BinsController],
  providers: [BinsService, BinsRepository],
  exports: [BinsService],
})
export class BinsModule {}
