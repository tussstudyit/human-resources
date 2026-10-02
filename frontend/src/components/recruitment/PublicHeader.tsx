'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, LogIn, Briefcase } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand logo & title */}
      <Link href="/careers" className="flex items-center space-x-3 group">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-black text-slate-900 text-base tracking-tight flex items-center gap-1.5">
            HR Platform
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
              Careers
            </span>
          </span>
          <span className="block text-[11px] text-slate-500 font-medium">
            Cơ hội nghề nghiệp & Tuyển dụng AI
          </span>
        </div>
      </Link>

      {/* Navigation actions */}
      <div className="flex items-center space-x-3">
        <Link
          href="/careers"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-xl transition"
        >
          <Briefcase className="h-4 w-4" />
          <span>Vị trí tuyển dụng</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-xl transition border border-slate-200/60"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Đăng nhập nhân viên nội bộ</span>
          <span className="sm:hidden">Đăng nhập</span>
        </Link>
      </div>
    </header>
  );
}
