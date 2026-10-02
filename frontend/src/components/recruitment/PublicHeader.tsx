'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, LogIn, Briefcase } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="h-16 md:h-[72px] bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      {/* Brand logo & company name */}
      <Link href="/careers" className="flex items-center space-x-3 group">
        <div className="h-10 w-10 rounded-[12px] bg-[#ACE77E] flex items-center justify-center text-[#0F172A] font-bold shadow-xs group-hover:bg-[#92D861] transition-colors duration-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-[#0F172A] text-base tracking-tight flex items-center gap-1.5">
            HR Platform
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[12px] bg-slate-100 text-[#475569] border border-[#E2E8F0] hidden sm:inline-block">
              Tuyển dụng
            </span>
          </span>
          <span className="block text-[11px] text-[#64748B] font-medium">
            Cơ hội nghề nghiệp & Tuyển dụng AI
          </span>
        </div>
      </Link>

      {/* Navigation actions */}
      <div className="flex items-center space-x-3">
        <Link
          href="/careers"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-2 rounded-[12px] transition duration-150"
        >
          <Briefcase className="h-4 w-4" />
          <span>Vị trí tuyển dụng</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-100 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-[12px] transition duration-150 border border-[#E2E8F0] shadow-xs active:bg-slate-200"
        >
          <LogIn className="h-4 w-4 text-[#475569]" />
          <span className="hidden sm:inline">Đăng nhập</span>
          <span className="sm:hidden">Đăng nhập</span>
        </Link>
      </div>
    </header>
  );
}
