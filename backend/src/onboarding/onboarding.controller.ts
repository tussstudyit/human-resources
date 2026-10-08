import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('my-tasks')
  async getMyTasks(@CurrentUser() user: any) {
    return this.onboardingService.getUserTasks(user.id);
  }

  @Post('seed')
  async seedTasks(@CurrentUser() user: any) {
    return this.onboardingService.seedDefaultTasks(user.id);
  }

  @Patch('tasks/:id/toggle')
  async toggleTask(@Param('id') taskId: string, @CurrentUser() user: any) {
    return this.onboardingService.toggleTaskStatus(taskId, user.id);
  }
}
