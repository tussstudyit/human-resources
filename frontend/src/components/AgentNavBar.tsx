'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Compass,
  TrendingUp,
  GraduationCap,
  Heart,
  Users,
  Building2,
} from 'lucide-react';

export default function AgentNavBar() {
  const pathname = usePathname();

  const agents = [
    {
      name: 'Tổng quan',
      desc: 'Báo cáo',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      name: '1. AI Recruitment',
      desc: 'WF 04-06',
      icon: Briefcase,
      href: '/recruitment',
    },
    {
      name: '2. AI Onboarding',
      desc: 'WF 07-08',
      icon: Compass,
      href: '/onboarding',
    },
    {
      name: '3. AI Performance',
      desc: 'WF 09',
      icon: TrendingUp,
      href: '/performance',
    },
    {
      name: '4. AI Training & Skills',
      desc: 'WF 10-11',
      icon: GraduationCap,
      href: '/training',
    },
    {
      name: '5. AI Engagement',
      desc: 'WF 12',
      icon: Heart,
      href: '/engagement',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Horizontal agent switcher tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {agents.map((agent) => {
              const isActive = pathname === agent.href;
              const Icon = agent.icon;

              return (
                <Link
                  key={agent.href}
                  href={agent.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{agent.name}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {agent.desc}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Quick Shortcuts for Dashboard */}
          {pathname === '/dashboard' && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
              <a
                href="#employees"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Nhân sự</span>
              </a>
              <a
                href="#departments"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Phòng ban</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
