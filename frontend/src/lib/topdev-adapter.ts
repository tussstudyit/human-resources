import { JobPost } from '@/types/recruitment';
import { TopDevJob } from '@/types/topdev';
import { parseSkills, inferDepartment, formatRelativeTime } from '@/lib/recruitment-utils';

/**
 * Suy đoán cấp bậc kỹ sư từ tiêu đề và yêu cầu công việc
 */
export function inferJobLevel(title: string, requirements: string = ''): TopDevJob['level'] {
  const text = (title + ' ' + requirements).toLowerCase();

  if (/\b(lead|manager|tech lead|team lead|trưởng nhóm|quản lý|architect)\b/.test(text)) {
    return 'Lead / Manager';
  }
  if (/\b(senior|chuyên viên cao cấp|sr\.?|chủ chốt)\b/.test(text)) {
    return 'Senior';
  }
  if (/\b(intern|thực tập|thực tập sinh|internship)\b/.test(text)) {
    return 'Intern';
  }
  if (/\b(fresher|mới tốt nghiệp)\b/.test(text)) {
    return 'Fresher';
  }
  if (/\b(junior|jr\.?)\b/.test(text)) {
    return 'Junior';
  }
  return 'Middle';
}

/**
 * Suy đoán hình thức làm việc (Remote / Hybrid / At office)
 */
export function inferWorkType(title: string, desc: string = ''): TopDevJob['workType'] {
  const text = (title + ' ' + desc).toLowerCase();
  if (/\b(remote|từ xa|100% remote|làm việc tại nhà)\b/.test(text)) {
    return 'Remote';
  }
  if (/\b(hybrid|linh hoạt|2 ngày remote)\b/.test(text)) {
    return 'Hybrid';
  }
  return 'At office';
}

/**
 * Loại bỏ dấu tiếng Việt để so khớp vị trí chính xác
 */
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Suy đoán địa điểm làm việc từ nội dung
 */
export function inferLocation(title: string, desc: string = ''): string {
  const norm = removeVietnameseAccents(title + ' ' + desc);
  if (norm.includes('ha noi') || /\bhn\b/.test(norm)) {
    return 'Hà Nội';
  }
  if (norm.includes('da nang') || /\bdn\b/.test(norm)) {
    return 'Đà Nẵng';
  }
  if (norm.includes('can tho')) {
    return 'Cần Thơ';
  }
  return 'Hồ Chí Minh';
}

/**
 * Tách nội dung text thành mảng các gạch đầu dòng ngắn gọn
 */
export function splitParagraphs(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s-•*]+/, '').trim())
    .filter((line) => line.length > 0);
}

/**
 * Suy đoán mức lương từ mô tả công việc hoặc cấp bậc
 */
export function inferSalary(desc: string = '', level: TopDevJob['level']): TopDevJob['salary'] {
  // Tìm mẫu lương USD: VD "2,200 - 3,500 USD"
  const usdMatch = desc.match(/(?:mức lương:?\s*)?([\d,.]+)\s*-\s*([\d,.]+)\s*USD/i);
  if (usdMatch) {
    const min = parseInt(usdMatch[1].replace(/,/g, ''), 10);
    const max = parseInt(usdMatch[2].replace(/,/g, ''), 10);
    return {
      display: `${usdMatch[1]} - ${usdMatch[2]} USD`,
      min,
      max,
      currency: 'USD',
      isNegotiable: false,
    };
  }

  // Tìm mẫu lương VND: VD "40 - 65 Triệu VND"
  const vndMatch = desc.match(/(?:mức lương:?\s*)?(\d+)\s*-\s*(\d+)\s*triệu\s*VND/i);
  if (vndMatch) {
    const minMil = parseInt(vndMatch[1], 10);
    const maxMil = parseInt(vndMatch[2], 10);
    return {
      display: `${minMil} - ${maxMil} Triệu VND`,
      min: Math.round((minMil * 1000000) / 25000),
      max: Math.round((maxMil * 1000000) / 25000),
      currency: 'VND',
      isNegotiable: false,
    };
  }

  return {
    display: 'Thương lượng (Cạnh tranh)',
    currency: 'USD',
    isNegotiable: true,
  };
}

