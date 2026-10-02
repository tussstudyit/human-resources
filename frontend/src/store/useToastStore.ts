import { create } from 'zustand';
import { ToastItem, ToastType } from '@/types/recruitment';

interface ToastState {
  toasts: ToastItem[];
  showToast: (toast: { type: ToastType; title: string; message?: string; duration?: number }) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: ({ type, title, message, duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    set((state) => {
      // Giới hạn tối đa 3 toast hiển thị cùng lúc
      const updated = [...state.toasts, newToast];
      if (updated.length > 3) {
        return { toasts: updated.slice(updated.length - 3) };
      }
      return { toasts: updated };
    });
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
