'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Briefcase,
  Compass,
  LineChart,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const agents = [
    {
      name: 'AI Recruitment Agent',
      desc: 'Job posting, CV analysis, interview scheduling',
      icon: Briefcase,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      href: '/careers',
    },
    {
      name: 'AI Onboarding Agent',
      desc: 'New-hire checklists, tool access, training',
      icon: Compass,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
    },
    {
      name: 'AI Performance Tracking',
      desc: 'Feedback collection, KPI dashboards',
      icon: LineChart,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      name: 'AI Training & Skills Agent',
      desc: 'Certification reminders, ROI analysis',
      icon: GraduationCap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'AI Employee Engagement',
      desc: 'Surveys, wellbeing actions, engagement',
      icon: HeartHandshake,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight">HR Platform</span>
          <span className="block text-[11px] text-slate-400 font-medium">Multi-Agent System</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Tổng quan
          </div>
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${
              pathname === '/dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Bảng điều khiển</span>
          </Link>
        </div>

        {/* 5 AI AGENTS LIST */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>5 AI Agents</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="space-y-1">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const content = (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${agent.bgColor} ${agent.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {agent.name}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{agent.desc}</p>
                  </div>
                </div>
              );

              if (agent.href) {
                return (
                  <Link
                    key={agent.name}
                    href={agent.href}
                    className="block p-2.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer group"
                    title={`Mở ${agent.name}`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={agent.name}
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer group"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Management */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Quản trị nhân sự
          </div>
          <div className="space-y-1">
            <a
              href="#employees"
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
            >
              <Users className="h-4 w-4 text-indigo-400" />
              <span>Danh sách nhân sự</span>
            </a>
            <a
              href="#departments"
              className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition"
            >
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>Cơ cấu phòng ban</span>
            </a>
          </div>
        </div>
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
