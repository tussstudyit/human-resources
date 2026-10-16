'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HeartHandshake, Smile, Activity } from 'lucide-react';

export default function EngagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Employee Engagement Agent</h1>
              <p className="text-sm text-gray-500">Khảo sát mức độ hài lòng & hỗ trợ chế độ đãi ngộ, Wellbeing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-gray-100 bg-rose-50/50 flex gap-3">
              <Smile className="w-6 h-6 text-rose-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Chỉ số hài lòng môi trường làm việc</h3>
                <p className="text-xs text-gray-500 mt-1">Đạt 92% mức độ tích cực tuần này.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-purple-50/50 flex gap-3">
              <Activity className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Chương trình Health & Wellbeing</h3>
                <p className="text-xs text-gray-500 mt-1">Khảo sát sức khỏe định kỳ cho nhân sự.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
