'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Compass,
  TrendingUp,
  GraduationCap,
  Heart,
  Users,
  Building2,
  Bot,
  Briefcase,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const agents = [
    {
      title: 'AI Recruitment Agent',
      desc: 'Tự động đăng tin tuyển dụng, phân tích CV ứng viên & lên lịch phỏng vấn thông minh.',
      icon: UserPlus,
      bgColor: 'bg-amber-100 text-amber-700',
      tag: 'Tuyển dụng',
      stats: 'Tự động hóa tuyển dụng',
      href: '#',
    },
    {
      title: 'AI Onboarding Agent',
      desc: 'Tự động hóa checklist hội nhập nhân viên mới, phân quyền công cụ & đào tạo ban đầu.',
      icon: Compass,
      bgColor: 'bg-cyan-100 text-cyan-700',
      tag: 'Hội nhập',
      stats: 'Quy trình nhận việc',
      href: '/onboarding',
    },
    {
      title: 'AI Performance Tracking Agent',
      desc: 'Tự động thu thập phản hồi 360 độ, theo dõi tiến độ mục tiêu & báo cáo KPI.',
      icon: TrendingUp,
      bgColor: 'bg-emerald-100 text-emerald-700',
      tag: 'Hiệu suất',
      stats: 'Đánh giá & KPI',
      href: '/performance',
    },
    {
      title: 'AI Training & Skills Agent',
      desc: 'Nhắc nhở hạn chứng chỉ chuyên môn, đề xuất khóa học và phân tích ROI đào tạo.',
      icon: GraduationCap,
      bgColor: 'bg-indigo-100 text-indigo-700',
      tag: 'Đào tạo',
      stats: 'Phát triển kỹ năng',
      href: '#',
    },
    {
      title: 'AI Employee Engagement Agent',
      desc: 'Tự động hóa khảo sát mức độ hài lòng, đề xuất hành động wellbeing & theo dõi gắn kết.',
      icon: Heart,
      bgColor: 'bg-rose-100 text-rose-700',
      tag: 'Gắn kết',
      stats: 'Khảo sát & Wellbeing',
      href: '#',
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Bot className="w-3.5 h-3.5" /> Hệ thống Quản lý Nhân sự Thông minh
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Xin chào, Trần Anh Tân!</h1>
          <p className="text-slate-300 max-w-2xl text-sm">
            Chào mừng bạn đến với trung tâm điều hành nhân sự và hệ thống 5 AI Agents tự động hóa.
          </p>
        </div>
        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-right">
          <div className="font-semibold text-slate-200">Phân quyền hiện tại</div>
          <div className="font-bold text-amber-400">EMPLOYEE</div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng nhân sự</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">1</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phòng ban</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">4</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hệ thống AI Agents</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">5 Agents</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phòng ban của bạn</p>
            <h3 className="text-base font-bold text-slate-800 mt-1 truncate max-w-[150px]">Phòng Kinh doanh &...</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Agents Squad Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">5 AI Agents Squad</h2>
          <p className="text-sm text-slate-500">Các tác tử trí tuệ nhân tạo hỗ trợ toàn diện vòng đời nhân sự</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.title}
                href={agent.href}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-2xl ${agent.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {agent.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {agent.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {agent.desc}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động
                  </span>
                  <span className="text-slate-400 group-hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                    {agent.stats} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
