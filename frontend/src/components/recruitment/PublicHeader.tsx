'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { LogIn, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function PublicHeader() {
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <header className="h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-[#ebebeb] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0px_1px_1px_rgba(0,0,0,0.02)] transition-all font-sans">
      {/* Brand logo & company name */}
      <Link href="/careers" className="flex items-center space-x-3 group">
        <div className="h-8 w-8 rounded-[6px] bg-[#171717] flex items-center justify-center text-white shadow-[0px_1px_2px_rgba(0,0,0,0.1)] group-hover:bg-[#333333] transition-colors">
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 75 65"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M37.5 0L75 65H0z" />
          </svg>
        </div>
        <div>
          <span className="font-semibold text-[#171717] text-sm tracking-tight flex items-center gap-1.5">
            HR Platform
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#f2f2f2] text-[#4d4d4d] border border-[#ebebeb] hidden sm:inline-block">
              CAREERS
            </span>
          </span>
          <span className="block text-[11px] text-[#8f8f8f] font-normal leading-tight">
            Cơ hội nghề nghiệp & Việc làm hấp dẫn
          </span>
        </div>
      </Link>

      {/* Navigation actions */}
      <div className="flex items-center space-x-2.5">
        <Link
          href="/careers"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-[#4d4d4d] hover:text-[#171717] px-3 py-1.5 rounded-[6px] transition-colors hover:bg-[#fafafa]"
        >
          <Briefcase className="h-3.5 w-3.5 text-[#8f8f8f]" />
          <span>Vị trí tuyển dụng</span>
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2">
            <Link
              href="/recruitment"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-red-600 bg-slate-50 hover:bg-red-50/60 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-linear-to-br from-red-600 to-rose-700 text-white font-extrabold text-[10px] flex items-center justify-center uppercase shadow-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <span>{user.fullName}</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 uppercase">
                {user.role}
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Bảng điều khiển"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#171717] hover:bg-[#fafafa] bg-white px-3 py-1.5 rounded-[6px] transition-colors border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5 text-[#8f8f8f]" />
            <span>Cổng Quản Trị HR</span>
          </Link>
        )}
      </div>
    </header>
  );
}
