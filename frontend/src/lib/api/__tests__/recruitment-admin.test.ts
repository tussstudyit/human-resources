import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobCandidates,
  reEvaluateCandidate,
  fetchCandidateCvBlob,
} from '../recruitment';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Recruitment Admin API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAdminJobs gọi api.get với endpoint /recruitment/admin/jobs và query params', async () => {
    const mockJobs = [{ id: 'job-1', title: 'Developer', status: 'OPEN' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockJobs });

    const result = await getAdminJobs('OPEN');
    expect(api.get).toHaveBeenCalledWith('/recruitment/admin/jobs', {
      params: { status: 'OPEN' },
    });
    expect(result).toEqual(mockJobs);
  });

  it('createJob gọi api.post với payload tạo mới', async () => {
    const newJob = {
      title: 'DevOps Engineer',
      description: 'CI/CD pipeline',
      requirements: 'Docker, K8s',
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { id: 'job-2', ...newJob, status: 'OPEN' },
    });

    const result = await createJob(newJob);
    expect(api.post).toHaveBeenCalledWith('/recruitment/jobs', newJob);
    expect(result.id).toBe('job-2');
  });

  it('updateJob gọi api.patch với jobId và payload', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { id: 'job-1', status: 'CLOSED' },
    });

    const result = await updateJob('job-1', { status: 'CLOSED' });
    expect(api.patch).toHaveBeenCalledWith('/recruitment/jobs/job-1', {
      status: 'CLOSED',
    });
    expect(result.status).toBe('CLOSED');
  });

  it('deleteJob gọi api.delete với jobId', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { message: 'Deleted' },
    });

    const result = await deleteJob('job-1');
    expect(api.delete).toHaveBeenCalledWith('/recruitment/jobs/job-1');
    expect(result.message).toBe('Deleted');
  });

  it('getJobCandidates gọi api.get lấy danh sách ứng viên theo jobId', async () => {
    const mockCandidates = [
      { id: 'c-1', name: 'Nguyen Van A', matchScore: 90, aiStatus: 'DONE' },
    ];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockCandidates });

    const result = await getJobCandidates('job-1');
    expect(api.get).toHaveBeenCalledWith('/recruitment/jobs/job-1/candidates');
    expect(result).toEqual(mockCandidates);
  });

  it('reEvaluateCandidate gọi api.post kích hoạt AI chấm lại', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { message: 'Re-evaluation triggered successfully' },
    });

    const result = await reEvaluateCandidate('c-1');
    expect(api.post).toHaveBeenCalledWith(
      '/recruitment/candidates/c-1/re-evaluate'
    );
    expect(result.message).toBe('Re-evaluation triggered successfully');
  });

  it('fetchCandidateCvBlob gọi api.get với responseType blob', async () => {
    const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockBlob });

    const result = await fetchCandidateCvBlob('c-1');
    expect(api.get).toHaveBeenCalledWith('/recruitment/candidates/c-1/cv', {
      responseType: 'blob',
    });
    expect(result).toBe(mockBlob);
  });
});
