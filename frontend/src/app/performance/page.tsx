'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/topdev/Header';
import { useAuthStore } from '@/store/useAuthStore';
import {
  TrendingUp,
  Send,
  CheckCircle2,
  Clock,
  BarChart3,
  Calendar,
  ExternalLink,
  ShieldAlert,
  User,
  Users,
  RefreshCw,
  Mail
} from 'lucide-react';

interface EmployeeReview {
  id: string | number;
  userId?: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  status: string;
  completed: boolean;
  magicLink: string;
  reminded: boolean;
}

export default function PerformancePage() {
  const { user, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeReview[]>([]);

  useEffect(() => {
    initAuth();

    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/api/performance/employees');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.2.123:3000';
          let stored: Record<string, any> = {};
          try {
            stored = JSON.parse(localStorage.getItem('hr_360_submitted_reviews') || '{}');
          } catch {}

          const mapped = res.data.data.map((emp: EmployeeReview) => {
            const key = emp.name.trim().toLowerCase();
            const isSubmitted = emp.completed || Object.keys(stored).some(k => key.includes(k) || k.includes(key));
            return {
              ...emp,
              status: isSubmitted ? 'Đã hoàn thành' : emp.status,
              completed: isSubmitted,
              magicLink: (emp.magicLink || '').replace('http://localhost:3000', origin).replace('http://192.168.2.123:3000', origin),
            };
          });
          setEmployees(mapped);
          return;
        }
      } catch (err) {
        console.warn('Lỗi khi tải nhân viên từ CSDL, sử dụng danh sách dự phòng:', err);
      }

      // Fallback nếu chưa kết nối được CSDL
      const fallbackList: EmployeeReview[] = [
        {
          id: 1,
          name: 'John Developer',
          email: 'dev.john@example.com',
          role: 'Fullstack Engineer',
          dept: 'Kỹ thuật & AI',
          status: 'Chờ nộp',
          completed: false,
          magicLink: 'http://localhost:3000/bieu-mau-danh-gia-360.html?token=ml_john_9821&period=2026-Q4&name=John%20Developer',
          reminded: false,
        },
        {
          id: 2,
          name: 'Nguyễn Văn HR',
          email: 'hr.lead@example.com',
          role: 'HR Lead',
          dept: 'Phòng Nhân sự',
          status: 'Đã hoàn thành',
          completed: true,
          magicLink: 'http://localhost:3000/bieu-mau-danh-gia-360.html?token=ml_hr_4410&period=2026-Q4&name=Nguy%E1%BB%85n%20V%C4%83n%20HR',
          reminded: false,
        },
        {
          id: 3,
          name: 'Kiểm Thử Viên 17296',
          email: 'tester_17296@test.com',
          role: 'QA Engineer',
          dept: 'Kỹ thuật & AI',
          status: 'Chờ nộp',
          completed: false,
          magicLink: 'http://localhost:3000/bieu-mau-danh-gia-360.html?token=ml_tester_7732&period=2026-Q4&name=Ki%E1%BB%83m%20Th%E1%BB%AD%20Vi%C3%AAn%2017296',
          reminded: false,
        },
        {
          id: 4,
          name: 'Đặng Tú Nguyên',
          email: 'tunguyen2006.qt@gmail.com',
          role: 'Talent Acquisition',
          dept: 'Phòng Nhân sự',
          status: 'Đã hoàn thành',
          completed: true,
          magicLink: 'http://localhost:3000/bieu-mau-danh-gia-360.html?token=ml_tunguyen_1109&period=2026-Q4&name=%C4%90%E1%BA%B7ng%20T%C3%BA%20Nguy%C3%AAn',
          reminded: false,
        },
      ];
      setEmployees(fallbackList);
    };

    fetchEmployees();
  }, [initAuth]);

  // Dữ liệu biểu đồ so sánh KPI (kpi_metrics)
  const kpiMetrics = [
    { id: 'k1', metric: 'Tỷ lệ hoàn thành Sprint đúng hạn', target: 90, actual: 95, dept: 'Kỹ thuật & Công nghệ' },
    { id: 'k2', metric: 'Chất lượng bàn giao & Code Review', target: 85, actual: 88, dept: 'Kỹ thuật & Công nghệ' },
    { id: 'k3', metric: 'Điểm hài lòng phối hợp liên phòng ban', target: 80, actual: 76, dept: 'Toàn công ty' },
    { id: 'k4', metric: 'Tỷ lệ hoàn thành mục tiêu OKR Quý', target: 85, actual: 92, dept: 'Sản phẩm' },
  ];

  const handleTriggerAllPending = async () => {
    setLoading(true);
    const pendingList = employees.filter(e => !e.completed);

    try {
      await axios.post('/api/n8n', {
        workflow: 'feedback_reminder',
        payload: {
          event: 'monthly_360_feedback_reminder',
          runDate: '25',
          totalPending: pendingList.length,
          recipients: pendingList.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.dept,
            magicLink: emp.magicLink
          }))
        }
      });

      setEmployees(employees.map(emp => !emp.completed ? { ...emp, reminded: true, status: 'Đã gửi Magic Link' } : emp));
    } catch (err: any) {
      console.error('Lỗi gửi Magic Link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSingleMagicLink = async (empId: string | number) => {
    const emp = employees.find(e => e.id === empId || e.userId === empId);
    if (!emp) return;

    setLoading(true);
    try {
      await axios.post('/api/n8n', {
        workflow: 'feedback_reminder',
        payload: {
          event: 'single_360_feedback_reminder',
          recipient: {
            name: emp.name,
            email: emp.email,
            magicLink: emp.magicLink
          }
        }
      });

      setEmployees(employees.map(e => (e.id === empId || e.userId === empId) ? { ...e, reminded: true, status: 'Đã gửi Magic Link' } : e));
    } catch (err: any) {
      console.error('Lỗi gửi cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = employees.filter(e => !e.completed).length;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800/60">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>AGENT 3 · PERFORMANCE & 360° FEEDBACK</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400">WF_09 ACTIVE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>📊 AI Performance Tracking & 360° Review</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Tự động hóa theo dõi chỉ số KPI thực tế vs mục tiêu và lên lịch gửi Magic Link đánh giá hiệu suất 360 độ vào ngày 25 hàng tháng.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <button
                onClick={handleTriggerAllPending}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Đang gửi...' : `Quét & Gửi Magic Link (${pendingCount} nhân sự)`}</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KPI Toàn Khối</span>
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-700">87.8%</span>
                <span className="text-xs text-emerald-600 font-semibold">↑ +2.8% so với mục tiêu</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Đánh giá theo quý từ bảng CSDL kpi_metrics
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chưa nộp Review 360°</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600">{pendingCount}</span>
                <span className="text-xs text-slate-400 font-medium">/{employees.length} nhân sự</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Sẵn sàng phát Magic Link qua WF_09
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lịch chạy n8n Cronjob</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900">Ngày 25 hàng tháng</span>
              </div>
              <p className="mt-3 text-xs text-emerald-600 font-medium">
                🟢 WF_09 đang ở trạng thái kích hoạt (Active)
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* KPI Comparison Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      📈 Biểu đồ so sánh KPI (Thực tế vs Mục tiêu)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đo lường tiến độ mục tiêu phòng ban theo thời gian thực
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                    Kỳ Q4 2026
                  </span>
                </div>

                <div className="space-y-4">
                  {kpiMetrics.map(item => (
                    <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-slate-800">
                          {item.metric}
                          <span className="ml-2 font-normal text-slate-400">({item.dept})</span>
                        </div>
                        <div className="font-mono font-bold">
                          <span className={item.actual >= item.target ? 'text-emerald-600' : 'text-amber-600'}>
                            Thực tế: {item.actual}%
                          </span>
                          <span className="text-slate-400 font-normal"> / Mục tiêu: {item.target}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.actual >= item.target ? 'bg-gradient-to-r from-purple-600 to-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, item.actual)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 360 Feedback Employees List */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      👥 Danh sách nộp đánh giá 360° & Magic Links
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click vào từng nhân sự để gửi riêng Magic Link nộp đánh giá
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {employees.filter(e => e.completed).length}/{employees.length} Hoàn tất
                  </span>
                </div>

                <div className="space-y-3">
                  {employees.map(emp => (
                    <div 
                      key={emp.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                          emp.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {emp.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({emp.dept})</span>
                          </div>
                          <span className="text-xs text-slate-500">{emp.email} · {emp.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          emp.completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {emp.status}
                        </span>

                        <a
                          href={emp.magicLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                          title="Mở biểu mẫu đánh giá 360°"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                          <span>Xem form</span>
                        </a>

                        {!emp.completed && (
                          <button
                            onClick={() => handleSendSingleMagicLink(emp.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>Gửi Magic Link</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </main>
    </div>
  );
}
