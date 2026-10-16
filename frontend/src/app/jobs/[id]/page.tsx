import { Metadata } from 'next';
import { getJobs } from '@/lib/api/recruitment';
import { UpCareerPortalClient } from '@/components/topdev/TopDevPortalClient';
import { JobPost } from '@/types/recruitment';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  let jobs: JobPost[] = [];
  try {
    jobs = await getJobs();
  } catch (err) {
    console.error('Lỗi khi lấy thông tin việc làm cho metadata:', err);
  }

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return {
      title: 'Chi Tiết Việc Làm IT | UpCareer Tuyển Dụng',
      description: 'Khám phá cơ hội việc làm IT chất lượng cao trên nền tảng UpCareer.',
    };
  }

  return {
    title: `${job.title} | UpCareer Tuyển Dụng`,
    description: job.description ? job.description.slice(0, 160) : 'Chi tiết việc làm IT chất lượng cao trên nền tảng UpCareer.',
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  let initialJobs: JobPost[] = [];

  try {
    initialJobs = await getJobs();
  } catch (err) {
    console.error('Lỗi SSR khi tải danh sách việc làm:', err);
  }

  return (
    <UpCareerPortalClient
      initialRealJobs={initialJobs}
      initialSelectedJobId={id}
    />
  );
}
