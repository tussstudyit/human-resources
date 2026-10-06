import { Metadata } from 'next';
import { getJobs } from '@/lib/api/recruitment';
import CareersClient from '@/components/recruitment/CareersClient';
import { JobPost } from '@/types/recruitment';

export const metadata: Metadata = {
  title: 'AI Tuyển dụng Thông minh | HR Platform',
  description:
    'Hệ thống AI Tuyển dụng Thông minh. Tìm kiếm việc làm, nộp hồ sơ trực tuyến và nhận phân tích đánh giá kỹ năng tự động bằng AI Agent.',
};

export const dynamic = 'force-dynamic';

export default async function RecruitmentPage() {
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
