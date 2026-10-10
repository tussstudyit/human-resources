'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Send, CheckCircle2, Calendar, Mail, User, Briefcase, Link as LinkIcon } from 'lucide-react';

export default function RecruitmentPage() {
  const [formData, setFormData] = useState({
    candidateName: 'Trần Anh Tân',
    candidateEmail: 'tan19506@gmail.com',
    position: 'AI / Fullstack Developer',
    interviewTime: '09:00 AM - 15/10/2026',
    meetingLink: 'https://meet.google.com/abc-xyz-hr'
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // Làm sạch dữ liệu trước khi gửi tới n8n (Loại bỏ khoảng trắng và ký tự = thừa nếu có)
    const cleanedFormData = {
      ...formData,
      candidateEmail: formData.candidateEmail.trim().replace(/^=/, ''),
      candidateName: formData.candidateName.trim(),
    };

    try {
      // Bắn trực tiếp sang Webhook n8n (Production URL)
      const res = await fetch('http://localhost:5678/webhook/interview-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedFormData)
      });

      if (res.ok) {
        setStatus({
          type: 'success',
          message: 'Lịch phỏng vấn đã được tự động gửi qua n8n & Gmail thành công!'
        });
      } else {
        // Fallback sang webhook-test nếu n8n đang ở chế độ Test
        const testRes = await fetch('http://localhost:5678/webhook-test/interview-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedFormData)
        });

        if (testRes.ok) {
          setStatus({
            type: 'success',
            message: 'Đã kích hoạt Workflow n8n (chế độ Test) thành công!'
          });
        } else {
          throw new Error('Không thể kết nối n8n Webhook');
        }
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: 'Lỗi kết nối Webhook n8n. Vui lòng đảm bảo n8n đang chạy và đã kích hoạt Workflow.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Recruitment Agent</h1>
              <p className="text-sm text-gray-500">Lên lịch phỏng vấn tự động & gửi thư mời ứng viên qua n8n Automation</p>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Tên ứng viên</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email ứng viên</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={formData.candidateEmail}
                  onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Vị trí ứng tuyển</label>
              <div className="relative">
                <Briefcase className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Thời gian phỏng vấn</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={formData.interviewTime}
                    onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Link cuộc họp (Google Meet)</label>
                <div className="relative">
                  <LinkIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Đang gửi tới n8n...' : (
                <>
                  <Send className="w-4 h-4" /> Bắn Webhook & Lên lịch Phỏng vấn
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
