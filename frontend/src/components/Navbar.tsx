'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User, Shield, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'HR':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-bold text-slate-900">
          Hệ thống Quản lý Nhân sự & AI Agents
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-50 py-1.5 px-3.5 rounded-full border border-slate-200">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{user.fullName}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                    user.role,
                  )}`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {user.department?.name || user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl font-bold transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
