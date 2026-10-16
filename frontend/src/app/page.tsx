import { Metadata } from 'next';
import { getJobs } from '@/lib/api/recruitment';
import { UpCareerPortalClient } from '@/components/topdev/TopDevPortalClient';
import { JobPost } from '@/types/recruitment';

export const metadata: Metadata = {
  title: 'UpCareer - Việc Làm IT Hàng Đầu Việt Nam | HR Tech Platform',
  description:
    'Nền tảng việc làm IT hàng đầu Việt Nam. Khám phá hàng ngàn việc làm lập trình viên chất lượng cao, tính lương Gross - Net, tải báo cáo thị trường IT.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialJobs: JobPost[] = [];

  try {
    initialJobs = await getJobs();
  } catch (err) {
    console.error('Lỗi SSR khi tải danh sách việc làm:', err);
  }

  return <UpCareerPortalClient initialRealJobs={initialJobs} />;
}
