import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('employees')
  async getEmployeesForReview() {
    return this.performanceService.getEmployeesForReview();
  }

  @Post('feedback-public')
  async submitPublicFeedback(@Body() body: any) {
    return this.performanceService.createFeedbackPublic(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-kpis')
  async getMyKpis(@CurrentUser() user: any) {
    return this.performanceService.getUserKpis(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('seed-kpis')
  async seedKpis(@CurrentUser() user: any) {
    return this.performanceService.seedDefaultKpis(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kpis')
  async addKpi(
    @CurrentUser() user: any,
    @Body() body: { metricName: string; targetValue: number; actualValue: number; period: string },
  ) {
    return this.performanceService.upsertKpi(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('feedback')
  async giveFeedback(
    @CurrentUser() user: any,
    @Body() body: { revieweeId: string; score: number; comment?: string; period: string },
  ) {
    return this.performanceService.createFeedback(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-feedbacks')
  async getMyFeedbacks(@CurrentUser() user: any) {
    return this.performanceService.getMyReceivedFeedbacks(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.performanceService.getDashboardSummary(user.id);
  }
}
