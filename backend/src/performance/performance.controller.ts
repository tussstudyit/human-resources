import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('my-kpis')
  async getMyKpis(@CurrentUser() user: any) {
    return this.performanceService.getUserKpis(user.id);
  }

  @Post('seed-kpis')
  async seedKpis(@CurrentUser() user: any) {
    return this.performanceService.seedDefaultKpis(user.id);
  }

  @Post('kpis')
  async addKpi(
    @CurrentUser() user: any,
    @Body() body: { metricName: string; targetValue: number; actualValue: number; period: string },
  ) {
    return this.performanceService.upsertKpi(user.id, body);
  }

  @Post('feedback')
  async giveFeedback(
    @CurrentUser() user: any,
    @Body() body: { revieweeId: string; score: number; comment?: string; period: string },
  ) {
    return this.performanceService.createFeedback(user.id, body);
  }

  @Get('my-feedbacks')
  async getMyFeedbacks(@CurrentUser() user: any) {
    return this.performanceService.getMyReceivedFeedbacks(user.id);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.performanceService.getDashboardSummary(user.id);
  }
}
