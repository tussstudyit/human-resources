'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut } from 'lucide-react';
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
        return 'bg-[#f2f2f2] text-[#171717] border-[#ebebeb]';
      case 'MANAGER':
        return 'bg-[#d3e5ff] text-[#0761d1] border-[#0070f3]/20';
      default:
        return 'bg-[#f2f2f2] text-[#4d4d4d] border-[#ebebeb]';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#ebebeb] px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      <div className="flex items-center space-x-3">
        <h1 className="text-xs font-semibold text-[#171717] tracking-tight uppercase font-mono">
          HR Management Console
        </h1>
        <span className="text-[#8f8f8f] font-mono text-xs">/</span>
        <span className="text-xs text-[#8f8f8f] font-mono">
          Enterprise Cloud
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2.5 py-1 px-3 rounded-[6px] bg-[#fafafa] border border-[#ebebeb]">
            <div className="h-6 w-6 rounded-[4px] bg-[#171717] text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {user.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="text-left flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#171717]">
                {user.fullName}
              </span>
              <span
                className={`font-mono text-[10px] font-medium px-1.5 py-0.2 rounded-[4px] border ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 text-xs text-[#4d4d4d] hover:text-[#ee0000] bg-white hover:bg-[#fafafa] border border-[#ebebeb] px-2.5 py-1.5 rounded-[6px] font-medium transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] cursor-pointer focus-ring"
          title="Đăng xuất"
          aria-label="Đăng xuất khỏi tài khoản"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
