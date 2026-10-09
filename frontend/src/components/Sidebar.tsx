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
  Compass,
  TrendingUp,
  Heart,
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
      name: 'AI Employee Engagement',
      desc: 'Khảo sát eNPS & Wellbeing (n8n)',
      icon: Heart,
      href: '#',
      badge: 'LIVE N8N',
    },
  ];

  return (
    <aside className="w-68 bg-white text-[#171717] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#ebebeb] select-none font-sans">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center border-b border-[#ebebeb] justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5 group">
          {/* Iconic Minimalist Vercel Triangle mark */}
          <div className="h-7 w-7 rounded-[6px] bg-[#171717] flex items-center justify-center text-white shadow-[0px_1px_2px_rgba(0,0,0,0.1)] group-hover:bg-[#333333] transition-colors">
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 75 65"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M37.5 0L75 65H0z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-sm text-[#171717] tracking-tight block leading-tight">
              HR Platform
            </span>
            <span className="font-mono text-[10px] text-[#8f8f8f] uppercase tracking-wider block">
              Multi-Agent ATS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Overview section */}
        <div>
          <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider px-2.5 mb-1.5">
            // Overview
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors focus-ring cursor-pointer ${
              pathname === '/dashboard'
                ? 'bg-[#f2f2f2] text-[#171717] font-semibold'
                : 'text-[#4d4d4d] hover:text-[#171717] hover:bg-[#fafafa]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-[#8f8f8f]" aria-hidden="true" />
            <span>Bảng điều khiển</span>
          </Link>
        </div>

        {/* AI AGENT LIST */}
        <div>
          <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider px-2.5 mb-1.5 flex items-center justify-between">
            <span>// AI Agent</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-mono">
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
                        isActive ? 'text-[#171717]' : 'text-[#8f8f8f]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs truncate ${
                          isActive
                            ? 'font-semibold text-[#171717]'
                            : 'font-medium text-[#4d4d4d] group-hover:text-[#171717]'
                        }`}
                      >
                        {agent.name}
                      </div>
                      <p className="text-[10px] text-[#8f8f8f] truncate leading-tight">
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
                        ? 'bg-[#f2f2f2] text-[#171717] border border-[#ebebeb]'
                        : 'hover:bg-[#fafafa] text-[#4d4d4d] hover:text-[#171717]'
                    }`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={agent.name}
                  className="px-2.5 py-2 rounded-[6px] text-[#8f8f8f] opacity-75 hover:opacity-100 transition-opacity cursor-default group"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Administration Section */}
        <div>
          <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider px-2.5 mb-1.5">
            // Management
          </div>
          <div className="space-y-0.5">
            <Link
              href="/dashboard#employees"
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[#4d4d4d] hover:text-[#171717] hover:bg-[#fafafa] transition-colors focus-ring cursor-pointer"
            >
              <Users className="h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
              <span>Danh sách nhân sự</span>
            </Link>
            <Link
              href="/dashboard#departments"
              className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-[#4d4d4d] hover:text-[#171717] hover:bg-[#fafafa] transition-colors focus-ring cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
              <span>Cơ cấu phòng ban</span>
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-3 border-t border-[#ebebeb] bg-[#fafafa]">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-[6px] bg-[#171717] text-white flex items-center justify-center font-mono font-medium text-xs uppercase shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#171717] truncate leading-tight">
                {user.fullName}
              </p>
              <p className="font-mono text-[10px] text-[#8f8f8f] truncate">
                {user.role} • {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
