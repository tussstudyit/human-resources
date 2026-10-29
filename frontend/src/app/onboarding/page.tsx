'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/topdev/Header';
import Footer from '@/components/topdev/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Mail,
  MessageSquare,
  Layers,
  ArrowRight,
  RefreshCw,
  Terminal,
  Key
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  desc: string;
  category: string;
  completed: boolean;
  isAccountTask: boolean;
  tagColor: string;
}

export default function OnboardingPage() {
  const { user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      title: 'Hoàn thiện hồ sơ nhân sự & thông tin cá nhân',
      desc: 'Cập nhật CCCD, tài khoản ngân hàng và thông tin liên hệ khẩn cấp trên hệ thống',
      category: 'Hành chính',
      completed: false,
      isAccountTask: false,
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 't2',
      title: 'Nhận tài khoản công ty (Email, Jira, Slack, AWS)',
      desc: 'Khi tick hoàn thành, hệ thống tự động khởi tạo toàn bộ tài khoản kỹ thuật (Email, Jira, Slack, AWS)',
      category: 'IT Provisioning',
      completed: false,
      isAccountTask: true,
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 't3',
      title: 'Tham gia buổi định hướng văn hóa & quy trình',
      desc: 'Gặp gỡ HR Mentor, tìm hiểu quy chế làm việc và lộ trình thử việc 2 tháng',
      category: 'Đào tạo',
      completed: false,
      isAccountTask: false,
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 't4',
      title: 'Thiết lập môi trường phát triển & cài đặt bảo mật',
      desc: 'Cài đặt SSH key, 2FA trên GitHub Enterprise và kết nối VPN nội bộ công ty',
      category: 'Bảo mật',
      completed: false,
      isAccountTask: false,
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
  ]);

  const [provisioning, setProvisioning] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Trạng thái bộ tài khoản IT sau khi n8n trả về
  const [itAccounts, setItAccounts] = useState<{
    empId: string;
    email: string;
    slack: string;
    jira: string;
    tools: string[];
    provisioned: boolean;
  }>({
    empId: 'Chưa cấp',
    email: 'Chưa khởi tạo',
    slack: 'Chưa khởi tạo',
    jira: 'Chưa khởi tạo',
    tools: [],
    provisioned: false,
  });

  const [logs, setLogs] = useState([
    { time: 'Hôm nay', text: 'Khởi tạo danh sách checklist hội nhập tuần đầu cho nhân sự mới', type: 'info' }
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // LUỒNG 1: Gọi WF_07 (IT Tool Provisioning qua n8n)
  const triggerITProvisioning = async () => {
    setProvisioning(true);
    const empEmail = user?.email || 'anhtanht1905@gmail.com';
    const empName = user?.fullName || 'Trần Công Nghệ';

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'it_provisioning',
        payload: {
          userEmail: empEmail,
          fullName: empName,
          department: 'Tech',
          role: user?.role || 'EMPLOYEE',
          employee: {
            name: empName,
            userEmail: empEmail,
            personalEmail: empEmail,
            department: 'Tech',
            role: user?.role || 'EMPLOYEE'
          }
        }
      });

      const resData = res.data?.data || res.data;
      const empId = resData.empId || 'EMP-' + Math.floor(10000 + Math.random() * 90000);
      const emailPrefix = empEmail.split('@')[0];

      setItAccounts({
        empId,
        email: `${emailPrefix}@company.vn (Active)`,
        slack: `@${emailPrefix} - Workspace #tech-team (Joined)`,
        jira: `${emailPrefix}@company.vn - Project: HR-Core (Granted)`,
        tools: resData.tools || ['Google Workspace', 'Slack Dev Channels', 'Jira Software', 'GitHub Organization', 'AWS Sandbox'],
        provisioned: true,
      });

      setLogs(prev => [
        {
          time: res.data.timestamp || new Date().toLocaleTimeString('vi-VN'),
          text: `[Cấp phát thành công]: Đã kích hoạt mã ${empId}, Email công ty, Slack & Jira cho ${empName}`,
          type: 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Lỗi cấp phát tài khoản:', err);
      setLogs(prev => [
        {
          time: new Date().toLocaleTimeString('vi-VN'),
          text: `[Lỗi Webhook]: ${err.message}`,
          type: 'error'
        },
        ...prev
      ]);
    } finally {
      setProvisioning(false);
    }
  };

  // LUỒNG 2: Gọi WF_08 (First Week Checkin qua n8n)
  const triggerFirstWeekCheckin = async () => {
    setCheckingIn(true);
    const isUnder50 = progressPercent < 50;

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'first_week_checkin',
        payload: {
          employeeName: user?.fullName || 'John Developer',
          employeeEmail: user?.email || 'dev.john@example.com',
          daysElapsed: 3,
          completedTasks: completedCount,
          totalTasks: tasks.length,
          progressPercent,
          isBelowThreshold: isUnder50,
          pendingTasks: tasks.filter(t => !t.completed).map(t => t.title)
        }
      });

      setLogs(prev => [
        {
          time: res.data.timestamp || new Date().toLocaleTimeString('vi-VN'),
          text: res.data.message || `Kiểm tra tiến độ 3 ngày: ${progressPercent}% hoàn tất.`,
          type: isUnder50 ? 'warning' : 'success'
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Lỗi kiểm tra tiến độ:', err);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleToggle = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const newStatus = !target.completed;
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t);
    setTasks(updatedTasks);

    if (newStatus) {
      setLogs(prev => [
        { time: new Date().toLocaleTimeString('vi-VN'), text: `Nhân sự tick hoàn thành: "${target.title}"`, type: 'info' },
        ...prev
      ]);
    }

    if (target.isAccountTask && newStatus) {
      await triggerITProvisioning();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-indigo-300 uppercase tracking-wider bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/60">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>TIẾP NHẬN & HỘI NHẬP NHÂN SỰ</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400">HỆ THỐNG TỰ ĐỘNG ĐANG HOẠT ĐỘNG</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>🚀 Hội Nhập Nhân Sự & Cấp Phát Tài Khoản IT Tự Động</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Tự động hóa toàn trình: cấp phát bộ tài khoản IT (Jira, Slack, Email) khi hoàn thành nhiệm vụ và giám sát cảnh báo tiến độ tuần đầu sau 3 ngày làm việc.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <button
                onClick={triggerFirstWeekCheckin}
                disabled={checkingIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingIn ? 'animate-spin' : ''}`} />
                <span>{checkingIn ? 'Đang rà soát...' : 'Kiểm tra tiến độ 3 ngày đầu'}</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiến độ Checklist</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${progressPercent < 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {progressPercent < 50 ? 'Cần tăng tốc (< 50%)' : 'Đạt chuẩn (>= 50%)'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${progressPercent < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {progressPercent}%
                </span>
                <span className="text-xs text-slate-400 font-medium">({completedCount}/{tasks.length} việc)</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progressPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái Cấp Tài khoản</span>
                <Key className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-lg font-bold ${itAccounts.provisioned ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {itAccounts.provisioned ? '🟢 Đã kích hoạt toàn bộ' : '⏳ Chờ tick nhiệm vụ'}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400 leading-tight">
                {itAccounts.provisioned ? `Mã NV: ${itAccounts.empId}` : 'Tick vào nhiệm vụ "Nhận tài khoản" để kích hoạt tự động'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HR Mentor Đồng Hành</span>
                <UserCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2">
                <span className="text-base font-bold text-slate-900">Nguyễn Văn HR</span>
                <span className="block text-xs text-slate-500">hr.lead@example.com</span>
              </div>
              <div className="mt-3 text-[11px] text-blue-600 font-medium">
                Kênh hỗ trợ: #mentor-onboarding (Slack)
              </div>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Checklist */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      📋 Checklist công việc hội nhập tuần đầu
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đánh dấu vào từng mục để hệ thống cập nhật tiến độ tự động
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {completedCount}/{tasks.length} Hoàn thành
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map(t => (
                    <div 
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        t.completed ? 'bg-slate-50/80 border-slate-200 opacity-80' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                          t.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : (t.isAccountTask ? <Sparkles className="w-4 h-4 text-purple-600" /> : <Clock className="w-4 h-4 text-slate-500" />)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {t.title}
                            </h3>
                            {t.isAccountTask && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                                Cấp phát tự động
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${t.tagColor}`}>
                          {t.category}
                        </span>
                        <button
                          onClick={() => handleToggle(t.id)}
                          disabled={t.isAccountTask && provisioning}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                            t.completed 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          } disabled:opacity-50`}
                        >
                          {t.isAccountTask && provisioning
                            ? 'Đang tạo tài khoản...'
                            : t.completed
                            ? '✓ Đã hoàn thành'
                            : 'Đánh dấu xong'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Provisioned Accounts Detail Card */}
                <div className={`p-5 rounded-xl border transition-all ${
                  itAccounts.provisioned ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Chi tiết tài khoản doanh nghiệp được cấp tự động
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      itAccounts.provisioned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {itAccounts.provisioned ? 'ĐÃ KÍCH HOẠT' : 'CHỜ HOÀN THÀNH TASK'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>Email công ty</span>
                      </div>
                      <div className="font-semibold text-slate-800 truncate">{itAccounts.email}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                        <span>Kênh Slack</span>
                      </div>
                      <div className="font-semibold text-slate-800 truncate">{itAccounts.slack}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Tài khoản Jira</span>
                      </div>
                      <div className="font-semibold text-slate-800 truncate">{itAccounts.jira}</div>
                    </div>
                  </div>

                  {itAccounts.tools.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-600">Công cụ đi kèm:</span>
                      {itAccounts.tools.map((tool, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Execution Logs & Policies */}
            <div className="space-y-6">
              {/* Policy Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Chính sách rà soát tuần đầu
                </h2>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Thời gian quy định:</span>
                    <span className="font-bold text-slate-900">3 ngày đầu tiên</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Ngưỡng đạt tiêu chuẩn:</span>
                    <span className="font-bold text-emerald-600">≥ 50% checklist</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-400">Cơ chế cảnh báo & nhắc nhở:</span>
                    <span className="font-bold text-amber-600">Slack & Email HR Mentor</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={triggerFirstWeekCheckin}
                    disabled={checkingIn}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {checkingIn ? 'Đang thực thi...' : 'Kích hoạt rà soát tiến độ mẫu'}
                  </button>
                </div>
              </div>

              {/* Execution Logs */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  Nhật ký tự động hóa
                </h2>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">{log.time}</span>
                        <span className={`font-bold uppercase ${
                          log.type === 'success' ? 'text-emerald-600' : log.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {log.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      <Footer />
    </div>
  );
}
