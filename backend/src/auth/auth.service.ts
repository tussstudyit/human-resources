import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Kiểm tra email đã tồn tại chưa
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // 2. Băm mật khẩu bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Tạo User trong cơ sở dữ liệu
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role || 'EMPLOYEE',
        departmentId: dto.departmentId || null,
      },
      include: {
        department: true,
      },
    });

    // 4. Bắn Webhook sang n8n để kích hoạt workflow gửi Welcome Email
    this.sendWelcomeWebhookToN8n(user).catch((err) => {
      this.logger.warn(`Không thể gửi Webhook tới n8n: ${err.message}`);
    });

    // 5. Cấp phát JWT token
    const token = await this.generateToken(user.id, user.email, user.role);

    const { password, ...userWithoutPassword } = user;
    return {
      message: 'Đăng ký tài khoản thành công',
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    // 1. Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa');
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 3. Cấp phát JWT token
    const token = await this.generateToken(user.id, user.email, user.role);

    const { password, ...userWithoutPassword } = user;
    return {
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }
    const { password, ...result } = user;
    return result;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ password, ...u }) => u);
  }

  private async generateToken(userId: string, email: string, role: string): Promise<string> {
    const payload = { sub: userId, email, role };
    return this.jwtService.signAsync(payload);
  }

  private async sendWelcomeWebhookToN8n(user: any) {
    const webhookUrl = process.env.N8N_WELCOME_WEBHOOK_URL;
    if (!webhookUrl) return;

    this.logger.log(`Đang gửi Webhook User Register tới n8n: ${webhookUrl}`);
    const payload = {
      event: 'USER_REGISTERED',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department?.name || 'Chưa phân bổ',
      },
    };

    try {
      await axios.post(webhookUrl, payload, { timeout: 4000 });
      this.logger.log(`Đã bắn Webhook sang n8n thành công cho user: ${user.email}`);
    } catch (error: any) {
      this.logger.warn(`Lỗi khi bắn Webhook tới n8n: ${error.message}`);
    }
  }
}
