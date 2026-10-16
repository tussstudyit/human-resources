import { Metadata } from 'next';
import { getJobs } from '@/lib/api/recruitment';
import { UpCareerPortalClient } from '@/components/topdev/TopDevPortalClient';
import { JobPost } from '@/types/recruitment';

export const metadata: Metadata = {
  title: 'Cơ Hội Việc Làm IT Hàng Đầu | UpCareer & HR Platform',
  description:
    'Tìm kiếm việc làm IT, kỹ sư phần mềm, lập trình viên tại các doanh nghiệp công nghệ hàng đầu Việt Nam. Ứng tuyển nhanh chóng với CV trực tuyến.',
};

export const dynamic = 'force-dynamic';

export default async function CareersPage() {
  let initialJobs: JobPost[] = [];

  try {
    initialJobs = await getJobs();
  } catch (err) {
    console.error('Lỗi SSR khi tải danh sách việc làm:', err);
  }

  return <UpCareerPortalClient initialRealJobs={initialJobs} />;
}
