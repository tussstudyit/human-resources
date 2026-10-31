'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  LayoutDashboard,
  Building2,
  ChevronRight,
  Globe,
  ExternalLink,
  Compass,
  TrendingUp,
  Heart,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const agents = [
    {
      name: 'AI Recruitment Agent',
      desc: 'CV parse, AI score, Phỏng vấn',
      icon: Briefcase,
      href: '/recruitment',
      badge: 'ACTIVE',
    },
    {
      name: 'AI Onboarding Agent',
      desc: 'Checklist nhận việc & cấp tài khoản',
      icon: Compass,
      href: '/onboarding',
      badge: 'ACTIVE',
    },
    {
      name: 'AI Performance Agent',
      desc: 'Theo dõi KPI & đánh giá 360°',
      icon: TrendingUp,
      href: '/performance',
      badge: 'ACTIVE',
    },
    {
      name: 'AI Training & Skills',
      desc: 'Skill Gap Radar & Chứng chỉ',
      icon: GraduationCap,
      href: '/training',
      badge: 'ACTIVE',
    },
    {
      name: 'AI Employee Engagement',
      desc: 'Khảo sát eNPS & Phúc lợi',
      icon: Heart,
      href: '/engagement',
      badge: 'ACTIVE',
    },
  ];

  return (
    <aside className="w-68 bg-white text-[#0F172A] flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200 select-none font-sans">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center border-b border-slate-200 justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          {/* UpCareer Brand Badge */}
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-mono font-extrabold text-sm tracking-tighter">&lt;/&gt;</span>
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight">
              <span className="text-red-600">UP</span>CAREER <span className="text-slate-700 font-semibold text-xs">HR</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block">
              Hệ Thống Tuyển Dụng AI
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Overview section */}
        <div>
          <div className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
            Tổng quan
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-[6px] text-xs font-medium transition-colors focus-ring cursor-pointer ${
              pathname === '/dashboard'
                ? 'bg-red-50 text-red-700 font-semibold border-l-2 border-red-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 shrink-0 ${pathname === '/dashboard' ? 'text-red-600' : 'text-slate-400'}`} aria-hidden="true" />
            <span>Bảng điều khiển</span>
          </Link>
        </div>

        {/* AI AGENT LIST */}
        <div>
          <div className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5 flex items-center justify-between">
            <span>AI Agents</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>

          <div className="space-y-0.5">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = pathname === agent.href;

              const content = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-red-600' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs truncate ${
                          isActive
                            ? 'font-semibold text-red-700'
                            : 'font-medium text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {agent.name}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate leading-tight">
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (agent.href) {
                return (
                  <Link
                    key={agent.name}
                    href={agent.href}
                    className={`block px-2.5 py-2 rounded-[6px] transition-colors cursor-pointer group focus-ring ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={agent.name}
                  className="px-2.5 py-2 rounded-[6px] text-slate-400 opacity-75 hover:opacity-100 transition-opacity cursor-default group"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Portal Shortcut Section */}
        <div>
          <div className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
            // Cổng Tuyển Dụng
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-2 rounded-[6px] text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/70 transition-colors focus-ring cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Globe className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
              <span className="truncate">Cổng Việc Làm UpCareer</span>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
          </Link>
        </div>

        {/* Administration Section */}
        <div>
          <div className="font-mono text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
            Quản trị hệ thống
          </div>
          <div className="space-y-0.5">
            <Link
              href="/dashboard#employees"
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-ring cursor-pointer"
            >
              <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>Danh sách nhân sự</span>
            </Link>
            <Link
              href="/dashboard#departments"
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-ring cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <span>Cơ cấu phòng ban</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {user.fullName}
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate mt-0.5">
                <span className="font-semibold text-red-600">
                  {user.role === 'HR' ? 'Quản Trị HR' : user.role === 'MANAGER' ? 'Quản Lý' : 'Nhân Viên'}
                </span> • {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
