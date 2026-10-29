'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck,
  Compass,
  Heart
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { SalaryCalculatorModal } from './SalaryCalculatorModal';
import { ITReportModal } from './ITReportBanner';
import { CVBuilderModal } from './CVBuilderModal';
import { AuthModal } from './AuthModal';

export interface HeaderProps {
  savedJobsCount?: number;
  onOpenSavedJobs?: () => void;
  onOpenSalaryCalc?: () => void;
  onOpenCVBuilder?: () => void;
  onOpenReportModal?: () => void;
  onOpenAuthModal?: () => void;
  onSelectNav?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedJobsCount = 0,
  onOpenSavedJobs,
  onOpenSalaryCalc,
  onOpenCVBuilder,
  onOpenReportModal,
  onOpenAuthModal,
  onSelectNav
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hrDropdownOpen, setHrDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // Internal Modals fallback state when Header is rendered standalone
  const [internalSalaryOpen, setInternalSalaryOpen] = useState(false);
  const [internalReportOpen, setInternalReportOpen] = useState(false);
  const [internalCVOpen, setInternalCVOpen] = useState(false);
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hrDropdownRef = useRef<HTMLDivElement>(null);
  const hrDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (hrDropdownRef.current && !hrDropdownRef.current.contains(event.target as Node)) {
        setHrDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!hrDropdownOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHrDropdownOpen(false);
        hrDropdownButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [hrDropdownOpen]);

  const handleNavClick = (sectionId: string) => {
    if (onSelectNav) {
      onSelectNav(sectionId);
    } else {
      if (pathname === '/' || pathname === '/careers') {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        router.push(`/#${sectionId}`);
      }
    }
    setMobileMenuOpen(false);
  };

  const handleSalaryCalcClick = () => {
    if (onOpenSalaryCalc) {
      onOpenSalaryCalc();
    } else {
      setInternalSalaryOpen(true);
    }
  };

  const handleReportModalClick = () => {
    if (onOpenReportModal) {
      onOpenReportModal();
    } else {
      setInternalReportOpen(true);
    }
  };

  const handleCVBuilderClick = () => {
    if (onOpenCVBuilder) {
      onOpenCVBuilder();
    } else {
      setInternalCVOpen(true);
    }
  };

