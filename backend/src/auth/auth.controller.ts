import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  // Route kiểm tra phân quyền RBAC: Chỉ HR mới được truy cập
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Get('hr-protected-test')
  async testHrOnly(@CurrentUser() user: any) {
    return {
      message: 'Chúc mừng! Bạn đã truy cập route bảo mật dành riêng cho HR thành công!',
      accessedBy: user.email,
      role: user.role,
    };
  }
}
