import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplates() {
    return this.prisma.onboardingTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(data: { taskName: string; description?: string }) {
    return this.prisma.onboardingTemplate.create({
      data: {
        taskName: data.taskName,
        description: data.description,
      },
    });
  }

  async hireCandidate(candidateId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Không tìm thấy ứng viên');
    }

    if (candidate.status === 'HIRED') {
      throw new BadRequestException('Ứng viên này đã được tuyển dụng trước đó');
    }

    const templates = await this.prisma.onboardingTemplate.findMany({
      where: { isActive: true },
    });

    return this.prisma.$transaction(async (tx: any) => {
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: 'HIRED' },
      });

      let user = await tx.user.findUnique({
        where: { email: candidate.email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email: candidate.email,
            fullName: candidate.name,
            password: 'defaultPassword123@',
            role: 'EMPLOYEE',
          },
        });
      }

      if (templates.length > 0) {
        await tx.employeeOnboardingTask.createMany({
          data: templates.map((tpl: any) => ({
            userId: user.id,
            taskName: tpl.taskName,
            description: tpl.description,
          })),
        });
      }

      return {
        message: 'Tuyển dụng ứng viên thành công!',
        user,
      };
    });
  }

  async getUserTasks(userId: string) {
    return this.prisma.employeeOnboardingTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async toggleTaskStatus(taskId: string, isCompleted: boolean) {
    const task = await this.prisma.employeeOnboardingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy nhiệm vụ');
    }

    return this.prisma.employeeOnboardingTask.update({
      where: { id: taskId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }
}
