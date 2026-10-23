import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
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

  // Hàm gọi n8n workflow IT Tool Provisioning (WF_07)
  private async triggerITProvisioningWorkflow(task: any) {
    const n8nBase = process.env.N8N_URL || 'http://localhost:5679';
    const payload = {
      taskId: task.id,
      userId: task.userId,
      userEmail: task.user?.email || 'newhire@company.vn',
      fullName: task.user?.fullName || 'Nhân sự mới',
      department: task.user?.department?.name || 'Tech',
      role: task.user?.role || 'EMPLOYEE',
      completedAt: new Date().toISOString(),
    };

    try {
      // 1. Thử webhook-test (khi người dùng bấm "Execute workflow" trong giao diện n8n)
      try {
        await axios.post(`${n8nBase}/webhook-test/it-provisioning`, payload, { timeout: 15000 });
        console.log(`[n8n Workflow Test] Dispatched IT Tool Provisioning (Test mode) for ${payload.fullName}`);
        return;
      } catch (testErr: any) {
        if (testErr?.response?.status === 404) {
          // 2. Không ở chế độ test, gọi production webhook
          await axios.post(`${n8nBase}/webhook/it-provisioning`, payload, { timeout: 15000 });
          console.log(`[n8n Workflow Prod] Dispatched IT Tool Provisioning (Production) for ${payload.fullName}`);
          return;
        }
        throw testErr;
      }
    } catch (error) {
      console.warn(`[n8n Workflow Warning] Could not reach n8n webhook: ${(error as any).message}`);
    }
  }
}

