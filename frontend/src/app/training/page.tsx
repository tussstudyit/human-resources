'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Calendar,
} from 'lucide-react';

export default function TrainingPage() {
  const [formData, setFormData] = useState({
    employeeName: 'Trần Anh Tân',
    employeeEmail: 'anhtanht1905@gmail.com',
    courseName: 'AWS Solutions Architect & Next.js Microservices',
    dueDate: '30/10/2026',
    progress: 85,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTriggerTrainingWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      ...formData,
      employeeEmail: formData.employeeEmail.trim().replace(/^=/, ''),
      employeeName: formData.employeeName.trim(),
    };

    try {
      const res = await fetch('http://localhost:5678/webhook/training-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({
          type: 'success',
          message: 'Đã gửi thông báo nhắc nhở đào tạo & chứng chỉ thành công!',
        });
      } else {
        const testRes = await fetch('http://localhost:5678/webhook-test/training-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (testRes.ok) {
          setStatus({
            type: 'success',
            message: 'Đã gửi thông báo nhắc nhở đào tạo thành công!',
          });
        } else {
          throw new Error('Không thể kết nối hệ thống');
        }
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'Lỗi kết nối hệ thống tự động hóa. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </Link>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Training & Skills Agent</h1>
              <p className="text-sm text-gray-500">Quản lý kỹ năng, tự động hóa nhắc nhở chứng chỉ & đề xuất khóa học</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-gray-100 bg-indigo-50/50 flex gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Khóa học gợi ý: Next.js & n8n Microservices</h3>
                <p className="text-xs text-gray-500 mt-1">Đề xuất bởi AI Agent dựa trên hồ sơ kỹ năng của bạn (Tiến độ: 85%).</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/50 flex gap-3">
              <Award className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Chứng chỉ AWS Solutions Architect</h3>
                <p className="text-xs text-gray-500 mt-1">Trạng thái: Đã hoàn thành & đồng bộ hệ thống.</p>
              </div>
            </div>
          </div>

          {status && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleTriggerTrainingWorkflow} className="space-y-4 border-t border-gray-100 pt-6">
            <h2 className="text-base font-bold text-gray-800 mb-2">Gửi Nhắc nhở Đào tạo & Chứng chỉ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Tên nhân viên</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email nhận thông báo</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.employeeEmail}
                    onChange={(e) => setFormData({ ...formData, employeeEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Khóa học / Chứng chỉ</label>
                <div className="relative">
                  <BookOpen className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Hạn hoàn thành (Deadline)</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Đang gửi...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> Gửi Nhắc Nhở Đào Tạo
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
