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
import { EvaluationService } from './evaluation.service.js';
import {
  ApproveRubricDto,
  EvaluationResultDto,
  DeliveryResultDto,
} from './dto/evaluation.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { verifyAction } from './action-links.js';
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
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly evaluations: EvaluationService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Get('jobs/:id/rubric')
  rubric(@Param('id') id: string) {
    return this.evaluations.rubric(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Post('jobs/:id/rubric/approve')
  approveRubric(
    @Param('id') id: string,
    @Body() dto: ApproveRubricDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.evaluations.approveRubric(id, dto, actorId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Get('candidates/:id/evaluations')
  history(@Param('id') id: string) {
    return this.evaluations.history(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Post('evaluations/:id/approve')
  approveEvaluation(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
  ) {
    return this.evaluations.approve(id, actorId);
  }

  @SkipThrottle()
  @UseGuards(ApiKeyGuard)
  @Post('evaluations/:id/claim')
  claim(@Param('id') id: string) {
    return this.evaluations.claim(id);
  }

  @SkipThrottle()
  @UseGuards(ApiKeyGuard)
  @Post('evaluations/:id/result')
  complete(@Param('id') id: string, @Body() dto: EvaluationResultDto) {
    return this.evaluations.complete(id, dto);
  }

  @SkipThrottle()
  @UseGuards(ApiKeyGuard)
  @Post('evaluations/:id/delivery')
  delivery(@Param('id') id: string, @Body() dto: DeliveryResultDto) {
    return this.evaluations.delivery(id, dto);
  }

  @SkipThrottle()
  @UseGuards(ApiKeyGuard)
  @Post('evaluations/:id/delivery/claim')
  claimDelivery(@Param('id') id: string, @Body('action') action: string) {
    return this.evaluations.claimDelivery(id, action);
  }

  @UseGuards(ApiKeyGuard)
  @Post('evaluations/reconcile-stale')
  reconcile() {
    return this.evaluations.expireStaleRuns();
  }

  // 1. PUBLIC: Get all OPEN jobs
  @Get('jobs')
  async getJobs() {
    return this.recruitmentService.getPublicJobs();
  }

  // 1.1 PUBLIC / AUTH: Get recruitment stats for dashboard
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Get('stats')
  async getStats() {
    return this.recruitmentService.getStats();
  }

  // 2. ADMIN/HR: Admin get jobs (filter by status OPEN | CLOSED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
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
  @Roles(Role.HR, Role.MANAGER)
  @Post('jobs')
  async createJob(@Body() dto: CreateJobDto) {
    return this.recruitmentService.createJob(dto);
  }

  // 5. ADMIN/HR: Update job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Patch('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.recruitmentService.updateJob(id, dto);
  }

  // 6. ADMIN/HR: Delete job post & associated CV files
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    return this.recruitmentService.deleteJob(id);
  }

  // 7. ADMIN/HR: Get candidates for a job post sorted by matchScore
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Get('jobs/:id/candidates')
  async getJobCandidates(@Param('id') id: string) {
    return this.recruitmentService.getJobCandidates(id);
  }

  // 8. ADMIN/HR: Re-evaluate candidate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Post('candidates/:id/re-evaluate')
  async reEvaluate(@Param('id') id: string) {
    return this.recruitmentService.reEvaluateCandidate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Delete('candidates/:id')
  async deleteCandidate(@Param('id') id: string) {
    return this.recruitmentService.deleteCandidate(id);
  }

  // 8.1 ADMIN/HR: Schedule candidate interview & create Google Meet
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Post('candidates/:id/schedule-interview')
  async scheduleInterview(
    @Param('id') id: string,
    @Body('interviewType') interviewType?: string,
  ) {
    return this.recruitmentService.scheduleInterview(id, interviewType);
  }

  // 8.2 ADMIN/HR: Archive candidate into talent pool
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Post('candidates/:id/talent-pool')
  async archiveTalentPool(
    @Param('id') id: string,
    @Body('scenario') scenario?: string,
  ) {
    return this.recruitmentService.archiveTalentPool(id, scenario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.MANAGER)
  @Post('candidates/:id/reject')
  async rejectCandidate(@Param('id') id: string, @Body('scenario') scenario?: string) {
    return this.recruitmentService.rejectCandidate(id, scenario);
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
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
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
  async aiEvaluation(@Param('id') id: string, @Body() dto: AiEvaluationDto) {
    return this.recruitmentService.evaluateCandidate(id, dto);
  }

  // 11. HYBRID (HR JWT OR x-api-key): Stream CV file
  @SkipThrottle()
  @UseGuards(HrOrApiKeyGuard)
  @Get('candidates/:id/cv')
  async getCandidateCv(@Param('id') id: string, @Res() res: Response) {
    const { filePath, filename } =
      await this.recruitmentService.getCandidateCvPath(id);

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

  // GET only renders a confirmation form. Mail scanners cannot change state.
  @Get('candidates/:id/rsvp')
  candidateRsvp(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    verifyAction(token, id, 'rsvp');
    res
      .type('html')
      .send(
        actionForm(
          'Xác nhận lịch phỏng vấn',
          `/recruitment/candidates/${encodeURIComponent(id)}/rsvp`,
          token,
          '<button name="status" value="CONFIRMED">Xác nhận tham gia</button><button name="status" value="RESCHEDULE">Đề nghị dời lịch</button>',
        ),
      );
  }

  @Post('candidates/:id/rsvp')
  async submitRsvp(
    @Param('id') id: string,
    @Body('token') token: string,
    @Body('status') status: string,
    @Res() res: Response,
  ) {
    verifyAction(token, id, 'rsvp');
    const result = await this.recruitmentService.handleCandidateRsvp(
      id,
      status,
    );
    res
      .type('html')
      .send(
        actionPage(
          'Đã ghi nhận phản hồi',
          result.status === 'CONFIRMED'
            ? 'Bạn đã xác nhận tham gia.'
            : 'HR sẽ liên hệ để sắp xếp lại lịch.',
        ),
      );
  }

  @Get('cx-feedback')
  cxFeedback(
    @Query('candidateId') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    verifyAction(token, id, 'cx');
    res
      .type('html')
      .send(
        actionForm(
          'Đánh giá trải nghiệm tuyển dụng',
          '/recruitment/cx-feedback?candidateId=' + encodeURIComponent(id),
          token,
          '<label for="score">Mức hài lòng (1–5)</label><select id="score" name="score">' +
            [1, 2, 3, 4, 5]
              .map((n) => `<option value="${n}">${n}</option>`)
              .join('') +
            '</select><button>Gửi đánh giá</button>',
        ),
      );
  }

  @Post('cx-feedback')
  async submitCx(
    @Query('candidateId') id: string,
    @Body('token') token: string,
    @Body('score') score: string,
    @Res() res: Response,
  ) {
    await this.evaluations.saveCx(id, token, Number(score));
    res.type('html').send(actionPage('Cảm ơn bạn', 'Đánh giá đã được lưu.'));
  }
}

function escapeHtml(value: string) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
}
function actionPage(title: string, content: string) {
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><body style="font:16px system-ui;max-width:600px;margin:60px auto;padding:24px"><h1>${escapeHtml(title)}</h1>${content}</body></html>`;
}
function actionForm(
  title: string,
  action: string,
  token: string,
  controls: string,
) {
  return actionPage(
    title,
    `<form method="post" action="${escapeHtml(action)}"><input type="hidden" name="token" value="${escapeHtml(token)}">${controls}</form>`,
  );
}
