'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  Bookmark, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Building2, 
  Briefcase, 
  User, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  savedJobsCount: number;
  onOpenSavedJobs: () => void;
  onOpenSalaryCalc: () => void;
  onOpenCVBuilder: () => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onSelectNav: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedJobsCount,
  onOpenSavedJobs,
  onOpenSalaryCalc,
  onOpenCVBuilder,
  onOpenReportModal,
  onOpenAuthModal,
  onSelectNav
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onSelectNav(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleNavClick('hero')} 
              className="flex items-center gap-1.5 focus:outline-none group text-left"
              title="UpCareer - Việc Làm IT Hàng Đầu Việt Nam"
            >
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-xl shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-mono tracking-tighter text-white">&lt;/&gt;</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center text-2xl font-black tracking-tight leading-none text-slate-900">
                  <span className="text-red-600">UP</span>
                  <span className="text-slate-900">CAREER</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-tight mt-0.5">
                  Vietnam IT Jobs
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button
              onClick={() => handleNavClick('jobs-section')}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              Việc làm IT
            </button>

            <button
              onClick={() => handleNavClick('companies-section')}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              Công ty hàng đầu
            </button>

            <button
              onClick={onOpenReportModal}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-red-500" />
              Báo cáo Lương IT
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">2026</span>
            </button>

            <button
              onClick={onOpenSalaryCalc}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              Tính Lương Gross-Net
            </button>

            <button
              onClick={onOpenCVBuilder}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              Tạo CV IT
            </button>

            <button
              onClick={() => handleNavClick('blog-section')}
              className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 py-2 cursor-pointer"
            >
              Blog IT
            </button>
          </nav>

          {/* Zone 3: Actions & Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bookmarked Jobs button */}
            <button
              onClick={onOpenSavedJobs}
              className="relative p-2.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Việc làm đã lưu"
            >
              <Bookmark className="w-5 h-5" />
              {savedJobsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                  {savedJobsCount}
                </span>
              )}
            </button>

            {/* Candidate Login */}
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              Đăng nhập / Đăng ký
            </button>

            {/* Employer Primary CTA button -> Link to HR Admin Portal */}
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-all shadow-xs hover:shadow whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              title="Truy cập Cổng Quản trị Tuyển dụng HR ATS"
            >
              <span>Cổng Quản Trị HR</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 text-sm font-semibold">
          <button
            onClick={() => handleNavClick('jobs-section')}
            className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-slate-500" />
            Việc làm IT
          </button>
          <button
            onClick={() => handleNavClick('companies-section')}
            className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            Công ty hàng đầu
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenReportModal(); }}
            className="w-full text-left py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-red-600" />
            Báo cáo Lương IT 2026
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenSalaryCalc(); }}
            className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-slate-500" />
            Công cụ Tính Lương Gross-Net
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCVBuilder(); }}
            className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            Tạo CV IT Chuyên Nghiệp
          </button>
          <button
            onClick={() => handleNavClick('blog-section')}
            className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
          >
            Blog IT & Xu Hướng
          </button>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuthModal(); }}
              className="w-full text-center py-2.5 px-3 bg-slate-100 text-slate-800 font-bold rounded-lg cursor-pointer"
            >
              Đăng nhập / Đăng ký ứng viên
            </button>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-3 bg-red-600 text-white font-bold rounded-lg block cursor-pointer"
            >
              Cổng Quản Trị Tuyển Dụng HR
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
