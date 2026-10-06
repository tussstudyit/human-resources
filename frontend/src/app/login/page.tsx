'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-200/80">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600 text-white items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng nhập hệ thống</h2>
          <p className="text-xs text-slate-500 mt-1">Cổng thông tin Quản lý Nhân sự & AI Agents</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Email làm việc</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.ban@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          Chưa có tài khoản nhân viên?{' '}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Đăng ký tại đây
          </Link>
        </div>

        {/* Banner dẫn tới trang tuyển dụng công khai */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-medium text-slate-600">Bạn là ứng viên?</span>
          </div>
          <Link
            href="/careers"
            className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center gap-1 hover:underline"
          >
            <span>Xem việc làm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
