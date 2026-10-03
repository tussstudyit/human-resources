import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('templates')
  getTemplates() {
    return this.onboardingService.getTemplates();
  }

  @Post('templates')
  createTemplate(@Body() body: { taskName: string; description?: string }) {
    return this.onboardingService.createTemplate(body);
  }

  @Post('hire/:candidateId')
  hireCandidate(@Param('candidateId') candidateId: string) {
    return this.onboardingService.hireCandidate(candidateId);
  }

  @Get('user-tasks/:userId')
  getUserTasks(@Param('userId') userId: string) {
    return this.onboardingService.getUserTasks(userId);
  }

  @Patch('tasks/:taskId')
  toggleTaskStatus(
    @Param('taskId') taskId: string,
    @Body() body: { isCompleted: boolean },
  ) {
    return this.onboardingService.toggleTaskStatus(taskId, body.isCompleted);
  }
}
