import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { HrOrApiKeyGuard } from './guards/hr-or-api-key.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hr_jwt_secret_super_key_2026_antigravity',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService, ApiKeyGuard, HrOrApiKeyGuard],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
