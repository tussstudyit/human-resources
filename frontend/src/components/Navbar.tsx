'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Globe, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'HR':
        return 'bg-red-50 text-red-700 border-red-200 font-semibold';
      case 'MANAGER':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center space-x-3">
        <h1 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
          <span className="text-red-600">UPCAREER</span> HR Management Console
        </h1>
        <span className="text-slate-300 font-mono text-xs">/</span>
        <span className="text-xs text-slate-400 font-mono">
          Enterprise Cloud
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50/70 border border-slate-200 px-3 py-1.5 rounded-[6px] font-medium transition-colors"
          title="Mở cổng việc làm công khai UpCareer trong tab mới"
        >
          <Globe className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
          <span>Xem Cổng Việc Làm UpCareer</span>
          <ExternalLink className="h-3 w-3 text-slate-400" aria-hidden="true" />
        </Link>

        {user && (
          <div className="flex items-center space-x-2.5 py-1 px-3 rounded-[6px] bg-slate-50 border border-slate-200">
            <div className="h-6 w-6 rounded-[4px] bg-linear-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-[10px] uppercase shadow-xs">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="text-left flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-900">
                {user.fullName}
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-[4px] border ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-red-600 bg-white hover:bg-red-50/60 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-[6px] font-medium transition-colors shadow-xs cursor-pointer focus-ring"
          title="Đăng xuất"
          aria-label="Đăng xuất khỏi tài khoản"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
