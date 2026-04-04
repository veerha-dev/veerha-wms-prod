import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminRepository } from './super-admin.repository';
import { SuperAdminGuard } from './super-admin.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminRepository, SuperAdminGuard],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
