import { ConflictException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DepartmentsService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  // Tự động tạo sẵn một số phòng ban mẫu khi khởi động ứng dụng
  async onApplicationBootstrap() {
    const count = await this.prisma.department.count();
    if (count === 0) {
      await this.prisma.department.createMany({
        data: [
          { name: 'Phòng Nhân sự (HR Department)', description: 'Quản trị nhân lực, tuyển dụng và đào tạo' },
          { name: 'Phòng Kỹ thuật (Engineering & AI)', description: 'Nghiên cứu và phát triển hệ thống Agentic AI' },
          { name: 'Phòng Kinh doanh & Tiếp thị (Sales & Marketing)', description: 'Mở rộng thị trường và tiếp cận khách hàng' },
          { name: 'Phòng Vận hành (Operations)', description: 'Đảm bảo quy trình vận hành toàn công ty' },
        ],
      });
      console.log(' Đã khởi tạo dữ liệu mẫu cho bảng departments');
    }
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, description?: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException('Tên phòng ban đã tồn tại');
    }
    return this.prisma.department.create({
      data: { name, description },
    });
  }
}
