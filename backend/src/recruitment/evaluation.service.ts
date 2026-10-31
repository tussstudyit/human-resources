import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  DEFAULT_WEIGHTS,
  normalizeSkill,
  validateExtraction,
  scoreExtraction,
} from './scoring.js';
import {
  ApproveRubricDto,
  EvaluationResultDto,
  DeliveryResultDto,
} from './dto/evaluation.dto.js';
import { signAction, verifyAction } from './action-links.js';
import { cleanJsonText } from './document-text.js';
import { automaticRequiredSkills } from './automatic-rubric.js';

const asJson = (value: unknown) =>
  cleanJsonText(value) as Prisma.InputJsonValue;
const object = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
const hash = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex');
const jobSnapshot = (job: {
  title: string;
  description: string;
  requirements: string;
}) => ({
  title: job.title,
  description: job.description,
  requirements: job.requirements,
});
function projectionMetadata(value: unknown) {
  const data = { ...object(value) };
  for (const key of [
    'salaryBenchmark',
    'practicalProjectScore',
    'practicalProjectHighlights',
    'cultureFit',
    'verificationTest',
    'systemScaleScore',
    'keywordStuffingFlag',
    'keywordStuffingReason',
    'githubAnalysis',
    'coreSkills',
    'secondarySkills',
    'recommendation',
  ])
    delete data[key];
  return data;
}

@Injectable()
export class EvaluationService implements OnModuleInit, OnModuleDestroy {
  private watchdog?: ReturnType<typeof setInterval>;
  private reconciling = false;
  onModuleInit() {
    this.watchdog = setInterval(async () => {
      if (this.reconciling) return;
      this.reconciling = true;
      try {
        await this.expireStaleRuns();
      } catch {
        Logger.warn('Evaluation reconciliation failed', 'EvaluationService');
      } finally {
        this.reconciling = false;
      }
    }, 60000);
    this.watchdog.unref();
  }
  onModuleDestroy() {
    if (this.watchdog) clearInterval(this.watchdog);
  }
  constructor(private readonly prisma: PrismaService) {}

  private async selectRubric(tx: Prisma.TransactionClient, job: {id:string;title:string;description:string;requirements:string}) {
    const snapshot = jobSnapshot(job), sourceHash = hash(JSON.stringify(snapshot));
    const versions = await tx.jobRubricVersion.findMany({where:{jobId:job.id,sourceHash},orderBy:{createdAt:'desc'}});
    const existing = versions.find(v=>v.approvedAt) || versions[0];
    if (existing) return existing;
    const requiredSkills = automaticRequiredSkills(job);
    if (!requiredSkills.length) return null;
    return tx.jobRubricVersion.create({data:{jobId:job.id,sourceHash,snapshot:asJson(snapshot),requiredSkills,weights:DEFAULT_WEIGHTS}});
  }

  async ensureRubric(jobId: string) {
    return this.prisma.$transaction(async tx=>{
      await tx.$queryRaw`SELECT id FROM job_posts WHERE id=${jobId} FOR UPDATE`;
      const job=await tx.jobPost.findUnique({where:{id:jobId}});
      if(!job)throw new NotFoundException('Job not found');
      return this.selectRubric(tx,job);
    });
  }

