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
import { EvaluationService } from './evaluation.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { ApplyJobDto } from './dto/apply-job.dto.js';
import { AiEvaluationDto } from './dto/ai-evaluation.dto.js';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(private readonly prisma: PrismaService, private readonly evaluations: EvaluationService) {}

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
    const job = await this.prisma.jobPost.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        status: dto.status || JobStatus.OPEN,
      },
    });
    await this.evaluations.ensureRubric(job.id);
    return job;
  }

  // 5. HR ONLY: Update job post
  async updateJob(id: string, dto: UpdateJobDto) {
    const existing = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Job post not found');
    }
    const job = await this.prisma.jobPost.update({
      where: { id },
      data: dto,
    });
    await this.evaluations.ensureRubric(job.id);
    return job;
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

  // One query for the all-jobs board, including candidates of closed postings.
  async getAllCandidates() {
    return this.prisma.candidate.findMany({
      orderBy: { matchScore: { sort: 'desc', nulls: 'last' } },
    });
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
    const run = await this.evaluations.start(candidateId);
    const webhookUrl = process.env.N8N_CV_WEBHOOK || 'http://localhost:5679/webhook/process-cv';
    try {
      await axios.post(webhookUrl, { evaluationId: run.id }, {
        timeout: 10000, headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.N8N_API_KEY || '' },
      });
    } catch {
      await this.evaluations.dispatchFailed(run.id);
      this.logger.warn(`Evaluation ${run.id}: webhook acknowledgement unavailable; watchdog will reconcile`);
    }
    return run;
  }

  // Legacy callback remains addressable, but must never overwrite versioned evaluations.
  async evaluateCandidate(_id: string, _dto: AiEvaluationDto) {
    throw new ConflictException('Use the versioned evaluations/:id/result callback');
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

    const run = await this.triggerN8nCvWebhook(candidate.id, candidate.job);
    return { message: 'Đã tiếp nhận yêu cầu đánh giá.', candidateId: id, evaluationId: run.id, aiStatus: 'PENDING' };
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

  async deleteCandidate(id: string) {
    const removed = await this.prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${id} FOR UPDATE`;
      const candidate = await tx.candidate.findUnique({where:{id},include:{evaluations:{select:{status:true,events:{select:{type:true,data:true}}}}}});
      if (!candidate) throw new NotFoundException('Candidate not found');
      const processing = candidate.aiStatus === 'PENDING' || candidate.evaluations.some(run =>
        ['PENDING','PROCESSING'].includes(run.status) || run.events.some(event => {
          const data = event.data as Record<string,unknown> | null;
          return event.type.startsWith('DELIVERY') && ['PENDING','PROCESSING','UNKNOWN'].includes(String(data?.status));
        }));
      if (processing) throw new ConflictException('Hồ sơ đang được xử lý hoặc có yêu cầu gửi chưa xác nhận. Vui lòng kiểm tra trạng thái trước khi xóa.');
      const shared = await tx.candidate.count({where:{cvUrl:candidate.cvUrl,id:{not:id}}});
      await tx.candidate.delete({where:{id}});
      return {cvUrl:candidate.cvUrl,shared:shared>0};
    });
    let fileCleanupPending = false;
    if (!removed.shared) {
      try { await fs.promises.unlink(path.join(process.cwd(),'uploads','cv',path.basename(removed.cvUrl))); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          fileCleanupPending = true;
          this.logger.error(`Candidate ${id} deleted; CV file cleanup requires attention`);
        }
      }
    }
    return {success:true,id,fileCleanupPending};
  }

  // 13. HR & DASHBOARD: Aggregated recruitment & n8n metrics
  async getStats() {
    const [totalJobs, openJobs, candidates] = await Promise.all([
      this.prisma.jobPost.count(),
      this.prisma.jobPost.count({ where: { status: JobStatus.OPEN } }),
      this.prisma.candidate.findMany({
        include: {
          job: {
            select: { id: true, title: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    let pending = 0;
    let evaluated = 0;
    let interview = 0;
    let talentPool = 0;
    const rejected = 0;
    let failed = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    for (const c of candidates) {
      const parsed = c.parsedSkillsJson as any;
      let hasMeet = false;
      let hasPool = false;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (parsed.interviewSchedule && (parsed.interviewSchedule.googleMeetUrl || parsed.interviewSchedule.status === 'SCHEDULED')) {
          hasMeet = true;
        }
        if (parsed.talentPool && parsed.talentPool.tier) {
          hasPool = true;
        }
      }

      if (c.aiStatus === 'PENDING') {
        pending++;
      } else if (hasMeet) {
        interview++;
      } else if (hasPool) {
        talentPool++;
      } else if (c.aiStatus === 'FAILED') {
        failed++;
      } else {
        evaluated++;
      }

      if (c.matchScore !== null && c.matchScore !== undefined) {
        scoreSum += c.matchScore;
        scoreCount++;
      }
    }

    const avgMatchScore = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0;

    const recentEvaluations = candidates.slice(0, 5).map((c) => {
      const parsed = c.parsedSkillsJson as any;
      let skills: string[] = [];
      let stage: 'PENDING' | 'EVALUATED' | 'INTERVIEW' | 'TALENT_POOL' | 'REJECTED' = 'EVALUATED';
      let poolTier: string | undefined;
      let meetUrl: string | undefined;

      if (Array.isArray(parsed)) {
        skills = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.skills)) skills = parsed.skills;
        if (parsed.interviewSchedule?.googleMeetUrl || parsed.interviewSchedule?.status === 'SCHEDULED') {
          stage = 'INTERVIEW';
          meetUrl = parsed.interviewSchedule.googleMeetUrl;
        } else if (parsed.talentPool?.tier) {
          stage = 'TALENT_POOL';
          poolTier = parsed.talentPool.tier;
        }
      }

      if (c.aiStatus === 'PENDING') stage = 'PENDING';
      if (c.aiStatus === 'FAILED') stage = 'PENDING';

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        jobId: c.jobId,
        jobTitle: c.job?.title || 'Chưa phân loại',
        matchScore: c.matchScore,
        aiStatus: c.aiStatus,
        stage,
        poolTier,
        meetUrl,
        skills: skills.slice(0, 4),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    const engineHealthy = await axios.get(`${process.env.N8N_URL || 'http://localhost:5679'}/healthz`, { timeout: 1000 }).then(r => r.status === 200).catch(() => false);
    const agents = [
      {
        id: 'recruitment-agent',
        name: 'AI Recruitment Agent',
        roleTag: 'Tuyển dụng',
        status: engineHealthy ? 'ONLINE' as const : 'OFFLINE' as const,
        isLive: engineHealthy,
        summary: 'Tự động bóc tách CV, chấm điểm tương thích bằng Gemini + rubric & lên lịch phỏng vấn.',
        workflows: ['WF_04', 'WF_05', 'WF_06'],
        tasksProcessedCount: candidates.length,
        tasksProcessedLabel: `${candidates.length} hồ sơ đã tiếp nhận`,
        lastActive: candidates[0]?.updatedAt ? candidates[0].updatedAt.toISOString() : new Date().toISOString(),
      },
    ];

    return {
      totalJobs,
      openJobs,
      totalCandidates: candidates.length,
      avgMatchScore,
      pipeline: {
        pending,
        evaluated,
        interview,
        talentPool,
        rejected,
        failed,
      },
      recentEvaluations,
      agents,
    };
  }

  async getRecruitmentStats() {
    return this.getStats();
  }

  // 14. Schedule candidate interview & create Google Meet
  async scheduleInterview(id: string, interviewType: string = 'ONLINE') {
    return this.evaluations.followup(id, 'INTERVIEW', { interviewType });
  }

  async scheduleCandidateInterview(candidateId: string, interviewType: string = 'ONLINE') {
    return this.scheduleInterview(candidateId, interviewType);
  }

  // 15. Archive candidate into talent pool & send notification
  async archiveTalentPool(id: string, scenario: string = 'TOP_TALENT') {
    return this.evaluations.followup(id, 'TALENT_POOL', { stage: scenario });
  }

  async archiveCandidateTalentPool(candidateId: string, scenario?: string) {
    return this.archiveTalentPool(candidateId, scenario);
  }

  async rejectCandidate(id: string, scenario = 'CV_SCREENING') {
    return this.evaluations.followup(id, 'TALENT_POOL', {stage:scenario,decision:'REJECT'});
  }

  // 14. PUBLIC: Handle candidate RSVP response from interview invite email
  async handleCandidateRsvp(candidateId: string, status?: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const normalizedStatus = String(status).toUpperCase();
    if (!['CONFIRMED', 'RESCHEDULE', 'RESCHEDULE_REQUESTED'].includes(normalizedStatus)) throw new BadRequestException('Invalid RSVP status');
    const isReschedule = normalizedStatus !== 'CONFIRMED';
    const newStatus = isReschedule ? 'RESCHEDULE_REQUESTED' : 'CONFIRMED';

    const existingJson = (candidate.parsedSkillsJson as any) || {};
    const existingSchedule = existingJson.interviewSchedule || {};

    const updatedSchedule = {
      ...existingSchedule,
      rsvpStatus: newStatus,
      rsvpUpdatedAt: new Date().toISOString(),
    };

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        parsedSkillsJson: {
          ...existingJson,
          interviewSchedule: updatedSchedule,
        },
      },
    });

    return {
      candidateName: candidate.name,
      status: newStatus,
      dateTimeFormatted: existingSchedule.dateTimeFormatted || 'Thời gian đã hẹn',
    };
  }
}
