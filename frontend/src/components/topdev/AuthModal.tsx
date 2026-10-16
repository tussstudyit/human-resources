'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(email || 'developer@upcareer.vn');
        onClose();
        setSuccess(false);
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center font-mono font-bold text-white text-xs">
              &lt;/&gt;
            </div>
            <span className="font-bold text-sm">Tài Khoản UpCareer Developer</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-b-2 border-red-600 text-red-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng nhập ứng viên
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-red-600 text-red-600 bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng ký tài khoản mới
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                {tab === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công!'}
              </h4>
              <p className="text-xs text-slate-500">Đang đồng bộ hồ sơ ứng viên của bạn...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn An"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email cá nhân
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="dev@upcareer.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer mt-2"
              >
                {loading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản IT'}
              </button>

              <div className="pt-3 text-center text-xs text-slate-500">
                Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của UpCareer.
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
