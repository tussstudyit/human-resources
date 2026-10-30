import { jwtSecret } from '../auth/jwt-secret.js';
import { EvaluationService } from './evaluation.service.js';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { HrOrApiKeyGuard } from './guards/hr-or-api-key.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [RecruitmentController],
  providers: [EvaluationService, RecruitmentService, ApiKeyGuard, HrOrApiKeyGuard],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
