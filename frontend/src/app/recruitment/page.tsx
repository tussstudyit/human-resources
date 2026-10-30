'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Header } from '@/components/topdev/Header';
import Footer from '@/components/topdev/Footer';
import RecruitmentAdminClient from '@/components/recruitment/admin/RecruitmentAdminClient';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

export default function RecruitmentAdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#171717] text-xs font-mono">
        <div className="flex items-center space-x-2.5 p-4 rounded-[6px] border border-[#ebebeb] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
          <div className="h-4 w-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#4d4d4d]">VERIFYING_PERMISSIONS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center text-[#171717] font-sans">
        <div className="w-12 h-12 rounded-[6px] bg-white border border-[#ebebeb] flex items-center justify-center text-[#171717] mb-4 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
          <Lock className="w-5 h-5 text-[#171717]" />
        </div>
        <div className="font-mono text-[11px] text-[#8f8f8f] uppercase tracking-wider mb-1">
          // 403 Forbidden
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2 text-[#171717]">
          Yêu Cầu Quyền Quản Trị Tuyển Dụng
        </h2>
        <p className="text-xs text-[#4d4d4d] max-w-sm mb-6 leading-relaxed">
          Khu vực bảo mật dành cho Chuyên viên Tuyển dụng (HR). Vui lòng đăng nhập với tài khoản hợp lệ để tiếp tục.
        </p>
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-[6px] bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] flex items-center space-x-1.5"
          >
            <span>Đăng nhập HR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/careers"
            className="px-4 py-2 rounded-[6px] bg-white hover:bg-[#fafafa] text-[#171717] text-xs font-medium border border-[#ebebeb] transition-colors"
          >
            Cổng Việc Làm Công Khai
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="font-mono text-[11px] text-amber-600 font-bold uppercase tracking-wider mb-1">
            403 - Giới hạn phân quyền tài khoản
          </div>
          <h2 className="text-xl font-bold tracking-tight mb-2 text-slate-900">
            Khu Vực Quản Trị Tuyển Dụng Dành Riêng Cho HR
          </h2>
          <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed">
            Bạn đang đăng nhập với tài khoản Nhân viên ({user.fullName}). Cổng Tuyển dụng ATS dành riêng cho Ban Quản trị Nhân sự (HR). Bạn có thể truy cập Không Gian Nhân Viên để xem lộ trình đào tạo, hội nhập hoặc quay lại Cổng Việc Làm.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              Vào Không Gian Nhân Viên
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
            >
              Về Cổng Việc Làm UpCareer
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <RecruitmentAdminClient />
      </main>
      <Footer />
    </div>
  );
}