  async rubric(jobId: string) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    const snapshot = jobSnapshot(job),
      sourceHash = hash(JSON.stringify(snapshot));
    const versions = await this.prisma.jobRubricVersion.findMany({
      where: { jobId, sourceHash },
      orderBy: { createdAt: 'desc' },
    });
    return {
      jobId,
      sourceHash,
      snapshot,
      approved: versions.find((r) => r.approvedAt) || null,
      active: versions.find((r) => r.approvedAt) || versions[0] || null,
      source: versions.some(r=>r.approvedAt) ? 'HR' : versions.length ? 'AUTOMATIC' : null,
      suggestedSkills: automaticRequiredSkills(job),
      defaultWeights: DEFAULT_WEIGHTS,
    };
  }

  async approveRubric(jobId: string, dto: ApproveRubricDto, actorId: string) {
    const context = await this.rubric(jobId);
    const skills = [...new Set(dto.requiredSkills.map(normalizeSkill))];
    if (!skills.length || skills.some((s) => !s))
      throw new BadRequestException('Required skills cannot be empty');
    if (
      Object.keys(dto.weights).sort().join(',') !==
        Object.keys(DEFAULT_WEIGHTS).sort().join(',') ||
      Object.values(dto.weights).some(
        (v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100,
      ) ||
      Object.values(dto.weights).reduce((a, b) => a + b, 0) !== 100
    )
      throw new BadRequestException('Four criterion weights must total 100');
    return this.prisma.jobRubricVersion.create({
      data: {
        jobId,
        sourceHash: context.sourceHash,
        snapshot: context.snapshot,
        requiredSkills: skills,
        weights: dto.weights,
        approvedBy: actorId,
        approvedAt: new Date(),
      },
    });
  }

  async start(candidateId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${candidateId} FOR UPDATE`;
      let candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
        include: { job: true },
      });
      if (!candidate) throw new NotFoundException('Candidate not found');
      await tx.$queryRaw`SELECT id FROM job_posts WHERE id=${candidate.jobId} FOR UPDATE`;
      candidate = await tx.candidate.findUniqueOrThrow({where:{id:candidateId},include:{job:true}});
      const snapshot = jobSnapshot(candidate.job),
        sourceHash = hash(JSON.stringify(snapshot));
      const rubric = await this.selectRubric(tx, candidate.job);
      const bytes = await readFile(
        join(process.cwd(), 'uploads', 'cv', basename(candidate.cvUrl)),
      );
      const run = await tx.evaluationRun.create({
        data: {
          candidateId,
          rubricId: rubric?.id,
          cvHash: hash(bytes),
          snapshot: asJson({
            job: snapshot,
            sourceHash,
            rubric: rubric
              ? {
                  id: rubric.id,
                  weights: rubric.weights,
                  requiredSkills: rubric.requiredSkills,
                  source: rubric.approvedAt ? 'HR' : 'AUTOMATIC',
                }
              : null,
          }),
        },
      });
      await tx.candidate.update({
        where: { id: candidateId },
        data: {
          latestEvaluationId: run.id,
          aiStatus: 'PENDING',
          matchScore: null,
          parsedSkillsJson: asJson({
            ...projectionMetadata(candidate.parsedSkillsJson),
            skills: [],
            evaluation: {
              id: run.id,
              status: 'PENDING',
              approvalStatus: 'PENDING_HR',
            },
          }),
        },
      });
      await tx.evaluationEvent.create({
        data: { evaluationId: run.id, type: 'REQUESTED', data: {} },
      });
      return run;
    });
  }

  async claim(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const token = randomUUID();
      const claimed = await tx.evaluationRun.updateMany({
        where: { id, status: 'PENDING' },
        data: {
          status: 'PROCESSING',
          claimedAt: new Date(),
          claimToken: token,
        },
      });
      const run = await tx.evaluationRun.findUnique({
        where: { id },
        include: { candidate: true },
      });
      if (!run) throw new NotFoundException('Evaluation not found');
      if (!claimed.count)
        return { claimed: false, evaluationId: id, status: run.status };
      return {
        claimed: true,
        evaluationId: id,
        candidateId: run.candidateId,
        claimToken: token,
        cvHash: run.cvHash,
        candidateName: run.candidate.name,
        candidateEmail: run.candidate.email,
        jobId: run.candidate.jobId,
        ...object(run.snapshot),
        referenceDate: run.createdAt.toISOString(),
        promptVersion: run.promptVersion,
        modelId: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      };
    });
  }

  async complete(id: string, dto: EvaluationResultDto) {
    dto = cleanJsonText(dto);
    return this.prisma.$transaction(async (tx) => {
      const original = await tx.evaluationRun.findUnique({ where: { id } });
      if (!original) throw new NotFoundException('Evaluation not found');
      // All mutations of the candidate projection and run completion serialize on this row.
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${original.candidateId} FOR UPDATE`;
      const run = await tx.evaluationRun.findUniqueOrThrow({ where: { id } });
      if (run.claimToken !== dto.claimToken)
        throw new ConflictException('Claim mismatch');
      if (!['PENDING', 'PROCESSING'].includes(run.status))
        return { evaluationId: id, status: run.status, duplicate: true };
      const snapshot = object(run.snapshot),
        rubric = object(snapshot.rubric);
      let report: any = null,
        status = dto.status;
      if (dto.status === 'DONE') {
        if (!run.rubricId || !rubric.id || dto.cvHash !== run.cvHash)
          throw new BadRequestException('Rubric or document version mismatch');
        let extraction;
        try {
          extraction = validateExtraction(dto.extraction);
        } catch {
          throw new BadRequestException('Invalid extraction schema');
        }
        if (
          !dto.segments?.length ||
          dto.segments.some(
            (s) =>
              !s ||
              typeof s.id !== 'string' ||
              typeof s.text !== 'string' ||
              s.text.length > 2500,
          ) ||
          new Set(dto.segments.map((s) => s.id)).size !== dto.segments.length
        )
          throw new BadRequestException('Invalid evidence segments');
        const scored = scoreExtraction(
          extraction,
          dto.segments,
          rubric.requiredSkills,
          rubric.weights,
          run.createdAt.toISOString(),
        );
        const job = await tx.candidate.findUniqueOrThrow({
          where: { id: run.candidateId },
          include: { job: true },
        });
        const versionChanged =
          hash(JSON.stringify(jobSnapshot(job.job))) !== snapshot.sourceHash;
        if (versionChanged)
          scored.reviewReasons.push('JD_CHANGED_DURING_EVALUATION');
        status =
          scored.reviewReasons.length ||
          scored.recommendation === 'MANUAL_REVIEW'
            ? 'NEEDS_REVIEW'
            : 'DONE';
        const focusQuestions: Record<string, string> = {
          skills:
            'Bạn đã trực tiếp sử dụng các kỹ năng yêu cầu trong dự án nào?',
          projects:
            'Hãy giải thích một quyết định kỹ thuật, vai trò cá nhân và kết quả của dự án đã nêu.',
          production:
            'Hãy làm rõ bằng chứng triển khai, vận hành và số liệu quy mô hệ thống.',
          discipline:
            'Hãy mô tả cách kiểm thử, review và bảo đảm chất lượng trong dự án đã nêu.',
        };
        const focus = [
          ...new Set(
            dto.feedbackFocus ||
              scored.criteria.filter((c) => c.level < 3).map((c) => c.id),
          ),
        ].filter((id) => id in focusQuestions);
        report = {
          ...scored,
          interviewFocusPoints: focus.map((id) => focusQuestions[id]),
          recommendation: versionChanged
            ? 'MANUAL_REVIEW'
            : scored.recommendation,
          // AI prose is never used as factual summary or scoring input.
          extraction,
          segments: dto.segments,
          approvalStatus: 'PENDING_HR',
        };
      } else
        report = {
          matchScore: null,
          reviewReasons: [dto.errorCode || 'PROCESSING_INCOMPLETE'],
          approvalStatus: 'PENDING_HR',
        };
      await tx.evaluationRun.update({
        where: { id },
        data: {
          status,
          report: asJson(report),
          modelId: dto.modelId,
          errorCode: dto.errorCode,
          finishedAt: new Date(),
        },
      });
      const candidate = await tx.candidate.findUniqueOrThrow({
        where: { id: run.candidateId },
      });
      const current = candidate.latestEvaluationId === id;
      if (current) {
        const metadata = object(candidate.parsedSkillsJson);
        await tx.candidate.update({
          where: { id: candidate.id },
          data: {
            aiStatus: status === 'FAILED' ? 'FAILED' : 'DONE',
            matchScore: report.matchScore ?? null,
            experienceYears: report.experienceYears ?? null,
            summary:
              report.summary ||
              'Chưa có kết quả chấm điểm hợp lệ. Cần HR kiểm tra.',
            parsedSkillsJson: asJson({
              ...metadata,
              skills: report.skills || [],
              interviewFocusPoints: report.interviewFocusPoints || [],
              evaluation: {
                id,
                status,
                scoringVersion: 'hybrid-v1',
                criteria: report.criteria || [],
                evidenceCoverage: report.evidenceCoverage ?? 0,
                reviewReasons: report.reviewReasons,
                recommendation: report.recommendation || 'MANUAL_REVIEW',
                approvalStatus: 'PENDING_HR',
              },
            }),
          },
        });
      }
      await tx.evaluationEvent.create({
        data: {
          evaluationId: id,
          type: 'COMPLETED',
          data: { status, projectionUpdated: current },
        },
      });
      return {
        evaluationId: id,
        status,
        projectionUpdated: current,
        matchScore: report.matchScore,
      };
    });
  }

  async dispatchFailed(id: string) {
    // An HTTP timeout is ambiguous. Never overwrite a claimed or completed evaluation.
    return this.prisma.evaluationEvent.create({
      data: {
        evaluationId: id,
        type: 'DISPATCH_UNCONFIRMED',
        data: { reason: 'WEBHOOK_NOT_ACKNOWLEDGED' },
      },
    });
  }

  async history(candidateId: string) {
    return this.prisma.evaluationRun.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        status: true,
        rubricId: true,
        report: true,
        errorCode: true,
        modelId: true,
        promptVersion: true,
        createdAt: true,
        finishedAt: true,
        events: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, type: true, data: true, createdAt: true },
        },
      },
    });
  }

  async approve(id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const run = await tx.evaluationRun.findUnique({ where: { id } });
      if (!run) throw new NotFoundException('Evaluation not found');
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${run.candidateId} FOR UPDATE`;
      const candidate = await tx.candidate.findUniqueOrThrow({
        where: { id: run.candidateId },
        include: { job: true },
      });
      const report = object(run.report);
      if (
        candidate.latestEvaluationId !== id ||
        !['DONE', 'NEEDS_REVIEW'].includes(run.status) ||
        typeof report.matchScore !== 'number'
      )
        throw new ConflictException(
          'Only the current scored evaluation can be approved',
        );
      if (
        hash(JSON.stringify(jobSnapshot(candidate.job))) !==
        object(run.snapshot).sourceHash
      )
        throw new ConflictException('JD changed; re-evaluate before approving');
      await tx.evaluationRun.update({
        where: { id },
        data: { report: asJson({ ...report, approvalStatus: 'APPROVED' }) },
      });
      const metadata = object(candidate.parsedSkillsJson);
      await tx.candidate.update({
        where: { id: candidate.id },
        data: {
          parsedSkillsJson: asJson({
            ...metadata,
            evaluation: {
              ...object(metadata.evaluation),
              approvalStatus: 'APPROVED',
            },
          }),
        },
      });
      await tx.evaluationEvent.create({
        data: { evaluationId: id, type: 'HR_APPROVED', data: { actorId } },
      });
      return { success: true, evaluationId: id };
    });
  }

  async followup(
    candidateId: string,
    action: 'INTERVIEW' | 'TALENT_POOL',
    options: Record<string, unknown> = {},
  ) {
    const payload = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${candidateId} FOR UPDATE`;
      const candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
        include: { job: true },
      });
      if (!candidate?.latestEvaluationId)
        throw new ConflictException(
          'Evaluate and approve this candidate first',
        );
      const run = await tx.evaluationRun.findUniqueOrThrow({
        where: { id: candidate.latestEvaluationId },
      });
      if (object(run.report).approvalStatus !== 'APPROVED')
        throw new ConflictException('HR approval is required');
      if (
        hash(JSON.stringify(jobSnapshot(candidate.job))) !==
        object(run.snapshot).sourceHash
      )
        throw new ConflictException('JD changed; re-evaluate first');
      const key = `${run.id}:${action}`;
      const prior = await tx.evaluationEvent.findUnique({
        where: { deduplicationKey: key },
      });
      if (prior) {
        if(action==='TALENT_POOL'){
          const priorData=object(prior.data), priorDecision=object(priorData.options).decision || (object(priorData.metadata).status==='REJECTED'?'REJECT':'TALENT_POOL');
          if(priorDecision!==(options.decision||'TALENT_POOL'))throw new ConflictException('Hồ sơ đã có yêu cầu phản hồi WF_06 khác. Kiểm tra lịch sử để tránh gửi thư trùng.');
        }
        return { duplicate: true as const, event: prior };
      }
      await tx.evaluationEvent.create({
        data: {
          evaluationId: run.id,
          type: 'DELIVERY_REQUESTED',
          deduplicationKey: key,
          data: asJson({ action, status: 'PENDING', options }),
        },
      });
      return {
        duplicate: false as const,
        evaluationId: run.id,
        candidateId,
        name: candidate.name,
        email: candidate.email,
        jobTitle: candidate.job.title,
        matchScore: candidate.matchScore,
        parsedSkillsJson: candidate.parsedSkillsJson,
        idempotencyKey: key,
        hrApproved: true,
        ...options,
      };
    });
    if (payload.duplicate)
      return {
        success: true,
        message: 'Yêu cầu này đã được tiếp nhận; không gửi lặp.',
        delivery: payload.event,
      };
    const url =
      action === 'INTERVIEW'
        ? process.env.N8N_SCHEDULE_WEBHOOK
        : process.env.N8N_REJECTION_WEBHOOK;
    if (!url) {
      await this.delivery(payload.evaluationId!, {
        action,
        status: 'FAILED',
        metadata: { errorCode: 'WEBHOOK_NOT_CONFIGURED' },
      });
      throw new BadRequestException('Workflow is not configured');
    }
    try {
      await axios.post(url, payload, {
        timeout: 10000,
        headers: { 'x-api-key': process.env.N8N_API_KEY || '' },
      });
      return {
        success: true,
        message:
          'Workflow đã tiếp nhận yêu cầu. Trạng thái gửi được theo dõi riêng.',
        evaluationId: payload.evaluationId,
      };
    } catch {
      await this.delivery(payload.evaluationId!, {
        action,
        status: 'UNKNOWN',
        metadata: { errorCode: 'DELIVERY_NOT_ACKNOWLEDGED' },
      });
      return {
        success: false,
        message:
          'Chưa xác nhận kết quả workflow. Kiểm tra lịch sử trước khi thử lại.',
      };
    }
  }

  async claimDelivery(id: string, action: string) {
    if (!['INTERVIEW', 'TALENT_POOL'].includes(action))
      throw new BadRequestException('Invalid action');
    return this.prisma.$transaction(async (tx) => {
      const run = await tx.evaluationRun.findUnique({ where: { id } });
      if (!run) throw new NotFoundException('Evaluation not found');
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${run.candidateId} FOR UPDATE`;
      const candidate = await tx.candidate.findUniqueOrThrow({
        where: { id: run.candidateId },
        include: { job: true },
      });
      const event = await tx.evaluationEvent.findUnique({
        where: { deduplicationKey: `${id}:${action}` },
      });
      if (
        !event ||
        candidate.latestEvaluationId !== id ||
        object(run.report).approvalStatus !== 'APPROVED'
      )
        throw new ConflictException('Delivery is not approved');
      if (object(event.data).status !== 'PENDING')
        return { claimed: false, status: object(event.data).status };
      await tx.evaluationEvent.update({
        where: { id: event.id },
        data: { data: asJson({ ...object(event.data), status: 'PROCESSING' }) },
      });
      const publicBase = (
        process.env.PUBLIC_BACKEND_URL || 'http://localhost:3001'
      ).replace(/\/$/, '');
      return {
        claimed: true,
        evaluationId: id,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: candidate.job.title,
        skills: object(run.report).skills || [],
        options: object(event.data).options || {},
        rsvpUrl: `${publicBase}/recruitment/candidates/${candidate.id}/rsvp?token=${signAction(candidate.id, id, 'rsvp')}`,
        cxUrl: `${publicBase}/recruitment/cx-feedback?candidateId=${candidate.id}&token=${signAction(candidate.id, id, 'cx')}`,
      };
    });
  }

  async saveCx(candidateId: string, token: string, score: number) {
    const data = verifyAction(token, candidateId, 'cx');
    if (!Number.isInteger(score) || score < 1 || score > 5)
      throw new BadRequestException('Score must be 1–5');
    return this.prisma.evaluationEvent.upsert({
      where: { deduplicationKey: `${data.evaluationId}:CX` },
      create: {
        evaluationId: data.evaluationId,
        type: 'CX_FEEDBACK',
        deduplicationKey: `${data.evaluationId}:CX`,
        data: { score },
      },
      update: { data: { score } },
    });
  }

  async delivery(id: string, dto: DeliveryResultDto) {
    return this.prisma.$transaction(async (tx) => {
      const run = await tx.evaluationRun.findUnique({ where: { id } });
      if (!run) throw new NotFoundException('Evaluation not found');
      await tx.$queryRaw`SELECT id FROM candidates WHERE id=${run.candidateId} FOR UPDATE`;
      const event = await tx.evaluationEvent.findUnique({
        where: { deduplicationKey: `${id}:${dto.action}` },
      });
      if (!event) throw new ConflictException('Unrequested delivery');
      if (object(event.data).status === 'SENT')
        return { duplicate: true, status: 'SENT' };
      const metadata = object(dto.metadata);
      const rejection = dto.action==='TALENT_POOL' && object(object(event.data).options).decision==='REJECT';
      const safe =
        dto.action === 'INTERVIEW'
          ? {
              time: metadata.time,
              googleMeetUrl: metadata.googleMeetUrl,
              isRealGoogleMeet: !!metadata.isRealGoogleMeet,
              googleCalendarEventId: metadata.googleCalendarEventId,
              type: metadata.type,
              interviewer: metadata.interviewer,
              status: dto.status === 'SENT' ? 'SCHEDULED' : 'DELIVERY_FAILED',
            }
          : rejection ? {
              status:'REJECTED', rejectedAt:new Date().toISOString(),
              emailSent:dto.status==='SENT', scenario:metadata.scenario || object(object(event.data).options).stage || 'CV_SCREENING',
            } : {
              tier: metadata.tier || 'RETAINED_TALENT_POOL',
              status: 'ARCHIVED',
              archivedAt: new Date().toISOString(),
              emailSent: dto.status === 'SENT',
              reEngagementDate: metadata.reEngagementDate,
              scenario: metadata.scenario,
            };
      if (
        safe.googleMeetUrl &&
        (!safe.isRealGoogleMeet ||
          !/^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(
            String(safe.googleMeetUrl),
          ))
      ) {
        safe.googleMeetUrl = undefined;
        safe.isRealGoogleMeet = false;
      }
      await tx.evaluationEvent.update({
        where: { id: event.id },
        data: {
          data: asJson({
            ...object(event.data),
            action: dto.action,
            status: dto.status,
            metadata: safe,
          }),
        },
      });
      await tx.evaluationEvent.create({
        data: {
          evaluationId: id,
          type: 'DELIVERY_RESULT',
          data: asJson({ action: dto.action, status: dto.status }),
        },
      });
      const c = await tx.candidate.findUniqueOrThrow({
        where: { id: run.candidateId },
      });
      if (c.latestEvaluationId === id && dto.status === 'SENT') {
        const previous = object(c.parsedSkillsJson),
          key = dto.action === 'INTERVIEW' ? 'interviewSchedule' : rejection ? 'rejection' : 'talentPool';
        await tx.candidate.update({
          where: { id: c.id },
          data: {
            parsedSkillsJson: asJson({
              ...previous,
              rejection: undefined,
              ...(rejection ? {talentPool:undefined} : {}),
              [key]: { ...object(previous[key]), ...safe },
            }),
          },
        });
      }
      return { status: dto.status };
    });
  }

  async expireStaleRuns() {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    const runs = await this.prisma.evaluationRun.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { lt: cutoff },
      },
      take: 100,
    });
    for (const run of runs)
      await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM candidates WHERE id=${run.candidateId} FOR UPDATE`;
        const updated = await tx.evaluationRun.updateMany({
          where: { id: run.id, status: { in: ['PENDING', 'PROCESSING'] } },
          data: {
            status: 'FAILED',
            errorCode: 'PROCESSING_TIMEOUT',
            finishedAt: new Date(),
          },
        });
        if (!updated.count) return;
        await tx.candidate.updateMany({
          where: { id: run.candidateId, latestEvaluationId: run.id },
          data: { aiStatus: 'FAILED' },
        });
        await tx.evaluationEvent.create({
          data: { evaluationId: run.id, type: 'TIMEOUT', data: {} },
        });
      });
    return { checked: runs.length };
  }
}
