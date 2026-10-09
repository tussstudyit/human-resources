'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
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

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="flex-1 flex flex-col min-w-0">
          <RecruitmentAdminClient />
        </main>
      </div>
    </div>
  );
}
