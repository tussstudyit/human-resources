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
      ? kpis.reduce((acc: number, k: any) => acc + (k.actualValue / (k.targetValue || 1)) * 100, 0) / totalKpis
      : 0;

    const avgFeedbackScore = feedbacks.length > 0
      ? feedbacks.reduce((acc: number, f: any) => acc + f.score, 0) / feedbacks.length
      : 0;

    return {
      totalKpis,
      avgCompletionPercentage: Math.round(avgCompletion),
      avgFeedbackScore: Number(avgFeedbackScore.toFixed(1)),
      kpis,
      feedbacks,
    };
  }

  // Ghi nhận phản hồi đánh giá 360 công khai từ biểu mẫu Web
  async createFeedbackPublic(dto: {
    userId?: string;
    revieweeId?: string;
    email?: string;
    employeeName?: string;
    score: number;
    comment?: string;
    period?: string;
  }) {
    let reviewee = null;
    const targetId = dto.revieweeId || dto.userId;
    if (targetId && targetId !== 'usr-emp' && targetId.length > 10) {
      reviewee = await this.prisma.user.findUnique({ where: { id: targetId } });
    }
    if (!reviewee && dto.email) {
      reviewee = await this.prisma.user.findUnique({ where: { email: dto.email.trim() } });
    }
    if (!reviewee && dto.employeeName) {
      // Chỉ tìm theo tên nếu có DUY NHẤT 1 nhân sự có tên này, tránh nhầm lẫn giữa các email trùng tên
      const matchingUsers = await this.prisma.user.findMany({
        where: { fullName: { equals: dto.employeeName.trim(), mode: 'insensitive' } },
      });
      if (matchingUsers.length === 1) {
        reviewee = matchingUsers[0];
      } else {
        console.warn(`[360 Feedback] Không thể xác định nhân sự duy nhất cho tên "${dto.employeeName}" vì có ${matchingUsers.length} tài khoản trùng tên. Bắt buộc cần email hoặc userId.`);
      }
    }

    if (!reviewee) {
      console.warn('[360 Feedback] Không tìm thấy nhân sự phù hợp với payload:', dto);
      return null;
    }

    const period = dto.period || '2026-Q4';

    // Nếu đã có đánh giá trong kỳ này -> cập nhật bản ghi đã nộp thay vì tạo trùng lặp
    const existing = await this.prisma.feedback.findFirst({
      where: { revieweeId: reviewee.id, period },
    });

    if (existing) {
      return this.prisma.feedback.update({
        where: { id: existing.id },
        data: {
          score: Number(dto.score) || existing.score,
          comment: dto.comment || existing.comment,
        },
      });
    }

    return this.prisma.feedback.create({
      data: {
        reviewerId: reviewee.id,
        revieweeId: reviewee.id,
        score: Number(dto.score) || 5,
        comment: dto.comment || 'Tự đánh giá qua biểu mẫu 360°',
        period,
      },
    });
  }

  // Lấy chi tiết đánh giá 360 đã nộp của nhân viên để hiển thị lên form khi xem lại
  async getFeedbackDetail(userId?: string, email?: string, period = '2026-Q4') {
    let user = null;
    if (userId && userId !== 'usr-emp' && userId.length > 10) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user && email) {
      user = await this.prisma.user.findUnique({ where: { email: email.trim() } });
    }
    if (!user) return null;

    const feedback = await this.prisma.feedback.findFirst({
      where: { revieweeId: user.id, period },
      orderBy: { createdAt: 'desc' },
    });

    if (!feedback) return null;

    return {
      feedbackId: feedback.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      period: feedback.period,
      score: feedback.score,
      comment: feedback.comment,
      submittedAt: feedback.createdAt,
    };
  }

  async getEmployeesForReview(period = '2026-Q4') {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      include: {
        department: true,
        feedbackReceived: {
          where: { period },
          select: { id: true, score: true, period: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return users.map((u, index) => {
      const hasFeedback = u.feedbackReceived && u.feedbackReceived.length > 0;
      const deptName = u.department?.name || 'Toàn công ty';
      const roleTitle = u.role === 'HR' ? 'HR Specialist' : (u.role === 'MANAGER' ? 'Manager' : 'Nhân sự');
      const token = Buffer.from(`${u.id}:${period}:static`).toString('base64url');
      const magicLink = `http://192.168.2.123:3000/bieu-mau-danh-gia-360.html?token=${token}&period=${period}&name=${encodeURIComponent(u.fullName)}&email=${encodeURIComponent(u.email)}&userId=${u.id}`;

      return {
        id: index + 1,
        userId: u.id,
        name: u.fullName,
        email: u.email,
        role: roleTitle,
        dept: deptName,
        status: hasFeedback ? 'Đã hoàn thành' : 'Chờ nộp',
        completed: hasFeedback,
        magicLink,
        reminded: false,
      };
    });
  }
}
