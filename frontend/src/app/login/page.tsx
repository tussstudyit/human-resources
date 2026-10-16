'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  X,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, error, clearError, initAuth, isAuthenticated, isInitialized } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/recruitment');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/recruitment');
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Subtle tech background grid pattern & ambient glow from TopDev Hero */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-7 md:p-8 space-y-6">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-lg shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-mono tracking-tighter text-white">&lt;/&gt;</span>
              </div>
              <div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                  <span className="text-red-600">TOP</span>DEV <span className="text-slate-700 font-semibold text-sm">HR Platform</span>
                </span>
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block">
                  Enterprise ATS & Recruitment
                </span>
              </div>
            </Link>

            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="pt-2">
            <div className="font-mono text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" />
              <span>// AUTHENTICATION_GATEWAY</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Đăng nhập hệ thống
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Nhập email và mật khẩu công việc của bạn để quản trị nhân sự và ATS.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800 animate-shake">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-red-700 hover:text-red-900 p-1 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email công việc
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.ban@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mật khẩu
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                Tối thiểu 6 ký tự
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/10 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/30"
          >
            <span>{isSubmitting ? 'Đang xác thực thông tin...' : 'Đăng nhập vào Hệ thống'}</span>
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Chưa có tài khoản nhân viên?{' '}
          <Link href="/register" className="text-red-600 font-bold hover:text-red-700 hover:underline cursor-pointer">
            Đăng ký tại đây
          </Link>
        </div>

        {/* Public Careers Portal Shortcut */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-red-600 shadow-2xs">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Bạn là ứng viên?</p>
              <p className="text-[10px] text-slate-400 font-mono">// CỔNG_VIỆC_LÀM_UPCAREER</p>
            </div>
          </div>
          <Link
            href="/careers"
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-600 hover:text-white text-slate-700 border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Xem việc làm</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
