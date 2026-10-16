export interface UpCareerCompany {
  id: string;
  name: string;
  logo: string;
  city: string;
  district: string;
  address: string;
  size: string;
  industry: string;
  coverBg?: string;
  bannerImage?: string;
  logoText?: string;
  country?: string;
  openJobsCount?: number;
  verified: boolean;
}

export interface UpCareerSalary {
  display: string;
  min?: number;
  max?: number;
  currency: 'USD' | 'VND';
  isNegotiable?: boolean;
}

export interface UpCareerTechStackDetails {
  primary: string[];
  secondary: string[];
  database?: string[];
  cloudDevops?: string[];
}

export interface UpCareerJob {
  id: string;
  title: string;
  company: UpCareerCompany;
  salary: UpCareerSalary;
  location: string;
  workType: 'Hybrid' | 'At office' | 'Remote' | 'Flexible';
  level: 'Intern' | 'Fresher' | 'Junior' | 'Middle' | 'Senior' | 'Lead / Manager';
  experienceYears: string;
  skills: string[];
  postedTime: string;
  featured?: boolean;
  urgent?: boolean;
  viewsCount: number;
  applicantsCount: number;
  remainingDays?: number;
  description: string[];
  responsibilities?: string[];
  requirements: string[];
  skillsAndQualifications?: {
    category: string;
    items: string[];
  }[];
  benefits: string[];
  techStackDetails: UpCareerTechStackDetails;
  isRealFromBackend?: boolean;
  backendJobId?: string;
}

// Aliases cho UpCareer & TopDev backward compatibility
export type TopDevCompany = UpCareerCompany;
export type TopDevSalary = UpCareerSalary;
export type TopDevTechStackDetails = UpCareerTechStackDetails;
export type TopDevJob = UpCareerJob;
export type Job = UpCareerJob;

export interface CompanySpotlight {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
  city: string;
  industry: string;
  openJobsCount: number;
  rating: number;
  reviewsCount: number;
  highlight: string;
  tags: string[];
}

export interface JobFilterState {
  keyword: string;
  location: string;
  level: string;
  workType: string;
  selectedSkill: string;
  salaryTier: string;
  sortBy: 'latest' | 'salary_high' | 'popular';
}

export interface ITReportInsight {
  title: string;
  growth: string;
  metric: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishDate: string;
  summary: string;
  views: string;
  author: string;
  tag: string;
}
