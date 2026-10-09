'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, Role } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import {
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/departments')
      .then((res) => {
        setDepartments(res.data);
        if (res.data.length > 0) {
          setDepartmentId(res.data[0].id);
        }
      })
      .catch((err) => console.error('Lỗi tải departments:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        fullName,
        role,
        departmentId: departmentId || undefined,
      });
      router.push('/dashboard');
    } catch {
      // Handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 font-sans relative selection:bg-[#171717] selection:text-white">
      {/* Micro-dot grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ebebeb_1px,transparent_1px),linear-gradient(to_bottom,#ebebeb_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-[16px] border border-[#ebebeb] shadow-[0px_4px_24px_rgba(0,0,0,0.04)] p-7 md:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
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
                <span className="font-semibold text-sm text-[#171717] tracking-tight block leading-tight">
                  HR Platform
                </span>
                <span className="font-mono text-[9px] text-[#8f8f8f] uppercase tracking-wider block">
                  Enterprise ATS
                </span>
              </div>
            </Link>

            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              PORTAL_REGISTER
            </span>
          </div>

          <div className="pt-2">
            <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider mb-1">
              ĐĂNG KÝ THÀNH VIÊN MỚI
            </div>
            <h1 className="text-xl font-semibold text-[#171717] tracking-tight">
              Đăng ký tài khoản
            </h1>
            <p className="text-xs text-[#8f8f8f] mt-1 leading-relaxed">
              Tạo tài khoản để tham gia hệ thống Quản trị Nhân sự & Tuyển dụng.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-[8px] flex items-center justify-between text-xs text-[#991b1b] animate-shake">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#dc2626]" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-[#991b1b] hover:text-[#171717] p-1 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-[#171717] placeholder:text-[#8f8f8f] border border-[#ebebeb] rounded-[8px] text-xs font-medium focus-ring transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Email công việc
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-[#171717] placeholder:text-[#8f8f8f] border border-[#ebebeb] rounded-[8px] text-xs font-medium focus-ring transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#171717]">
                Mật khẩu
              </label>
              <span className="text-[10px] font-mono text-[#8f8f8f]">
                Tối thiểu 6 ký tự
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white text-[#171717] placeholder:text-[#8f8f8f] border border-[#ebebeb] rounded-[8px] text-xs font-medium focus-ring transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8f8f8f] hover:text-[#171717] p-0.5 rounded transition cursor-pointer"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Vai trò (Role)
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white text-[#171717] border border-[#ebebeb] rounded-[8px] text-xs font-medium focus-ring transition cursor-pointer"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Nhân viên)</option>
                  <option value="HR">HR (Nhân sự & Tuyển dụng)</option>
                  <option value="MANAGER">MANAGER (Quản lý)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                Phòng ban
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-[#8f8f8f]" aria-hidden="true" />
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white text-[#171717] border border-[#ebebeb] rounded-[8px] text-xs font-medium focus-ring transition cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 bg-[#171717] hover:bg-[#333333] text-white rounded-[8px] text-xs font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-ring"
          >
            <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#ebebeb] text-center text-xs text-[#8f8f8f]">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#0070f3] font-semibold hover:underline cursor-pointer">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
}
