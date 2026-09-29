'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootPage() {
  const router = useRouter();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('token');
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });
  }, [initAuth, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Đang khởi động HR Platform...</span>
      </div>
    </div>
  );
}
