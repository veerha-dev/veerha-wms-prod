import { Module } from '@nestjs/common';
import { QcController } from './qc.controller';
import { QcService } from './qc.service';
import { QcRepository } from './qc.repository';

@Module({
  controllers: [QcController],
  providers: [QcService, QcRepository],
  exports: [QcService],
})
export class QcModule {}
