import { create } from 'zustand';
import axios from 'axios';
import { api } from '@/lib/api';

export type Role = 'HR' | 'EMPLOYEE' | 'MANAGER';

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  departmentId?: string | null;
  department?: Department | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
    departmentId?: string;
  }) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      set({
        user: res.data,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('token', accessToken);
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      let message = 'Đăng nhập không thành công';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      }
      set({
        isLoading: false,
        error: Array.isArray(message) ? message.join(', ') : message,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data;
      localStorage.setItem('token', accessToken);
      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      let message = 'Đăng ký không thành công';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message || message;
      }
      set({
        isLoading: false,
        error: Array.isArray(message) ? message.join(', ') : message,
      });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
