'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import {
  Users,
  Briefcase,
  Compass,
  LineChart,
  GraduationCap,
  HeartHandshake,
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface Employee {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  department?: {
    id: string;
    name: string;
  } | null;
}

interface Department {
  id: string;
  name: string;
  description?: string | null;
  _count?: {
    users?: number;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initAuth } = useAuthStore();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Tải danh sách phòng ban
      api
        .get('/departments')
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error('Lỗi tải departments:', err));

      // Tải danh sách nhân sự từ Database
      api
        .get('/auth/users')
        .then((res) => setEmployees(res.data))
        .catch((err) => console.error('Lỗi tải users:', err));
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Đang xác thực thông tin...</span>
        </div>
      </div>
    );
  }

  const agents = [
    {
      title: 'AI Recruitment Agent',
      desc: 'Tự động đăng tin tuyển dụng, phân tích CV ứng viên & lên lịch phỏng vấn thông minh.',
      icon: Briefcase,
      color: 'from-amber-500 to-orange-500',
      tag: 'Tuyển dụng',
      stats: 'Tự động hóa tuyển dụng',
    },
    {
      title: 'AI Onboarding Agent',
      desc: 'Tự động hóa checklist hội nhập nhân viên mới, phân quyền công cụ & đào tạo ban đầu.',
      icon: Compass,
      color: 'from-cyan-500 to-blue-500',
      tag: 'Hội nhập',
      stats: 'Quy trình nhận việc',
    },
    {
      title: 'AI Performance Tracking Agent',
      desc: 'Tự động thu thập phản hồi 360 độ, theo dõi tiến độ mục tiêu & báo cáo KPI.',
      icon: LineChart,
      color: 'from-emerald-500 to-teal-500',
      tag: 'Hiệu suất',
      stats: 'Đánh giá & KPI',
    },
    {
      title: 'AI Training & Skills Agent',
      desc: 'Nhắc nhở hạn chứng chỉ chuyên môn, đề xuất khóa học và phân tích ROI đào tạo.',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Đào tạo',
      stats: 'Phát triển kỹ năng',
    },
    {
      title: 'AI Employee Engagement Agent',
      desc: 'Tự động hóa khảo sát mức độ hài lòng, đề xuất hành động wellbeing & theo dõi gắn kết.',
      icon: HeartHandshake,
      color: 'from-rose-500 to-pink-500',
      tag: 'Gắn kết',
      stats: 'Khảo sát & Wellbeing',
    },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'HR':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-7 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Hệ thống Quản lý Nhân sự Thông minh</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Xin chào, {user.fullName}!
              </h2>
              <p className="text-slate-300 text-xs mt-1">
                Chào mừng bạn đến với trung tâm điều hành nhân sự và hệ thống 5 AI Agents tự động hóa.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
              <Shield className="h-4 w-4 text-indigo-400" />
              <div>
                <span className="text-slate-300 block text-[10px]">Phân quyền hiện tại</span>
                <span className="font-bold text-white uppercase">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Tổng nhân sự</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{employees.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Phòng ban</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{departments.length}</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Hệ thống AI Agents</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">5 Agents</h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Phòng ban của bạn</p>
                <h3 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[160px]">
                  {user.department?.name || 'Chưa phân bổ'}
                </h3>
              </div>
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* 5 AI Agents Grid */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">5 AI Agents Squad</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các tác tử trí tuệ nhân tạo hỗ trợ toàn diện vòng đời nhân sự
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.title}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${agent.color} text-white flex items-center justify-center shadow-md`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {agent.tag}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{agent.title}</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{agent.desc}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Đang hoạt động
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{agent.stats}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee Directory Table */}
          <div id="employees" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Danh sách nhân sự</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu nhân viên được đồng bộ trực tiếp từ hệ thống
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm nhân viên theo tên, email..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Họ và tên</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Vai trò</th>
                    <th className="px-6 py-3.5">Phòng ban</th>
                    <th className="px-6 py-3.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] uppercase">
                            {emp.fullName ? emp.fullName[0] : 'U'}
                          </div>
                          <span>{emp.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{emp.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadge(
                            emp.role,
                          )}`}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {emp.department?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Không tìm thấy nhân viên phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Departments Grid */}
          <div id="departments" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cơ cấu phòng ban</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các phòng ban đang hoạt động trong tổ chức
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {departments.length} phòng ban
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition"
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{dept.name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {dept.description || 'Không có mô tả'}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Nhân sự</span>
                    <strong className="text-slate-800 font-bold">{dept._count?.users ?? 0} người</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
