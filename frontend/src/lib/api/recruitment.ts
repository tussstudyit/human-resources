import axios, { AxiosError } from 'axios';
import { JobPost, ApplyJobPayload, ApplyApiError } from '@/types/recruitment';

/**
 * Lấy URL API phù hợp tùy thuộc vào ngữ cảnh thực thi:
 * - Server-side (RSC): ưu tiên API_INTERNAL_URL -> NEXT_PUBLIC_API_URL -> http://localhost:3001
 * - Client-side (Browser): dùng NEXT_PUBLIC_API_URL -> http://localhost:3001
 */
export function getBaseApiUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001'
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

/**
 * Lấy danh sách việc làm đang mở tuyển (status: OPEN)
 * Tương thích cả Server Component (SSR) và Client Component
 * Timeout 8s bảo vệ SSR không bị treo nếu backend phản hồi chậm
 */
export async function getJobs(): Promise<JobPost[]> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/recruitment/jobs`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as JobPost[];
    // Lớp bảo vệ bổ sung ở frontend: chỉ nhận các việc làm đang OPEN
    return data.filter((job) => job.status === 'OPEN');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách việc làm:', error);
    throw error;
  }
}

/**
 * Nộp hồ sơ ứng tuyển với CV PDF dạng multipart/form-data
 * Timeout 30s cho phép người dùng mạng chậm upload file lớn (tối đa 10MB)
 */
export async function applyJob(
  payload: ApplyJobPayload
): Promise<{ success: boolean; id?: string }> {
  const formData = new FormData();
  formData.append('jobId', payload.jobId);
  formData.append('name', payload.name.trim());
  formData.append('email', payload.email.trim().toLowerCase());

  if (payload.phone && payload.phone.trim()) {
    formData.append('phone', payload.phone.trim());
  }

  formData.append('file_cv', payload.file_cv);

  try {
    const baseUrl = getBaseApiUrl();
    const response = await axios.post(`${baseUrl}/recruitment/apply`, formData, {
      headers: {
        Accept: 'application/json',
        'Content-Type': undefined,
      },
      timeout: 30000,
    });

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{
        message?: string | string[];
        error?: string;
        statusCode?: number;
      }>;
      const status = axiosErr.response?.status || 500;
      let rawMessage =
        axiosErr.response?.data?.message || axiosErr.message || 'Lỗi gửi yêu cầu';

      if (Array.isArray(rawMessage)) {
        rawMessage = rawMessage.join(', ');
      }

      const apiError: ApplyApiError = {
        status,
        message: rawMessage,
      };
      throw apiError;
    }

    const genericError: ApplyApiError = {
      status: 500,
      message: error instanceof Error ? error.message : 'Lỗi kết nối máy chủ',
    };
    throw genericError;
  }
}