  const handleAuthModalClick = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      setInternalAuthOpen(true);
    }
  };

  const handleSavedJobsClick = () => {
    if (onOpenSavedJobs) {
      onOpenSavedJobs();
    } else {
      router.push('/?saved=true');
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'HR':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MANAGER':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const isHRPage = ['/dashboard', '/recruitment', '/onboarding', '/performance', '/training', '/engagement'].some(
    p => pathname === p || pathname.startsWith(p + '/')
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-6 h-16 sm:h-18">
            
            {/* Zone 1: Single Brand Wordmark */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-1.5 focus:outline-none group text-left cursor-pointer"
                title="UpCareer - Việc Làm IT Hàng Đầu Việt Nam"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-base sm:text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <span className="font-mono tracking-tighter text-white">&lt;/&gt;</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center text-lg sm:text-2xl font-black tracking-tight leading-none text-slate-900">
                    <span className="text-red-600">UP</span>
                    <span className="text-slate-900">CAREER</span>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-tight mt-0.5 truncate max-w-[120px] sm:max-w-none">
                    Vietnam IT Jobs & HR Tech
                  </span>
                </div>
              </Link>
            </div>

            {/* Zone 2: Navigation Links (single-line, clean typography, responsive gap) */}
            <nav className="hidden lg:flex items-center gap-2.5 xl:gap-5 text-xs xl:text-sm font-semibold text-slate-700">
              <Link
                href="/"
                className={`hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1.5 px-1 cursor-pointer ${
                  pathname === '/' || pathname === '/careers' ? 'text-red-600 font-bold' : ''
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-400" />
                <span>Việc làm IT</span>
              </Link>

              {/* AI HR Agents Dropdown */}
              <div className="relative" ref={hrDropdownRef}>
                <button
                  ref={hrDropdownButtonRef}
                  id="hr-agents-trigger"
                  aria-expanded={hrDropdownOpen}
                  aria-controls="hr-agents-menu"
                  onClick={() => setHrDropdownOpen((open) => !open)}
                  className={`hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1.5 px-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-md ${
                    isHRPage ? 'text-red-600 font-bold' : ''
                  }`}
                >
                  <LayoutDashboard className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${isHRPage ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>Cổng Quản Trị HR</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${hrDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {hrDropdownOpen && (
                  <div
                    id="hr-agents-menu"
                    className="absolute left-0 mt-2 w-72 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/dashboard' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Bảng Điều Khiển Tổng Quan</span>
                    </Link>
                    <Link
                      href="/recruitment"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/recruitment' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Tuyển Dụng & Ứng Viên (ATS)</span>
                    </Link>
                    <Link
                      href="/onboarding"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/onboarding' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Tiếp Nhận & Hội Nhập Nhân Sự</span>
                    </Link>
                    <Link
                      href="/performance"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/performance' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Quản Trị Hiệu Suất 360°</span>
                    </Link>
                    <Link
                      href="/training"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/training' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Đào Tạo & Phát Triển Kỹ Năng</span>
                    </Link>
                    <Link
                      href="/engagement"
                      onClick={() => setHrDropdownOpen(false)}
                      className={`mx-1 flex min-h-10 items-center gap-2.5 rounded-lg px-3.5 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset ${
                        pathname === '/engagement' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span className="leading-tight">Khảo Sát Gắn Kết & Phúc Lợi</span>
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('companies-section')}
                className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1.5 px-1 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-400" />
                <span>Công ty hàng đầu</span>
              </button>

              {/* Tools Dropdown */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className="hover:text-red-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1.5 px-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-red-500" />
                  <span>Công Cụ IT</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        handleReportModalClick();
                      }}
                      className="w-full flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span>Báo cáo Lương IT</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded">2026</span>
                    </button>

                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        handleSalaryCalcClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-left"
                    >
                      <Calculator className="w-4 h-4 text-slate-400" />
                      <span>Tính Lương Gross - Net</span>
                    </button>

                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        handleCVBuilderClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Tạo CV IT Chuẩn Quốc Tế</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Zone 3: Actions & Primary CTA / Profile Box */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Bookmarked Jobs button */}
              <button
                onClick={handleSavedJobsClick}
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

              {/* Authenticated User Profile Box vs Guest Login */}
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-none"
                    title="Tài khoản cá nhân"
                    aria-label="Mở menu tài khoản"
                  >
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-red-600 to-rose-700 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-xs shrink-0">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] font-semibold text-red-600 tracking-wide uppercase">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-68 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      {/* User Card */}
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-600 to-rose-700 text-white font-extrabold text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                            {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeColor(user.role)} uppercase`}>
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {user.department?.name || 'Hệ thống HR Tech'}
                          </span>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="py-1 text-xs font-semibold text-slate-700">
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Bảng Điều Khiển Tổng Quan</span>
                        </Link>

                        <Link
                          href="/recruitment"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>Tuyển Dụng & Ứng Viên (ATS)</span>
                        </Link>

                        <Link
                          href="/onboarding"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-slate-400" />
                          <span>Tiếp Nhận & Hội Nhập Nhân Sự</span>
                        </Link>

                        <Link
                          href="/performance"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                          <span>Quản Trị Hiệu Suất & Đánh Giá 360°</span>
                        </Link>

                        <Link
                          href="/training"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          <span>Đào Tạo & Phát Triển Kỹ Năng</span>
                        </Link>

                        <Link
                          href="/engagement"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50/60 hover:text-red-600 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>Khảo Sát Gắn Kết & Phúc Lợi</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                            router.push('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Candidate Login */}
                  <button
                    onClick={handleAuthModalClick}
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
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
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
            {isAuthenticated && user && (
              <div className="p-3 mb-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-600 to-rose-700 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(user.role)} uppercase`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    router.push('/login');
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              Việc làm IT
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Bảng Điều Khiển Tổng Quan
            </Link>

            <Link
              href="/recruitment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              Tuyển Dụng & Ứng Viên (ATS)
            </Link>

            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              Tiếp Nhận & Hội Nhập Nhân Sự
            </Link>

            <Link
              href="/performance"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-slate-500" />
              Quản Trị Hiệu Suất & Đánh Giá 360°
            </Link>

            <Link
              href="/training"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Đào Tạo & Phát Triển Kỹ Năng
            </Link>

            <Link
              href="/engagement"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-slate-500" />
              Khảo Sát Gắn Kết & Phúc Lợi
            </Link>

            <button
              onClick={() => { setMobileMenuOpen(false); handleReportModalClick(); }}
              className="w-full text-left py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-red-600" />
              Báo cáo Lương IT 2026
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); handleSalaryCalcClick(); }}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-slate-500" />
              Công cụ Tính Lương Gross-Net
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); handleCVBuilderClick(); }}
              className="w-full text-left py-2.5 px-3 text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Tạo CV IT Chuyên Nghiệp
            </button>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {isAuthenticated && user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 bg-red-600 text-white font-bold rounded-lg block cursor-pointer"
                >
                  Vào Bảng Điều Khiển HR
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleAuthModalClick(); }}
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
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Internal Modals rendered when Header is used standalone on pages */}
      {!onOpenSalaryCalc && (
        <SalaryCalculatorModal
          isOpen={internalSalaryOpen}
          onClose={() => setInternalSalaryOpen(false)}
        />
      )}
      {!onOpenReportModal && (
        <ITReportModal
          isOpen={internalReportOpen}
          onClose={() => setInternalReportOpen(false)}
        />
      )}
      {!onOpenCVBuilder && (
        <CVBuilderModal
          isOpen={internalCVOpen}
          onClose={() => setInternalCVOpen(false)}
        />
      )}
      {!onOpenAuthModal && (
        <AuthModal
          isOpen={internalAuthOpen}
          onClose={() => setInternalAuthOpen(false)}
          onLoginSuccess={() => setInternalAuthOpen(false)}
        />
      )}
    </>
  );
};
