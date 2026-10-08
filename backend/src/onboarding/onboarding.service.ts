import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách task onboarding của 1 user
  async getUserTasks(userId: string) {
    return this.prisma.onboardingTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Khởi tạo các task onboarding mẫu cho user nếu chưa có
  async seedDefaultTasks(userId: string) {
    const existingCount = await this.prisma.onboardingTask.count({
      where: { userId },
    });

    if (existingCount > 0) {
      return this.getUserTasks(userId);
    }

    const defaultTasks = [
      {
        userId,
        title: 'Cập nhật thông tin cá nhân',
        description: 'Điền đầy đủ thông tin hồ sơ và số điện thoại liên hệ.',
      },
      {
        userId,
        title: 'Nhận tài khoản',
        description: 'Đăng nhập và nhận cấp tài khoản Jira, Slack, Email công ty.',
      },
      {
        userId,
        title: 'Tham gia buổi Orientation',
        description: 'Gặp gỡ HR Mentor và tìm hiểu quy trình làm việc của công ty.',
      },
    ];

    await this.prisma.onboardingTask.createMany({
      data: defaultTasks,
    });

    return this.getUserTasks(userId);
  }

  // Đánh dấu hoàn thành / chưa hoàn thành task
  async toggleTaskStatus(taskId: string, userId: string) {
    const task = await this.prisma.onboardingTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy task onboarding');
    }

    const updatedTask = await this.prisma.onboardingTask.update({
      where: { id: taskId },
      data: { isCompleted: !task.isCompleted },
      include: { user: true },
    });

    // Nếu task vừa hoàn thành và là task "Nhận tài khoản", gọi webhook n8n (WF_07)
    if (updatedTask.isCompleted && updatedTask.title.includes('Nhận tài khoản')) {
      this.triggerITProvisioningWorkflow(updatedTask);
    }

    return updatedTask;
  }

  // Hàm mô phỏng gọi n8n workflow IT Tool Provisioning
  private async triggerITProvisioningWorkflow(task: any) {
    const webhookUrl = process.env.N8N_IT_PROVISIONING_WEBHOOK_URL || 'http://localhost:5678/webhook/it-provisioning';
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          userId: task.userId,
          userEmail: task.user?.email,
          userName: task.user?.fullName,
          completedAt: new Date().toISOString(),
        }),
      });
      console.log(`[n8n Workflow] Dispatched IT Tool Provisioning for ${task.user?.fullName}`);
    } catch (error) {
      console.warn(`[n8n Workflow Warning] Could not reach n8n webhook: ${(error as any).message}`);
    }
  }
}

