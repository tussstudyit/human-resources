import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { RecruitmentController } from './recruitment.controller.js';
import { RecruitmentService } from './recruitment.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

describe('All-job candidate list', () => {
  it('requires authenticated HR or manager access', () => {
    const route = RecruitmentController.prototype.getAllCandidates;
    expect(Reflect.getMetadata(GUARDS_METADATA, route)).toEqual([JwtAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata('roles', route)).toEqual(['HR', 'MANAGER']);
  });

  it('loads candidates across jobs in one query, with unscored profiles last', async () => {
    const rows = [{ id: 'scored', jobId: 'closed-job', matchScore: 75 }, { id: 'pending', jobId: 'open-job', matchScore: null }];
    const findMany = vi.fn().mockResolvedValue(rows);
    const service = new RecruitmentService({ candidate: { findMany } } as never, {} as never);
    expect(await service.getAllCandidates()).toEqual(rows);
    expect(findMany).toHaveBeenCalledExactlyOnceWith({
      orderBy: { matchScore: { sort: 'desc', nulls: 'last' } },
    });
  });
});
