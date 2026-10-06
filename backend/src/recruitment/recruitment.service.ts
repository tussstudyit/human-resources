import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { ApplyJobDto } from './dto/apply-job.dto.js';
import { AiEvaluationDto } from './dto/ai-evaluation.dto.js';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. PUBLIC: Get all OPEN jobs
  async getPublicJobs() {
    return this.prisma.jobPost.findMany({
      where: { status: JobStatus.OPEN },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. PUBLIC: Get single OPEN job by ID
  async getPublicJobById(id: string) {
    const job = await this.prisma.jobPost.findUnique({
      where: { id },
    });
    if (!job || job.status !== JobStatus.OPEN) {
      throw new NotFoundException('Job post not found');
    }
    return job;
  }

  // 3. HR ONLY: Admin get jobs (optional status filter: OPEN | CLOSED)
  async getAdminJobs(status?: JobStatus) {
    const where = status ? { status } : {};
    return this.prisma.jobPost.findMany({
      where,
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. HR ONLY: Create a new job post
  async createJob(dto: CreateJobDto) {
    return this.prisma.jobPost.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        status: dto.status || JobStatus.OPEN,
      },
    });
  }

  // 5. HR ONLY: Update job post
  async updateJob(id: string, dto: UpdateJobDto) {
    const existing = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Job post not found');
    }
    return this.prisma.jobPost.update({
      where: { id },
      data: dto,
    });
  }

  // 6. HR ONLY: Delete job post and remove candidates' CV files from disk
  async deleteJob(id: string) {
    const existing = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Job post not found');
    }

    // Collect candidates' cvUrl values before deleting in DB
    const candidates = await this.prisma.candidate.findMany({
      where: { jobId: id },
      select: { cvUrl: true },
    });

    // Delete JobPost in DB (cascade deletes candidates in DB)
    await this.prisma.jobPost.delete({
      where: { id },
    });

    // Unlink the files from disk using safe path resolution (log errors, do not throw)
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
    for (const candidate of candidates) {
      if (candidate.cvUrl) {
        const filePath = path.join(uploadsDir, path.basename(candidate.cvUrl));
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        } catch (err: any) {
          this.logger.warn(`Failed to unlink CV file ${filePath}: ${err.message}`);
        }
      }
    }

    return { message: 'Job post deleted successfully' };
  }

  // 7. HR ONLY: Get candidates for a job, sorted by matchScore desc (nulls last)
  async getJobCandidates(jobId: string) {
    const existing = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!existing) {
      throw new NotFoundException('Job post not found');
    }

    return this.prisma.candidate.findMany({
      where: { jobId },
      orderBy: {
        matchScore: { sort: 'desc', nulls: 'last' },
      },
    });
  }

  // 8. PUBLIC: Apply for job with file buffer validation & atomic write
  async applyJob(dto: ApplyJobDto, file?: Express.Multer.File) {
    // 1. Verify file buffer exists
    if (!file || !file.buffer) {
      throw new BadRequestException('CV file (file_cv) is required');
    }

    // 2. Validate %PDF- magic bytes directly on buffer
    if (file.buffer.length < 5 || file.buffer.subarray(0, 5).toString('utf8') !== '%PDF-') {
      throw new BadRequestException('Invalid PDF file format (failed magic bytes check)');
    }

    // 3. Verify job exists
    const job = await this.prisma.jobPost.findUnique({
      where: { id: dto.jobId },
    });
    if (!job) {
      throw new NotFoundException('Job post not found');
    }

    // 4. Verify job is OPEN
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job post is closed for applications');
    }

    // 5. Verify no duplicate application for same email + jobId
    const existingCandidate = await this.prisma.candidate.findUnique({
      where: {
        email_jobId: {
          email: dto.email,
          jobId: dto.jobId,
        },
      },
    });
    if (existingCandidate) {
      throw new ConflictException('You have already applied for this job');
    }

    // 6. Write file to disk with unique uuid
    const filename = `${randomUUID()}.pdf`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
    const filePath = path.join(uploadsDir, path.basename(filename));

    await fs.promises.writeFile(filePath, file.buffer);

    // 7. Insert candidate record in DB; unlink file if DB insert fails
    let candidate;
    try {
      candidate = await this.prisma.candidate.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone || null,
          cvUrl: filename,
          jobId: job.id,
          aiStatus: 'PENDING',
        },
      });
    } catch (dbError: any) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (unlinkErr: any) {
        this.logger.warn(`Failed to clean up file ${filePath} after DB error: ${unlinkErr.message}`);
      }

      if (dbError.code === 'P2002') {
        throw new ConflictException('You have already applied for this job');
      }
      throw new InternalServerErrorException('Failed to submit application');
    }

    // 8. Trigger non-blocking async webhook to n8n
    this.triggerN8nCvWebhook(candidate.id, job).catch((err) => {
      this.logger.warn(`Unexpected error in triggerN8nCvWebhook: ${err.message}`);
    });

    return candidate;
  }

  // 9. Webhook dispatcher to n8n (async non-blocking with 10s timeout)
  async triggerN8nCvWebhook(
    candidateId: string,
    job: { title: string; description: string; requirements: string },
  ) {
    const webhookUrl = process.env.N8N_CV_WEBHOOK || 'http://localhost:5678/webhook/process-cv';
    const backendInternalUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';
    const fileUrl = `${backendInternalUrl}/recruitment/candidates/${candidateId}/cv`;

    const payload = {
      candidateId,
      fileUrl,
      jobTitle: job.title,
      jobDescription: job.description,
      jobRequirements: job.requirements,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (process.env.N8N_API_KEY) {
      headers['x-api-key'] = process.env.N8N_API_KEY;
    }

    try {
      this.logger.log(`Dispatching n8n CV webhook to ${webhookUrl} for candidate ${candidateId}`);
      await axios.post(webhookUrl, payload, { timeout: 10000, headers });
      this.logger.log(`Successfully dispatched CV webhook to n8n for candidate ${candidateId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send CV webhook to n8n for candidate ${candidateId}: ${error.message}`);
      // Conditionally mark FAILED only if still PENDING so it never overwrites DONE
      await this.prisma.candidate.updateMany({
        where: {
          id: candidateId,
          aiStatus: 'PENDING',
        },
        data: {
          aiStatus: 'FAILED',
        },
      });
    }
  }

  // 10. n8n CALLBACK: Update AI evaluation results
  async evaluateCandidate(id: string, dto: AiEvaluationDto) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: {
        matchScore: dto.matchScore,
        parsedSkillsJson: dto.parsedSkillsJson,
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        aiStatus: 'DONE',
      },
    });
  }

  // 11. HR ONLY: Re-evaluate candidate
  async reEvaluateCandidate(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Set aiStatus to PENDING
    await this.prisma.candidate.update({
      where: { id },
      data: { aiStatus: 'PENDING' },
    });

    // Trigger webhook asynchronously
    this.triggerN8nCvWebhook(candidate.id, candidate.job).catch((err) => {
      this.logger.warn(`Unexpected error in re-evaluate webhook: ${err.message}`);
    });

    return {
      message: 'Re-evaluation triggered successfully',
      candidateId: candidate.id,
      aiStatus: 'PENDING',
    };
  }

  // 12. Retrieve candidate CV file path for streaming
  async getCandidateCvPath(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'cv');
    const filePath = path.join(uploadsDir, path.basename(candidate.cvUrl));

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('CV file not found on disk');
    }

    return {
      filePath,
      filename: path.basename(candidate.cvUrl),
    };
  }
}
