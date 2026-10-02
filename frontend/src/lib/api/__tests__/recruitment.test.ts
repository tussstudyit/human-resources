import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getJobs, applyJob, getBaseApiUrl } from '../recruitment';
import axios from 'axios';

describe('recruitment API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getBaseApiUrl', () => {
    it('ưu tiên API_INTERNAL_URL khi chạy ở môi trường server', () => {
      // Giả lập môi trường Node server (window = undefined)
      const originalWindow = global.window;
      // @ts-expect-error test server-side window undefined
      delete global.window;

      vi.stubEnv('API_INTERNAL_URL', 'http://internal-backend:4010');
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://public-backend:3001');

      expect(getBaseApiUrl()).toBe('http://internal-backend:4010');

      global.window = originalWindow;
    });

    it('fallback sang NEXT_PUBLIC_API_URL nếu không có API_INTERNAL_URL', () => {
      const originalWindow = global.window;
      // @ts-expect-error test server-side window undefined
      delete global.window;

      delete process.env.API_INTERNAL_URL;
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://public-backend:3001');

      expect(getBaseApiUrl()).toBe('http://public-backend:3001');

      global.window = originalWindow;
    });
  });

  describe('getJobs', () => {
    it('gọi fetch với AbortSignal timeout 8s và lọc các job có status OPEN', async () => {
      const mockJobs = [
        { id: '1', title: 'Job 1', status: 'OPEN' },
        { id: '2', title: 'Job 2', status: 'CLOSED' },
      ];

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobs,
      } as Response);

      const result = await getJobs();

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/recruitment/jobs'),
        expect.objectContaining({
          cache: 'no-store',
          signal: expect.any(AbortSignal),
        })
      );

      // Chỉ lấy job OPEN
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('ném ra ngoại lệ khi fetch trả về lỗi HTTP', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(getJobs()).rejects.toThrow('Failed to fetch jobs: 500');
    });
  });

  describe('applyJob', () => {
    it('gửi axios.post với timeout 30s và multipart form data', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { id: 'candidate-123' },
      });

      const file = new File(['%PDF-1.4 dummy'], 'cv.pdf', {
        type: 'application/pdf',
      });

      const res = await applyJob({
        jobId: 'job-1',
        name: 'Nguyen Van A',
        email: 'test@example.com',
        file_cv: file,
      });

      expect(res).toEqual({ success: true, id: 'candidate-123' });
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/recruitment/apply'),
        expect.any(FormData),
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });
  });
});
