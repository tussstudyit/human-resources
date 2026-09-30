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

  // 2. HR ONLY: Admin get jobs (filter by status OPEN | CLOSED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Get('admin/jobs')
  async getAdminJobs(@Query('status') status?: JobStatus) {
    return this.recruitmentService.getAdminJobs(status);
  }

  // 3. PUBLIC: Get single OPEN job by ID
  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return this.recruitmentService.getPublicJobById(id);
  }

  // 4. HR ONLY: Create a new job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Post('jobs')
  async createJob(@Body() dto: CreateJobDto) {
    return this.recruitmentService.createJob(dto);
  }

  // 5. HR ONLY: Update job post
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Patch('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.recruitmentService.updateJob(id, dto);
  }

  // 6. HR ONLY: Delete job post & associated CV files
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    return this.recruitmentService.deleteJob(id);
  }

  // 7. HR ONLY: Get candidates for a job post sorted by matchScore
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Get('jobs/:id/candidates')
  async getJobCandidates(@Param('id') id: string) {
    return this.recruitmentService.getJobCandidates(id);
  }

  // 8. HR ONLY: Re-evaluate candidate
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR)
  @Post('candidates/:id/re-evaluate')
  async reEvaluate(@Param('id') id: string) {
    return this.recruitmentService.reEvaluateCandidate(id);
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
}
