'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  Bot, 
  UserPlus, 
  UserCheck, 
  TrendingUp, 
  GraduationCap, 
  HeartHandshake 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Hệ thống Quản lý Nhân sự Thông minh
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold">Xin chào, Trần Anh Tân!</h1>
            <p className="text-blue-100 mt-1 text-sm lg:text-base">
              Chào mừng bạn đến với trung tâm điều hành nhân sự và hệ thống 5 AI Agents tự động hóa.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-sm font-medium">
            Phân quyền hiện tại: <span className="text-amber-300 font-bold">EMPLOYEE</span>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Tổng nhân sự</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">1</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Phòng ban</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">4</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Hệ thống AI Agents</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">5 Agents</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Phòng ban của bạn</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[150px]">Phòng Kinh doanh...</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5 AI Agents Squad Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">5 AI Agents Squad</h2>
        <p className="text-sm text-gray-500">Các tác tử trí tuệ nhân tạo hỗ trợ toàn diện vòng đời nhân sự</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. AI Recruitment Agent */}
        <Link 
          href="/recruitment"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                Tuyển dụng
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
              AI Recruitment Agent
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Tự động đăng tin tuyển dụng, phân tích CV ứng viên & lên lịch phỏng vấn thông minh tích hợp n8n.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
            <span className="text-amber-600 group-hover:translate-x-1 transition-transform">
              Tự động hóa tuyển dụng &rarr;
            </span>
          </div>
        </Link>

        {/* 2. AI Onboarding Agent */}
        <Link 
          href="/onboarding"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                Hội nhập
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              AI Onboarding Agent
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Tự động hóa checklist hội nhập nhân viên mới, phân quyền công cụ IT & đào tạo ban đầu qua Webhook.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
              Quy trình nhận việc &rarr;
            </span>
          </div>
        </Link>

        {/* 3. AI Performance Tracking Agent */}
        <Link 
          href="/performance"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                Hiệu suất
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
              AI Performance Tracking Agent
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Tự động thu thập phản hồi 360 độ, theo dõi tiến độ mục tiêu & báo cáo KPI định kỳ.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
            <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">
              Đánh giá & KPI &rarr;
            </span>
          </div>
        </Link>

        {/* 4. AI Training & Skills Agent */}
        <Link 
          href="/training"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                Đào tạo
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
              AI Training & Skills Agent
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Nhắc nhở hạn chứng chỉ chuyên môn, đề xuất khóa học nâng cao và phân tích ROI đào tạo.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
            <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">
              Phát triển kỹ năng &rarr;
            </span>
          </div>
        </Link>

        {/* 5. AI Employee Engagement Agent */}
        <Link 
          href="/engagement"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">
                Gắn kết
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-rose-600 transition-colors">
              AI Employee Engagement Agent
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Tự động hóa khảo sát mức độ hài lòng, đề xuất hành động wellbeing & theo dõi mức độ gắn kết.
            </p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang hoạt động
            </span>
            <span className="text-rose-600 group-hover:translate-x-1 transition-transform">
              Khảo sát & Wellbeing &rarr;
            </span>
          </div>
        </Link>

      </div>
    </div>
  );
}
