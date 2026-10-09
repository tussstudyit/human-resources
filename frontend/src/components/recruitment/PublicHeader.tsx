'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, Briefcase } from 'lucide-react';

export default function PublicHeader() {
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

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#171717] hover:bg-[#fafafa] bg-white px-3 py-1.5 rounded-[6px] transition-colors border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5 text-[#8f8f8f]" />
          <span>Cổng Quản Trị HR</span>
        </Link>
      </div>
    </header>
  );
}
