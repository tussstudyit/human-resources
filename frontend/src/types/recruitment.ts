export type JobStatus = 'OPEN' | 'CLOSED';

export interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  department?: string;
}

export interface ApplyJobPayload {
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  file_cv: File;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ApplyApiError {
  status: number;
  message: string;
}