/**
 * Suy đoán phân ban công nghệ (Tech Unit / Division) của công ty từ tiêu đề và phòng ban
 */
export function inferCompany(title: string, department: string, location: string): TopDevJob['company'] {
  const t = title.toLowerCase();
  let division = 'Tập Đoàn Công Nghệ HR Tech Hub';

  if (t.includes('ai') || t.includes('machine learning') || t.includes('data engineer') || t.includes('spark')) {
    division = 'HR Tech Hub - AI & Data Intelligence';
  } else if (t.includes('cloud') || t.includes('devops') || t.includes('sre') || t.includes('kubernetes')) {
    division = 'HR Tech Hub - Cloud Platform & DevOps';
  } else if (t.includes('golang') || t.includes('java') || t.includes('microservices')) {
    division = 'HR Tech Hub - Core Systems & Microservices';
  } else if (t.includes('mobile') || t.includes('flutter') || t.includes('react native') || t.includes('frontend') || t.includes('react')) {
    division = 'HR Tech Hub - Web & Mobile Innovation';
  } else if (t.includes('qa') || t.includes('test') || t.includes('playwright')) {
    division = 'HR Tech Hub - Quality & Reliability Engineering';
  } else if (t.includes('fullstack') || t.includes('enterprise')) {
    division = 'HR Tech Hub - Enterprise Digital Services';
  }

  const logoText = division.includes('AI')
    ? 'AI'
    : division.includes('Cloud')
    ? 'OPS'
    : division.includes('Core')
    ? 'SYS'
    : division.includes('Web')
    ? 'WEB'
    : division.includes('Quality')
    ? 'QA'
    : 'HTH';

  return {
    id: `company-${division.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: division,
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    bannerImage: '/images/cyberlogitec_workshop.jpg',
    logoText,
    country: 'Việt Nam · Quốc tế',
    openJobsCount: 4,
    city: location,
    district: 'Quận 1 / Khu Công Nghệ Cao',
    address: `Văn phòng Công nghệ HR Tech Hub - ${location}`,
    size: '100 - 500 nhân viên',
    industry: department,
    verified: true,
  };
}

/**
 * Chuyển đổi một bản ghi JobPost thực tế từ CSDL/Backend sang cấu trúc Job của TopDev
 */
export function adaptJobPostToTopDevJob(jobPost: JobPost): TopDevJob {
  const skills = parseSkills(jobPost.requirements);
  const department = jobPost.department || inferDepartment(jobPost.title);
  const level = inferJobLevel(jobPost.title, jobPost.requirements);
  const workType = inferWorkType(jobPost.title, jobPost.description);
  const location = inferLocation(jobPost.title, jobPost.description);
  const company = inferCompany(jobPost.title, department, location);
  const isUrgent = /\b(tuyển gấp|tuyen gap|urgent|gấp)\b/i.test(jobPost.title + ' ' + jobPost.description);
  const salary = inferSalary(jobPost.description, level);

  // Phân loại kinh nghiệm theo cấp bậc
  const expMap: Record<TopDevJob['level'], string> = {
    Intern: 'Không yêu cầu kinh nghiệm',
    Fresher: 'Dưới 1 năm kinh nghiệm',
    Junior: '1 - 2 năm kinh nghiệm',
    Middle: '2 - 4 năm kinh nghiệm',
    Senior: '4 - 7 năm kinh nghiệm',
    'Lead / Manager': '5+ năm kinh nghiệm',
  };

  const dbKeywords = ['postgres', 'mysql', 'mongodb', 'redis', 'sql', 'oracle', 'dynamodb'];
  const devopsKeywords = ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'cloud', 'gcp', 'azure'];

  const databaseSkills = skills.filter((s) => dbKeywords.some((k) => s.toLowerCase().includes(k)));
  const cloudSkills = skills.filter((s) => devopsKeywords.some((k) => s.toLowerCase().includes(k)));

  const parsedDesc = splitParagraphs(jobPost.description);
  const parsedReqs = splitParagraphs(jobPost.requirements);

  const skillsAndQualifications = [
    {
      category: 'Kinh nghiệm & Nền tảng chuyên môn',
      items: [
        `Yêu cầu tối thiểu ${expMap[level]} trong lĩnh vực kỹ thuật phần mềm hoặc các vị trí tương đương.`,
        'Tư duy logic giải quyết vấn đề xuất sắc, chủ động học hỏi và thích nghi nhanh với công nghệ mới.',
        'Kỹ năng làm việc nhóm, trao đổi kỹ thuật và phối hợp hiệu quả cùng Product Owner và UI/UX Designer.'
      ]
    },
    {
      category: 'Kỹ năng công nghệ & Công cụ cốt lõi',
      items: (parsedReqs.length > 0 ? parsedReqs : skills).map((s) => `Năng lực chuyên sâu về: ${s}`)
    },
    {
      category: 'Cơ sở dữ liệu & Vận hành hạ tầng',
      items: [
        `Kinh nghiệm thiết kế kiến trúc và tối ưu truy vấn dữ liệu: ${databaseSkills.length > 0 ? databaseSkills.join(', ') : 'PostgreSQL, Redis'}.`,
        `Thực hành triển khai trên môi trường hiện đại: ${cloudSkills.length > 0 ? cloudSkills.join(', ') : 'Docker, Kubernetes, CI/CD'}.`
      ]
    }
  ];

  return {
    id: jobPost.id,
    backendJobId: jobPost.id,
    isRealFromBackend: true,
    title: jobPost.title,
    company,
    salary,
    location,
    workType,
    level,
    experienceYears: expMap[level],
    skills: skills.length > 0 ? skills : ['Software Engineering', 'System Architecture', 'Git'],
    postedTime: formatRelativeTime(jobPost.createdAt),
    featured: true,
    urgent: isUrgent,
    viewsCount: 120 + (jobPost._count?.candidates || 0) * 12,
    applicantsCount: jobPost._count?.candidates || 0,
    remainingDays: 14,
    description: parsedDesc.length > 0 ? parsedDesc : [jobPost.description || 'Chưa có mô tả chi tiết'],
    responsibilities: parsedDesc.length > 0 ? parsedDesc : [jobPost.description || 'Chưa có mô tả chi tiết'],
    requirements:
      parsedReqs.length > 1
        ? parsedReqs
        : skills.length > 0
          ? skills
          : [jobPost.requirements || 'Yêu cầu kỹ năng công nghệ liên quan'],
    skillsAndQualifications,
    benefits: [
      'Mức lương cạnh tranh, xét tăng lương 2 lần/năm.',
      'Thưởng tháng 13 + thưởng hiệu quả kinh doanh dự án.',
      'Làm việc với công nghệ hiện đại, hệ thống phân tán chịu tải cao.',
      'Gói bảo hiểm sức khỏe quốc tế cao cấp dành cho nhân viên.',
      'Môi trường năng động, trang bị laptop cấu hình cao.',
    ],
    techStackDetails: {
      primary: skills.slice(0, 4),
      secondary: skills.slice(4, 8),
      database: databaseSkills.length > 0 ? databaseSkills : ['PostgreSQL', 'Redis'],
      cloudDevops: cloudSkills.length > 0 ? cloudSkills : ['Docker', 'CI/CD'],
    },
  };
}

/**
 * Kết hợp danh sách việc làm thực tế từ Backend và các việc làm mẫu TopDev để trang luôn sinh động
 */
export function mergeRealAndSampleJobs(
  realJobPosts: JobPost[],
  sampleJobs: TopDevJob[] = []
): TopDevJob[] {
  const convertedRealJobs = realJobPosts.map(adaptJobPostToTopDevJob);
  if (!sampleJobs || sampleJobs.length === 0) {
    return convertedRealJobs;
  }
  // Loại bỏ các mẫu trùng ID (nếu có)
  const realIds = new Set(convertedRealJobs.map((j) => j.id));
  const filteredSamples = sampleJobs.filter((j) => !realIds.has(j.id));

  // Việc làm thật luôn được xếp đầu tiên
  return [...convertedRealJobs, ...filteredSamples];
}

export const adaptJobPostToUpCareerJob = adaptJobPostToTopDevJob;

