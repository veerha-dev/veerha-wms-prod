import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';

@Controller('api/v1/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get('status')
  async getStatus() {
    const data = await this.service.getStatus();
    return { success: true, data };
  }

  @Post('complete')
  async complete() {
    const data = await this.service.markComplete();
    return { success: true, data };
  }

  @Post('reset')
  async reset() {
    const data = await this.service.reset();
    return { success: true, data };
  }
}
