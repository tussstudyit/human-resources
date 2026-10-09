'use client';

import React, { useEffect } from 'react';
import { useToastStore } from '@/store/useToastStore';
import { ToastItem } from '@/types/recruitment';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastCardProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

function ToastCard({ toast, onClose }: ToastCardProps) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-white',
      borderColor: 'border-emerald-200',
      titleColor: 'text-slate-900',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-white',
      borderColor: 'border-rose-200',
      titleColor: 'text-slate-900',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-white',
      borderColor: 'border-amber-200',
      titleColor: 'text-slate-900',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-white',
      borderColor: 'border-blue-200',
      titleColor: 'text-slate-900',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${config.bgColor} ${config.borderColor} transition-all duration-300 max-w-sm w-full pointer-events-auto`}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold ${config.titleColor}`}>{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
