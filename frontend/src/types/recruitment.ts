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
  _count?: {
    candidates: number;
  };
}

export type AiStatus = 'PENDING' | 'DONE' | 'FAILED';

export interface InterviewerInfo {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface InterviewScheduleInfo {
  time?: string;
  type?: 'ONLINE' | 'OFFICE' | string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | string;
  location?: string;
  googleMeetUrl?: string;
  isRealGoogleMeet?: boolean;
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
  interviewer?: InterviewerInfo;
}

export interface TalentPoolInfo {
  tier?: 'PRIORITY_TALENT_POOL' | 'RETAINED_TALENT_POOL' | 'GENERAL_TALENT_POOL' | string;
  status?: 'ARCHIVED' | 'ACTIVE' | string;
  scenario?: 'TOP_TALENT' | 'POST_INTERVIEW' | 'CV_SCREENING' | string;
  emailSent?: boolean;
  archivedAt?: string;
  recommendedNextRole?: string;
}

export interface ParsedSkillsData {
  skills?: string[];
  interviewSchedule?: InterviewScheduleInfo;
  talentPool?: TalentPoolInfo;
  decision?: string;
  recommendation?: string;
  summary?: string;
}

export type CandidateSkills = string[] | ParsedSkillsData | null;

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cvUrl: string;
  parsedSkillsJson?: CandidateSkills;
  matchScore?: number | null;
  experienceYears?: number | null;
  summary?: string | null;
  aiStatus: AiStatus;
  jobId: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateJobDto {
  title: string;
  description: string;
  requirements: string;
  status?: JobStatus;
}

export interface RecruitmentPipelineStats {
  pending: number;
  evaluated: number;
  interview: number;
  talentPool: number;
  rejected: number;
}

export interface RecentCandidateEvaluation {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  matchScore: number | null;
  aiStatus: AiStatus;
  stage: 'PENDING' | 'EVALUATED' | 'INTERVIEW' | 'TALENT_POOL' | 'REJECTED';
  poolTier?: string;
  meetUrl?: string;
  skills: string[];
  updatedAt: string;
}

export interface AiAgentStatusItem {
  id: string;
  name: string;
  roleTag: string;
  status: 'ONLINE' | 'ROADMAP' | 'OFFLINE';
  isLive: boolean;
  summary: string;
  workflows: string[];
  tasksProcessedCount: number;
  tasksProcessedLabel: string;
  lastActive: string | null;
}

export interface RecruitmentDashboardStats {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  avgMatchScore: number;
  pipeline: RecruitmentPipelineStats;
  recentEvaluations: RecentCandidateEvaluation[];
  agents: AiAgentStatusItem[];
}
