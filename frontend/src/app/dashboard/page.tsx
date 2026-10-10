'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import {
  Users,
  Briefcase,
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  Shield,
  ArrowUpRight,
  TrendingUp,
  X,
  Filter,
  Layers,
  ArrowRight,
  Clock,
  Calendar,
  Archive,
  ExternalLink,
  Compass,
  Heart,
  Bot,
  UserPlus,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { RecruitmentDashboardStats } from '@/types/recruitment';
import { formatRelativeTime } from '@/lib/recruitment-utils';

interface Employee {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface Department {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    users?: number;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, initAuth } = useAuthStore();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recruitmentStats, setRecruitmentStats] = useState<RecruitmentDashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/departments')
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error('Lỗi tải departments:', err));

      api
        .get('/auth/users')
        .then((res) => setEmployees(res.data))
        .catch((err) => console.error('Lỗi tải users:', err));

      api
        .get('/recruitment/stats')
        .then((res) => setRecruitmentStats(res.data))
        .catch((err) => console.error('Lỗi tải recruitment stats:', err));
    }
  }, [isAuthenticated]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept =
        selectedDeptFilter === 'ALL' || emp.department?.id === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDeptFilter]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#171717] text-xs font-mono">
        <div className="flex items-center space-x-2.5 p-4 rounded-[6px] border border-[#ebebeb] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
          <div className="h-4 w-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#4d4d4d]">VERIFYING_PERMISSIONS...</span>
        </div>
      </div>
    );
  }

  const totalCandidates = recruitmentStats?.totalCandidates ?? 0;
  const pipeline = recruitmentStats?.pipeline ?? {
    pending: 0,
    evaluated: 0,
    interview: 0,
    talentPool: 0,
    rejected: 0,
  };

  const formatRate = (count: number) => {
    if (totalCandidates <= 0) return '0.0%';
    return `${((count / totalCandidates) * 100).toFixed(1)}%`;
  };

  const dynamicFunnelStages = [
    {
      name: '1. Nộp hồ sơ',
      count: totalCandidates.toString(),
      rate: '100%',
      color: 'bg-blue-600',
      desc: 'Tổng ứng viên nộp qua Careers & n8n',
    },
    {
      name: '2. Chờ AI thẩm định',
      count: pipeline.pending.toString(),
      rate: formatRate(pipeline.pending),
      color: 'bg-amber-500',
      desc: 'Chờ n8n WF_04 trích xuất & chấm điểm',
    },
    {
      name: '3. AI đã chấm điểm',
      count: pipeline.evaluated.toString(),
      rate: formatRate(pipeline.evaluated),
      color: 'bg-sky-500',
      desc: 'Gemini AI đã đánh giá năng lực',
    },
    {
      name: '4. Lịch Phỏng vấn (Meet)',
      count: pipeline.interview.toString(),
      rate: formatRate(pipeline.interview),
      color: 'bg-emerald-500',
      desc: 'n8n WF_05 đã xếp lịch Google Meet',
    },
    {
      name: '5. Kho nhân tài (Pool)',
      count: pipeline.talentPool.toString(),
      rate: formatRate(pipeline.talentPool),
      color: 'bg-indigo-600',
      desc: 'n8n WF_06 phân loại & lưu trữ',
    },
  ];

  const agents = [
    {
      title: 'AI Recruitment Agent',
      desc: 'Phân tích CV, chấm điểm tương thích bằng Gemini AI & xếp lịch Google Meet tự động.',
      icon: Briefcase,
      tag: 'Cốt lõi',
      href: '/recruitment',
      stats: 'Hoạt động 100%',
      tasksCount: totalCandidates > 0 ? `${totalCandidates} hồ sơ đã tiếp nhận` : 'Sẵn sàng tiếp nhận',
      active: true,
      workflows: ['WF_04 (Parser)', 'WF_05 (Meet)', 'WF_06 (Pool)'],
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HR':
        return 'bg-[#f2f2f2] text-[#171717] border-[#ebebeb]';
      case 'MANAGER':
        return 'bg-[#d3e5ff] text-[#0761d1] border-[#0070f3]/20';
      default:
        return 'bg-[#f2f2f2] text-[#4d4d4d] border-[#ebebeb]';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-7 flex-1 max-w-7xl w-full mx-auto">
          {/* Welcome Banner - Stark Vercel Ink style with Agent live status */}
          <div className="bg-[#171717] rounded-[12px] p-6 text-white border border-[#171717] shadow-[0px_1px_2px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 font-mono text-[10px] text-[#8f8f8f] uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-[#0070f3]" aria-hidden="true" />
                <span>TRUNG TÂM ĐIỀU HÀNH DOANH NGHIỆP</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                  AI RECRUITMENT ONLINE (100%)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-balance">
                Xin chào, {user.fullName}!
              </h2>
              <p className="text-[#a1a1a1] text-xs max-w-2xl leading-relaxed">
                Hệ thống Quản lý Nhân sự Thông minh kết nối trực tiếp cơ sở dữ liệu và n8n Automation Engine để sàng lọc ứng viên, tạo lịch phỏng vấn và quản trị nhân tài.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2.5 rounded-[6px] border border-white/10 text-xs font-mono">
                <Shield className="h-4 w-4 text-[#0070f3]" aria-hidden="true" />
                <div>
                  <span className="text-[#8f8f8f] block text-[10px]">CURRENT_ROLE</span>
                  <span className="font-semibold text-white uppercase">{user.role}</span>
                </div>
              </div>

              <Link
                href="/recruitment"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0070f3] hover:bg-[#0060df] text-white rounded-[6px] text-xs font-medium transition-colors shadow-sm focus-ring cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mở ATS Tuyển dụng</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bento Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Tổng nhân sự */}
            <div className="bg-white p-5 rounded-[12px] border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover-lift flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  Tổng nhân sự
                </p>
                <div className="h-8 w-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] flex items-center justify-center">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">{employees.length}</h3>
                <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                  +8.5%
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8f8f8f] mt-1.5">TĂNG TRƯỞNG THÁNG NÀY</p>
            </div>

            {/* Card 2: Phòng ban */}
            <div className="bg-white p-5 rounded-[12px] border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover-lift flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  Phòng ban
                </p>
                <div className="h-8 w-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] flex items-center justify-center">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">{departments.length}</h3>
                <span className="text-[11px] font-mono text-[#4d4d4d] bg-[#f2f2f2] px-1.5 py-0.5 rounded border border-[#ebebeb]">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8f8f8f] mt-1.5">CƠ CẤU TỔ CHỨC</p>
            </div>

            {/* Card 3: AI Agent */}
            <div className="bg-white p-5 rounded-[12px] border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover-lift flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  AI Agents
                </p>
                <div className="h-8 w-8 rounded-[6px] bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">5 Agents</h3>
                <span className="inline-flex items-center text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mr-1 animate-pulse"></span>
                  ONLINE (ACTIVE)
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8f8f8f] mt-1.5">5 TÁC TỬ TỰ ĐỘNG HÓA</p>
            </div>

            {/* Card 4: Phòng ban của bạn */}
            <div className="bg-white p-5 rounded-[12px] border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover-lift flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  Phòng ban của bạn
                </p>
                <div className="h-8 w-8 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] text-[#171717] flex items-center justify-center">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[#171717] truncate">
                  {user.department?.name || 'Chưa phân bổ'}
                </h3>
                <span className="text-[10px] font-mono text-[#4d4d4d] bg-[#f2f2f2] px-1.5 py-0.5 rounded border border-[#ebebeb]">
                  {totalCandidates} Hồ sơ
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8f8f8f] mt-1.5">
                {recruitmentStats ? `ĐIỂM TB: ${recruitmentStats.avgMatchScore}%` : 'ĐỒNG BỘ N8N'}
              </p>
            </div>
          </div>

          {/* AI Agents Squad Grid (5 Agents System) */}
          <div className="bg-white rounded-[12px] p-6 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ebebeb]">
              <div>
                <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  HỆ THỐNG MULTI-AGENT
                </div>
                <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                  5 Tác Tử AI Doanh Nghiệp (Multi-Agent Squad)
                </h3>
              </div>
              <span className="font-mono text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[4px] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                HỆ THỐNG ĐANG HOẠT ĐỘNG
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Agent 1: Recruitment */}
              <Link
                href="/recruitment"
                className="group p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-all hover-lift block"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-8 w-8 rounded-[6px] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 border border-amber-200">
                    Tuyển dụng
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors flex items-center justify-between">
                  AI Recruitment Agent
                  <ArrowRight className="h-3 w-3 text-[#8f8f8f] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                  Đăng tin tuyển dụng, trích xuất kỹ năng CV & lên lịch phỏng vấn tự động.
                </p>
                <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-emerald-600">
                  <span>TRẠNG THÁI</span>
                  <span className="font-semibold">Hoạt động (n8n WF 04-06)</span>
                </div>
              </Link>

              {/* Agent 2: Onboarding */}
              <Link
                href="/onboarding"
                className="group p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-all hover-lift block"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-8 w-8 rounded-[6px] bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center">
                    <Compass className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100/70 text-cyan-800 border border-cyan-200">
                    Hội nhập
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors flex items-center justify-between">
                  AI Onboarding Agent
                  <ArrowRight className="h-3 w-3 text-[#8f8f8f] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                  Checklist nhận việc cho nhân viên mới & kích hoạt cấp tài khoản IT.
                </p>
                <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-emerald-600">
                  <span>TRẠNG THÁI</span>
                  <span className="font-semibold">Hoạt động (Checklist)</span>
                </div>
              </Link>

              {/* Agent 3: Performance */}
              <Link
                href="/performance"
                className="group p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-all hover-lift block"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-8 w-8 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                    Hiệu suất
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors flex items-center justify-between">
                  AI Performance Agent
                  <ArrowRight className="h-3 w-3 text-[#8f8f8f] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                  Thu thập phản hồi 360 độ, theo dõi tiến độ mục tiêu & báo cáo KPI.
                </p>
                <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-emerald-600">
                  <span>TRẠNG THÁI</span>
                  <span className="font-semibold">Hoạt động (KPI & 360°)</span>
                </div>
              </Link>

              {/* Agent 4: Training */}
              <Link
                href="/training"
                className="group p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-all hover-lift block"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-8 w-8 rounded-[6px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800 border border-indigo-200">
                    Đào tạo
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors flex items-center justify-between">
                  AI Training & Skills Agent
                  <ArrowRight className="h-3 w-3 text-[#8f8f8f] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                  Đánh giá khoảng cách kỹ năng (Radar Chart), quản lý chứng chỉ & hạn cấp.
                </p>
                <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-emerald-600">
                  <span>TRẠNG THÁI</span>
                  <span className="font-semibold">Hoạt động (Radar & Certs)</span>
                </div>
              </Link>

              {/* Agent 5: Employee Engagement (Nguyen's) */}
              <a
                href="https://docs.google.com/spreadsheets/d/1ndgrNwA8BYH_O35FfsrqzJaSjMY9xSL8sqD151NefRA/edit"
                target="_blank"
                rel="noreferrer"
                className="group p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-all hover-lift block"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="h-8 w-8 rounded-[6px] bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100/70 text-rose-800 border border-rose-200">
                    Gắn kết & Wellbeing
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-[#171717] group-hover:text-rose-600 transition-colors flex items-center justify-between">
                  AI Employee Engagement
                  <ExternalLink className="h-3 w-3 text-[#8f8f8f] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                  Khảo sát định kỳ, phân tích cảm xúc Gemini 1.5, đề xuất Wellbeing & theo dõi eNPS.
                </p>
                <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-emerald-600">
                  <span>DỮ LIỆU REAL-TIME</span>
                  <span className="font-semibold underline">Google Sheets Live ↗</span>
                </div>
              </a>
            </div>
          </div>


          {/* Candidate Funnel Flow Mini-Widget (ui-ux-pro-max Chart Spec - 100% Dynamic Synced) */}
          <div className="bg-white rounded-[12px] p-5 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#ebebeb]">
              <div>
                <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  TIẾN ĐỘ PHỄU TUYỂN DỤNG
                </div>
                <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                  Phễu Tuyển Dụng & Sàng Lọc AI (5 Giai đoạn Đồng Bộ)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center text-[11px] font-mono text-[#4d4d4d] bg-[#f2f2f2] px-2 py-0.5 rounded border border-[#ebebeb]">
                  Điểm AI Trung Bình: <strong className="text-[#171717] ml-1">{recruitmentStats?.avgMatchScore ?? 0}%</strong>
                </span>
                <Link
                  href="/recruitment"
                  className="inline-flex items-center space-x-1 text-xs font-medium text-[#0070f3] hover:underline cursor-pointer"
                >
                  <span>Xem chi tiết ATS</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {dynamicFunnelStages.map((stage, idx) => (
                <div
                  key={stage.name}
                  className="p-3 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] relative overflow-hidden group hover:border-[#0070f3]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#4d4d4d] mb-1">
                    <span className="font-semibold text-[#171717] truncate">{stage.name}</span>
                    <span className="text-[10px] text-[#8f8f8f]">{stage.rate}</span>
                  </div>
                  <div className="text-lg font-semibold text-[#171717] tracking-tight">{stage.count}</div>
                  <div className="w-full bg-[#ebebeb] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-300`}
                      style={{ width: stage.rate }}
                    ></div>
                  </div>
                  <p className="text-[9px] font-mono text-[#8f8f8f] mt-1.5 truncate" title={stage.desc}>
                    {idx === 0 ? 'Tổng hồ sơ' : `Tỷ lệ: ${stage.rate}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agent Section - Spotlight Live Agent */}
          <div>
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  HỆ THỐNG TỰ ĐỘNG HÓA
                </div>
                <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                  Tác Tử AI Tuyển Dụng Thông Minh (Live Agent)
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                1 Tác Tử Đang Hoạt Động (100% ONLINE)
              </span>
            </div>

            <div className="bg-white rounded-[12px] p-6 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover:border-[#171717]/40 transition-all">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-[#ebebeb]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-[10px] bg-[#171717] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Briefcase className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/recruitment"
                        className="text-base font-semibold text-[#171717] hover:text-[#0070f3] transition-colors inline-flex items-center gap-1.5 group"
                      >
                        <span>AI Recruitment Agent</span>
                        <ArrowUpRight className="h-4 w-4 text-[#8f8f8f] group-hover:text-[#0070f3] group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                      </Link>
                      <span className="font-mono text-[10px] font-medium text-[#4d4d4d] bg-[#f2f2f2] px-2 py-0.5 rounded-[4px] border border-[#ebebeb]">
                        Cốt lõi
                      </span>
                      <span className="font-mono text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                        Hoạt động 100%
                      </span>
                    </div>
                    <p className="text-xs text-[#4d4d4d] mt-1.5 max-w-2xl leading-relaxed">
                      Phân tích CV ứng viên, trích xuất kỹ năng bằng Gemini AI, chấm điểm tương thích chính xác theo tiêu chí từng vị trí và tự động hóa xếp lịch phỏng vấn Google Meet qua n8n Engine.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-[#8f8f8f]">
                      <span>Tác vụ:</span>
                      <span className="text-[#171717] font-medium">{agents[0].tasksCount}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/recruitment"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium rounded-[6px] transition-colors shadow-sm focus-ring cursor-pointer group"
                >
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Mở ATS Tuyển dụng</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
              </div>

              {/* 3 Live Connected Workflows */}
              <div className="pt-5">
                <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider mb-3">
                  QUY TRÌNH TỰ ĐỘNG HÓA N8N ĐANG HOẠT ĐỘNG (3 WORKFLOWS)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] hover:border-[#0070f3]/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-semibold text-[#0070f3]">WF_04</span>
                      <span className="inline-flex items-center text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#171717]">Trích xuất & Chấm điểm CV</p>
                    <p className="text-[11px] text-[#8f8f8f] mt-1 leading-snug">
                      Gemini 2.5 Flash phân tích PDF, trích xuất kỹ năng & cho điểm tương thích (0-100%).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] hover:border-[#0070f3]/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-semibold text-[#0070f3]">WF_05</span>
                      <span className="inline-flex items-center text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#171717]">Xếp lịch Phỏng vấn & Meet</p>
                    <p className="text-[11px] text-[#8f8f8f] mt-1 leading-snug">
                      Tự động sinh Google Meet URL và gửi email thông báo kèm thời gian phỏng vấn.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] hover:border-[#0070f3]/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-semibold text-[#0070f3]">WF_06</span>
                      <span className="inline-flex items-center text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#171717]">Kho Nhân Tài & Thông Báo</p>
                    <p className="text-[11px] text-[#8f8f8f] mt-1 leading-snug">
                      Phân bổ tầng Talent Pool (Priority/Retained/General) và gửi thư động viên lịch thiệp.
                    </p>
                  </div>
                </div>

                {/* Sub-status bar */}
                <div className="mt-4 pt-3 border-t border-[#ebebeb] flex flex-wrap items-center justify-between text-xs font-mono text-[11px] text-[#8f8f8f]">
                  <div className="flex items-center gap-4">
                    <span>TỔNG HỒ SƠ ĐÃ XỬ LÝ: <strong className="text-[#171717]">{totalCandidates}</strong></span>
                    <span>ĐIỂM TRUNG BÌNH: <strong className="text-[#171717]">{recruitmentStats?.avgMatchScore ?? 0}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span>ĐÃ ĐỒNG BỘ CSDL VÀ N8N THỜI GIAN THỰC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hoạt Động Tuyển Dụng AI & n8n Gần Nhất (Recent Live Stream) */}
          {recruitmentStats?.recentEvaluations && recruitmentStats.recentEvaluations.length > 0 && (
            <div className="bg-white rounded-[12px] p-5 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#ebebeb]">
                <div>
                  <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                    ĐÁNH GIÁ TRỰC TIẾP N8N & GEMINI AI
                  </div>
                  <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                    Hồ Sơ Được Thẩm Định Gần Nhất Qua n8n & Gemini AI
                  </h3>
                </div>
                <Link
                  href="/recruitment"
                  className="inline-flex items-center space-x-1 text-xs font-medium text-[#0070f3] hover:underline cursor-pointer"
                >
                  <span>Mở ATS Tuyển dụng</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {recruitmentStats.recentEvaluations.map((item) => {
                  const score = item.matchScore ?? 0;
                  const scoreBadgeClass =
                    score >= 80
                      ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                      : score >= 50
                      ? 'bg-[#fefce8] text-[#854d0e] border-[#fef08a]'
                      : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';

                  const stageLabel =
                    item.stage === 'INTERVIEW'
                      ? 'Lịch Meet'
                      : item.stage === 'TALENT_POOL'
                      ? item.poolTier === 'PRIORITY_TALENT_POOL'
                        ? 'Kho Tiềm Năng (Priority)'
                        : item.poolTier === 'RETAINED_TALENT_POOL'
                        ? 'Kho Lưu Giữ (Retained)'
                        : 'Kho Nhân Tài (General)'
                      : item.stage === 'PENDING'
                      ? 'Chờ Thẩm Định'
                      : 'AI Đã Chấm Điểm';

                  const stageColor =
                    item.stage === 'INTERVIEW'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.stage === 'TALENT_POOL'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : item.stage === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200';

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] hover:border-[#171717]/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] border ${stageColor}`}
                          >
                            {stageLabel}
                          </span>
                          <span
                            className={`font-mono text-xs px-2 py-0.5 rounded-[4px] font-semibold border ${scoreBadgeClass}`}
                          >
                            {score}% Phù hợp
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#171717]">{item.name}</h4>
                        <p className="text-[11px] text-[#4d4d4d]">{item.jobTitle}</p>
                        <p className="text-[10px] text-[#8f8f8f] font-mono truncate">{item.email}</p>

                        {item.skills && item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {item.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-1.5 py-0.5 rounded bg-white border border-[#ebebeb] text-[9px] font-mono text-[#4d4d4d]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-[#8f8f8f]">
                        <span>{formatRelativeTime(item.updatedAt)}</span>
                        <Link
                          href="/recruitment"
                          className="text-[#0070f3] hover:underline flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <span>Chi tiết</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Employee Directory Table UX */}
          <div id="employees" className="bg-white rounded-[12px] border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-5 border-b border-[#ebebeb] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                    NHÂN SỰ
                  </div>
                  <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                    Danh Sách Nhân Sự Tổ Chức
                  </h3>
                </div>

                {/* Search Input with Clear Button */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8f8f8f]" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm nhân viên theo tên, email..."
                    className="pl-8 pr-8 py-1.5 bg-white border border-[#ebebeb] rounded-[6px] text-xs text-[#171717] placeholder-[#8f8f8f] focus:outline-none focus:border-[#171717] w-64 md:w-72 transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring"
                    aria-label="Tìm kiếm nhân viên"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-[#171717] cursor-pointer"
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Department Quick Filter Pills */}
              {departments.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-[#8f8f8f] mr-1 flex items-center gap-1">
                    <Filter className="h-3 w-3" aria-hidden="true" />
                    BỘ LỌC:
                  </span>
                  <button
                    onClick={() => setSelectedDeptFilter('ALL')}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-mono transition-colors cursor-pointer ${
                      selectedDeptFilter === 'ALL'
                        ? 'bg-[#171717] text-white'
                        : 'bg-[#fafafa] text-[#4d4d4d] border border-[#ebebeb] hover:bg-[#f2f2f2]'
                    }`}
                  >
                    Tất cả ({employees.length})
                  </button>
                  {departments.map((dept) => {
                    const isSelected = selectedDeptFilter === dept.id;
                    const count = employees.filter((e) => e.department?.id === dept.id).length;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedDeptFilter(isSelected ? 'ALL' : dept.id)}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#0070f3] text-white'
                            : 'bg-[#fafafa] text-[#4d4d4d] border border-[#ebebeb] hover:bg-[#f2f2f2]'
                        }`}
                      >
                        {dept.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] text-[#8f8f8f] font-mono text-[10px] uppercase tracking-wider border-b border-[#ebebeb]">
                  <tr>
                    <th className="px-5 py-2.5">Họ và tên</th>
                    <th className="px-5 py-2.5">Email</th>
                    <th className="px-5 py-2.5">Vai trò</th>
                    <th className="px-5 py-2.5">Phòng ban</th>
                    <th className="px-5 py-2.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#171717]">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-[4px] bg-[#171717] text-white flex items-center justify-center font-bold text-[10px] uppercase">
                            {emp.fullName ? emp.fullName[0] : 'U'}
                          </div>
                          <span>{emp.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[#4d4d4d] text-[11px]">{emp.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] border ${getRoleBadge(
                            emp.role
                          )}`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#4d4d4d]">
                        {emp.department?.name || <span className="text-[#8f8f8f] font-mono">Chưa phân bổ</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="font-mono text-[10px] text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-[4px]">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <div className="max-w-xs mx-auto space-y-2">
                          <div className="h-9 w-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Search className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <p className="font-mono text-xs text-[#8f8f8f]">
                            Không tìm thấy nhân sự
                          </p>
                          <p className="text-xs text-[#4d4d4d]">
                            Không tìm thấy nhân viên nào phù hợp với bộ lọc hiện tại.
                          </p>
                          {(searchTerm || selectedDeptFilter !== 'ALL') && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setSelectedDeptFilter('ALL');
                              }}
                              className="text-xs font-mono text-[#0070f3] hover:underline cursor-pointer pt-1 block mx-auto"
                            >
                              Xóa bộ lọc để xem tất cả
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departments Grid */}
          <div id="departments" className="bg-white rounded-[12px] p-6 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                  PHÒNG BAN
                </div>
                <h3 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
                  Cơ Cấu Phòng Ban
                </h3>
              </div>
              <span className="font-mono text-[10px] font-medium text-[#171717] bg-[#f2f2f2] border border-[#ebebeb] px-2 py-0.5 rounded-[4px]">
                {departments.length} PHÒNG BAN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 bg-[#fafafa] rounded-[8px] border border-[#ebebeb] hover:border-[#171717]/40 transition-colors hover-lift"
                >
                  <p className="text-xs font-semibold text-[#171717] truncate">{dept.name}</p>
                  <p className="text-[11px] text-[#4d4d4d] mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || 'Không có mô tả'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-[#ebebeb] flex items-center justify-between text-[10px] font-mono text-[#8f8f8f]">
                    <span>NHÂN SỰ</span>
                    <strong className="text-[#171717] font-semibold">{dept._count?.users ?? 0} người</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
