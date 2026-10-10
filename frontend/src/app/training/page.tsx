'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap, BookOpen, Award, CheckCircle } from 'lucide-react';

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Training & Skills Agent</h1>
              <p className="text-sm text-gray-500">Quản lý kỹ năng, nhắc nhở chứng chỉ & đề xuất khóa học phù hợp</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-gray-100 bg-indigo-50/50 flex gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Khóa học gợi ý: Next.js & n8n Microservices</h3>
                <p className="text-xs text-gray-500 mt-1">Đề xuất bởi AI Agent dựa trên hồ sơ kỹ năng của bạn.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/50 flex gap-3">
              <Award className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Chứng chỉ AWS Solutions Architect</h3>
                <p className="text-xs text-gray-500 mt-1">Trạng thái: Đã hoàn thành (Cập nhật tự động).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
