import { Metadata } from 'next';
import { getJobs } from '@/lib/api/recruitment';
import CareersClient from '@/components/recruitment/CareersClient';
import { JobPost } from '@/types/recruitment';

export const metadata: Metadata = {
  title: 'Cơ hội nghề nghiệp & Việc làm | HR Platform',
  description:
    'Khám phá các vị trí tuyển dụng hấp dẫn tại HR Platform. Nộp hồ sơ nhanh chóng và kết nối trực tiếp với đội ngũ tuyển dụng.',
};

// Giữ force-dynamic để Next.js SSR tại thời điểm request, bỏ qua fetch cache,
// đảm bảo danh sách vị trí tuyển dụng luôn cập nhật và tránh lỗi build tĩnh khi backend chưa chạy
export const dynamic = 'force-dynamic';

export default async function CareersPage() {
  let initialJobs: JobPost[] = [];
  let initialError: boolean = false;

  try {
    initialJobs = await getJobs();
  } catch (err) {
    console.error('Lỗi SSR khi tải danh sách việc làm:', err);
    initialError = true;
  }

  return (
    <CareersClient initialJobs={initialJobs} initialError={initialError} />
  );
}
