import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách KPI của user
  async getUserKpis(userId: string) {
    return this.prisma.kpiMetric.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Thêm mới hoặc cập nhật KPI metric
  async upsertKpi(userId: string, dto: { metricName: string; targetValue: number; actualValue: number; period: string }) {
    return this.prisma.kpiMetric.create({
      data: {
        userId,
        metricName: dto.metricName,
        targetValue: Number(dto.targetValue),
        actualValue: Number(dto.actualValue),
        period: dto.period,
      },
    });
  }

  // Khởi tạo KPI mẫu nếu user chưa có dữ liệu KPI
  async seedDefaultKpis(userId: string) {
    const existingCount = await this.prisma.kpiMetric.count({ where: { userId } });
    if (existingCount > 0) return this.getUserKpis(userId);

    const defaultKpis = [
      { userId, metricName: 'Hoàn thành Task đúng hạn (%)', targetValue: 90, actualValue: 85, period: 'Q1-2026' },
      { userId, metricName: 'Số lượng Pull Requests đã Merge', targetValue: 15, actualValue: 12, period: 'Q1-2026' },
      { userId, metricName: 'Chất lượng code (Code Review score /10)', targetValue: 8.5, actualValue: 9.0, period: 'Q1-2026' },
    ];

    await this.prisma.kpiMetric.createMany({ data: defaultKpis });
    return this.getUserKpis(userId);
  }

  // Tạo đánh giá 360 feedback
  async createFeedback(reviewerId: string, dto: { revieweeId: string; score: number; comment?: string; period: string }) {
    return this.prisma.feedback.create({
      data: {
        reviewerId,
        revieweeId: dto.revieweeId,
        score: Number(dto.score),
        comment: dto.comment,
        period: dto.period,
      },
    });
  }

  // Lấy các đánh giá feedback mà user nhận được
  async getMyReceivedFeedbacks(userId: string) {
    return this.prisma.feedback.findMany({
      where: { revieweeId: userId },
      include: { reviewer: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tổng hợp dữ liệu Dashboard so sánh KPI
  async getDashboardSummary(userId: string) {
    const kpis = await this.getUserKpis(userId);
    const feedbacks = await this.getMyReceivedFeedbacks(userId);

    const totalKpis = kpis.length;
    const avgCompletion = totalKpis > 0
      ? kpis.reduce((acc, k) => acc + (k.actualValue / (k.targetValue || 1)) * 100, 0) / totalKpis
      : 0;

    const avgFeedbackScore = feedbacks.length > 0
      ? feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length
      : 0;

    return {
      totalKpis,
      avgCompletionPercentage: Math.round(avgCompletion),
      avgFeedbackScore: Number(avgFeedbackScore.toFixed(1)),
      kpis,
      feedbacks,
    };
  }
}
