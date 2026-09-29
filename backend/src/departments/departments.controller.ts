import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '@prisma/client';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // Xem danh sách phòng ban (công khai cho cả người dùng chưa login chọn khi đăng ký)
  @Get()
  async getDepartments() {
    return this.departmentsService.findAll();
  }

  // Chỉ HR mới có quyền tạo phòng ban mới (RBAC Guard)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Post()
  async createDepartment(@Body() body: { name: string; description?: string }) {
    return this.departmentsService.create(body.name, body.description);
  }
}
