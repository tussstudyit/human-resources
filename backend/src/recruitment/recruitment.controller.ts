import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import * as fs from 'fs';
import { JobStatus, Role } from '@prisma/client';
import { RecruitmentService } from './recruitment.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { ApplyJobDto } from './dto/apply-job.dto.js';
import { AiEvaluationDto } from './dto/ai-evaluation.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { HrOrApiKeyGuard } from './guards/hr-or-api-key.guard.js';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // 1. PUBLIC: Get all OPEN jobs
  @Get('jobs')
  async getJobs() {
    return this.recruitmentService.getPublicJobs();
  }

  // 1.1 PUBLIC / AUTH: Get recruitment stats for dashboard
  @Get('stats')
  async getStats() {
    return this.recruitmentService.getStats();
  }

  // 2. ADMIN/HR: Admin get jobs (filter by status OPEN | CLOSED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Get('admin/jobs')
  async getAdminJobs(@Query('status') status?: JobStatus) {
    return this.recruitmentService.getAdminJobs(status);
  }

  // 3. PUBLIC: Get single OPEN job by ID
  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return this.recruitmentService.getPublicJobById(id);
  }

  // 4. ADMIN/HR: Create a new job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Post('jobs')
  async createJob(@Body() dto: CreateJobDto) {
    return this.recruitmentService.createJob(dto);
  }

  // 5. ADMIN/HR: Update job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Patch('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.recruitmentService.updateJob(id, dto);
  }

  // 6. ADMIN/HR: Delete job post & associated CV files
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    return this.recruitmentService.deleteJob(id);
  }

  // 7. ADMIN/HR: Get candidates for a job post sorted by matchScore
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Get('jobs/:id/candidates')
  async getJobCandidates(@Param('id') id: string) {
    return this.recruitmentService.getJobCandidates(id);
  }

  // 8. ADMIN/HR: Re-evaluate candidate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Post('candidates/:id/re-evaluate')
  async reEvaluate(@Param('id') id: string) {
    return this.recruitmentService.reEvaluateCandidate(id);
  }

  // 8.1 ADMIN/HR: Schedule candidate interview & create Google Meet
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Post('candidates/:id/schedule-interview')
  async scheduleInterview(
    @Param('id') id: string,
    @Body('interviewType') interviewType?: string,
  ) {
    return this.recruitmentService.scheduleInterview(id, interviewType);
  }

  // 8.2 ADMIN/HR: Archive candidate into talent pool
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @Post('candidates/:id/talent-pool')
  async archiveTalentPool(
    @Param('id') id: string,
    @Body('scenario') scenario?: string,
  ) {
    return this.recruitmentService.archiveTalentPool(id, scenario);
  }

  // 9. PUBLIC: Apply for job with CV upload (memoryStorage, magic bytes check, rate-limited)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('file_cv', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype !== 'application/pdf' &&
          !file.originalname.toLowerCase().endsWith('.pdf')
        ) {
          return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async apply(
    @Body() dto: ApplyJobDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.recruitmentService.applyJob(dto, file);
  }

  // 10. n8n CALLBACK: AI Evaluation result callback
  @SkipThrottle()
  @UseGuards(ApiKeyGuard)
  @Patch('candidates/:id/ai-evaluation')
  async aiEvaluation(
    @Param('id') id: string,
    @Body() dto: AiEvaluationDto,
  ) {
    return this.recruitmentService.evaluateCandidate(id, dto);
  }

  // 11. HYBRID (HR JWT OR x-api-key): Stream CV file
  @SkipThrottle()
  @UseGuards(HrOrApiKeyGuard)
  @Get('candidates/:id/cv')
  async getCandidateCv(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { filePath, filename } = await this.recruitmentService.getCandidateCvPath(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming CV file' });
      }
    });
    stream.pipe(res);
  }

  // 12. PUBLIC: Handle candidate RSVP response from interview invite email
  @SkipThrottle()
  @Get('candidates/:id/rsvp')
  async candidateRsvp(
    @Param('id') id: string,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    const result = await this.recruitmentService.handleCandidateRsvp(id, status);
    const isConfirmed = result.status === 'CONFIRMED';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Xác Nhận Lịch Phỏng Vấn</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px 20px; text-align: center; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 36px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    <div style="font-size: 48px; margin-bottom: 16px;">${isConfirmed ? '🎉' : '📅'}</div>
    <h2 style="color: ${isConfirmed ? '#16a34a' : '#2563eb'}; margin-top: 0; font-size: 22px;">
      ${isConfirmed ? 'Đã Xác Nhận Tham Gia Phỏng Vấn' : 'Đã Ghi Nhận Yêu Cầu Dời Lịch'}
    </h2>
    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
      Chào bạn <strong>${result.candidateName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
      ${
        isConfirmed
          ? `Hệ thống đã ghi nhận bạn sẽ tham gia buổi phỏng vấn (${result.dateTimeFormatted}). Vui lòng kiểm tra email để cập nhật thông tin và đường dẫn Google Meet.`
          : 'Bộ phận Tuyển dụng đã tiếp nhận yêu cầu dời lịch của bạn và sẽ chủ động liên hệ lại sớm nhất để sắp xếp khung giờ phù hợp hơn.'
      }
    </p>
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
      Hệ Thống Tuyển Dụng Thông Minh • AI Recruitment Portal
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  // 13. PUBLIC: Handle Candidate Experience feedback rating (1-5 stars)
  @SkipThrottle()
  @Get('cx-feedback')
  async cxFeedback(
    @Query('candidateId') candidateId: string,
    @Query('score') score: string,
    @Res() res: Response,
  ) {
    const stars = parseInt(score, 10) || 5;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Khảo Sát Trải Nghiệm Tuyển Dụng</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px 20px; text-align: center; color: #1e293b;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 36px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    <div style="font-size: 36px; margin-bottom: 12px;">🌟</div>
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Cảm Ơn Đóng Góp Của Bạn!</h2>
    <p style="font-size: 15px; color: #475569; line-height: 1.6;">
      Chúng tôi đã ghi nhận đánh giá <strong>${'⭐'.repeat(Math.min(Math.max(stars, 1), 5))}</strong> từ bạn.
    </p>
    <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
      Ý kiến đóng góp quý báu này giúp đội ngũ nhân sự tiếp tục hoàn thiện và nâng cao chất lượng trải nghiệm ứng tuyển cho cộng đồng công nghệ.
    </p>
    <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
      HR Tech Enterprise • Talent Acquisition Team
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
