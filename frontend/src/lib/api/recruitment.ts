import axios, { AxiosError } from 'axios';
import { api } from '@/lib/api';
import {
  JobPost,
  JobStatus,
  Candidate,
  ApplyJobPayload,
  ApplyApiError,
  CreateJobDto,
  RecruitmentDashboardStats,
} from '@/types/recruitment';

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
 * Lấy danh sách việc làm đang mở tuyển (status: OPEN) - Public
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
    return data.filter((job) => job.status === 'OPEN');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách việc làm:', error);
    throw error;
  }
}

/**
 * Nộp hồ sơ ứng tuyển với CV PDF dạng multipart/form-data - Public
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

/* =========================================================================
   HR ONLY ADMIN APIS (yêu cầu Authorization: Bearer JWT token của HR)
   ========================================================================= */

/**
 * Lấy danh sách việc làm dành cho Admin/HR (kèm số lượng ứng viên)
 */
export async function getAdminJobs(status?: JobStatus): Promise<JobPost[]> {
  const params = status ? { status } : {};
  const res = await api.get<JobPost[]>('/recruitment/admin/jobs', { params });
  return res.data;
}

/**
 * Tạo tin tuyển dụng mới
 */
export async function createJob(dto: CreateJobDto): Promise<JobPost> {
  const res = await api.post<JobPost>('/recruitment/jobs', dto);
  return res.data;
}

/**
 * Chỉnh sửa tin tuyển dụng
 */
export async function updateJob(
  id: string,
  dto: Partial<CreateJobDto>
): Promise<JobPost> {
  const res = await api.patch<JobPost>(`/recruitment/jobs/${id}`, dto);
  return res.data;
}

/**
 * Xóa tin tuyển dụng
 */
export async function deleteJob(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/recruitment/jobs/${id}`);
  return res.data;
}

/**
 * Lấy danh sách ứng viên của một tin tuyển dụng (đã sắp xếp theo matchScore)
 */
export async function getJobCandidates(jobId: string): Promise<Candidate[]> {
  const res = await api.get<Candidate[]>(`/recruitment/jobs/${jobId}/candidates`);
  return res.data;
}

/**
 * Yêu cầu AI Agent chấm lại hồ sơ ứng viên
 */
export async function reEvaluateCandidate(
  candidateId: string
): Promise<{ message: string; candidate?: Candidate }> {
  const res = await api.post<{ message: string; candidate?: Candidate }>(
    `/recruitment/candidates/${candidateId}/re-evaluate`
  );
  return res.data;
}

/**
 * Tải CV PDF của ứng viên dưới dạng Blob an toàn (gắn header Bearer Token)
 */
export async function fetchCandidateCvBlob(candidateId: string): Promise<Blob> {
  const res = await api.get(`/recruitment/candidates/${candidateId}/cv`, {
    responseType: 'blob',
  });
  return res.data;
}

/**
 * Lấy số liệu thống kê tuyển dụng & đồng bộ n8n cho Dashboard
 */
export async function getRecruitmentStats(): Promise<RecruitmentDashboardStats> {
  const res = await api.get<RecruitmentDashboardStats>('/recruitment/stats');
  return res.data;
}

/**
 * Kích hoạt n8n WF_05: Xếp lịch phỏng vấn và tạo Google Meet
 */
export async function scheduleCandidateInterview(
  candidateId: string,
  interviewType: 'ONLINE' | 'OFFLINE' = 'ONLINE'
): Promise<{
  success: boolean;
  message: string;
  updatedCandidate?: Candidate;
  schedule?: any;
  interviewerPanel?: any;
}> {
  const res = await api.post(`/recruitment/candidates/${candidateId}/schedule-interview`, {
    interviewType,
  });
  return res.data;
}

/**
 * Kích hoạt n8n WF_06: Lưu kho nhân tài và gửi email phản hồi
 */
export async function archiveCandidateTalentPool(
  candidateId: string,
  scenario?: string
): Promise<{
  success: boolean;
  message: string;
  updatedCandidate?: Candidate;
  tier?: string;
}> {
  const res = await api.post(`/recruitment/candidates/${candidateId}/talent-pool`, {
    scenario,
  });
  return res.data;
}

