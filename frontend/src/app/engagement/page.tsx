'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/topdev/Header';
import { Footer } from '@/components/topdev/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import {
  HeartHandshake,
  Smile,
  Activity,
  Heart,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Users,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Award,
  Coffee,
  Check,
  X,
  Sliders,
  Mail,
  Zap,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  department: string;
  employeeName?: string;
  sentiment: 'positive' | 'neutral' | 'attention';
  comment: string;
  category: string;
  time: string;
  status: 'resolved' | 'in_progress';
}

interface WellbeingProgram {
  id: string;
  title: string;
  schedule: string;
  participants: number;
  status: string;
  tag: string;
}

interface EmployeeOption {
  id: string | number;
  userId?: string;
  name: string;
  email: string;
  dept?: string;
  department?: string;
  role?: string;
}

export default function EngagementPage() {
  const { user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isHR = Boolean(user && (user.role === 'HR' || user.role === 'MANAGER'));
  const isEmployee = Boolean(user && user.role === 'EMPLOYEE');

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [triggeringWF, setTriggeringWF] = useState<'wf1' | 'wf2' | 'wf3' | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals state
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showWellbeingModal, setShowWellbeingModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // WF 01 Survey Form
  const [surveyForm, setSurveyForm] = useState({
    employeeName: '',
    employeeEmail: '',
    department: 'Phòng Kỹ thuật & Công nghệ',
    rating: 8,
    textAnswer: '',
  });

  // Tự động gán thông tin cá nhân khi đăng nhập
  useEffect(() => {
    let email = user?.email;
    let name = user?.fullName;
    let dept = typeof user?.department === 'string' ? user?.department : user?.department?.name;

    if (!email && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          email = parsed.email;
          name = parsed.fullName;
          dept = typeof parsed.department === 'string' ? parsed.department : parsed.department?.name;
        }
      } catch {}
    }

    if (email) {
      setSurveyForm((prev) => ({
        ...prev,
        employeeName: name || prev.employeeName || 'Nhân viên',
        employeeEmail: email,
        department: dept || prev.department || 'Toàn công ty',
      }));
    }
  }, [user]);

  const handleOpenSurveyModal = () => {
    let email = user?.email;
    let name = user?.fullName;
    let dept = typeof user?.department === 'string' ? user?.department : user?.department?.name;

    if (!email && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          email = parsed.email;
          name = parsed.fullName;
          dept = typeof parsed.department === 'string' ? parsed.department : parsed.department?.name;
        }
      } catch {}
    }

    if (email) {
      setSurveyForm((prev) => ({
        ...prev,
        employeeEmail: email,
        employeeName: name || prev.employeeName || 'Nhân sự',
        department: dept || prev.department || 'Toàn công ty',
      }));
    }
    setShowSurveyModal(true);
  };

  // WF 02 Wellbeing Form
  const [wellbeingForm, setWellbeingForm] = useState({
    employeeName: '',
    employeeEmail: '',
    department: 'Phòng Kỹ thuật & Công nghệ',
    actionType: 'AUTO',
    sentimentScore: 2.0,
    burnoutRisk: 'High',
    triggerReason: 'Làm việc ngoài giờ liên tục trong giai đoạn nước rút dự án, có dấu hiệu căng thẳng.',
  });

  // WF 03 Dispatch recipient filter
  const [dispatchTarget, setDispatchTarget] = useState<'all' | 'custom'>('all');
  const [customDispatchEmail, setCustomDispatchEmail] = useState('');

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      department: 'Phòng Kỹ thuật & Công nghệ',
      employeeName: 'John Developer',
      sentiment: 'positive',
      comment: 'Trang thiết bị làm việc rất tốt, chế độ Remote linh hoạt giúp tôi cân bằng cuộc sống và năng suất code cao hơn.',
      category: 'Môi trường làm việc',
      time: '2 giờ trước',
      status: 'resolved',
    },
    {
      id: 'fb-2',
      department: 'Phòng Tuyển dụng & HR',
      employeeName: 'Sarah HR',
      sentiment: 'positive',
      comment: 'Hệ thống AI ATS và quy trình tự động hóa mới giúp team tiết kiệm đến 40% thời gian duyệt hồ sơ và gửi email phỏng vấn.',
      category: 'Công cụ & Quy trình',
      time: 'Hôm qua',
      status: 'resolved',
    },
    {
      id: 'fb-3',
      department: 'Phòng Marketing',
      employeeName: 'Trần Thị B',
      sentiment: 'attention',
      comment: 'Dạo này khối lượng công việc khá dồn dập, thường xuyên phải OT buổi tối để kịp chiến dịch quảng cáo.',
      category: 'Khối lượng & Căng thẳng',
      time: '2 ngày trước',
      status: 'in_progress',
    },
    {
      id: 'fb-4',
      department: 'Phòng Sản phẩm',
      employeeName: 'Nguyễn Văn A',
      sentiment: 'neutral',
      comment: 'Mong muốn có thêm hoạt động Teambuilding hoặc ăn trưa thứ 6 (Happy Friday) để gắn kết các nhóm chức năng chéo.',
      category: 'Gắn kết đội ngũ',
      time: '3 ngày trước',
      status: 'in_progress',
    },
  ]);

  const [wellbeingList, setWellbeingList] = useState<WellbeingProgram[]>([
    {
      id: 'wb-1',
      title: 'Bảo hiểm Sức khỏe Cao cấp Toàn diện (Health Premium)',
      schedule: 'Hàng năm · Khám định kỳ T11/2026',
      participants: 52,
      status: 'Đang áp dụng',
      tag: 'Y tế & Thể chất',
    },
    {
      id: 'wb-2',
      title: 'Happy Friday & Coffee Talk Gắn Kết',
      schedule: 'Chiều thứ Sáu (16:30 - 17:30)',
      participants: 48,
      status: 'Đang diễn ra',
      tag: 'Văn hóa & Đội ngũ',
    },
    {
      id: 'wb-3',
      title: 'Workshop Sức Khỏe Tinh Thần & Quản Lý Stress',
      schedule: 'Tháng 11/2026',
      participants: 35,
      status: 'Sắp diễn ra',
      tag: 'Tâm lý & Mental Health',
    },
  ]);

  // Load real employees from backend
  useEffect(() => {
    axios
      .get('/api/performance/employees')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const list: EmployeeOption[] = res.data.data;
          setEmployees(list);
          if (list[0]) {
            setSurveyForm((prev) => {
              if (user?.email || prev.employeeEmail) return prev;
              return {
                ...prev,
                employeeName: prev.employeeName || list[0].name,
                employeeEmail: list[0].email,
                department: list[0].dept || list[0].department || prev.department,
              };
            });
            setWellbeingForm((prev) => ({
              ...prev,
              employeeName: prev.employeeName || list[0].name,
              employeeEmail: prev.employeeEmail || list[0].email,
              department: list[0].dept || list[0].department || prev.department,
            }));
          }
        } else {
          fallbackEmployees();
        }
      })
      .catch(() => {
        fallbackEmployees();
      });

    function fallbackEmployees() {
      const defaultList: EmployeeOption[] = [
        { id: 1, name: 'Tú Đặng', email: 'tunguyen2006.qt@gmail.com', dept: 'Phòng Kỹ thuật & Công nghệ' },
        { id: 2, name: 'Nguyễn Văn A', email: 'tudang43.qtdn@gmail.com', dept: 'Phòng Tuyển dụng & HR' },
        { id: 3, name: 'Trần Thị B', email: 'anhtanht1905@gmail.com', dept: 'Phòng Marketing' },
        { id: 4, name: 'Đặng Tú Nguyên', email: 'dang.2006.qt@gmail.com', dept: 'Toàn công ty' },
      ];
      setEmployees((prev) => {
        const merged = [...prev];
        for (const def of defaultList) {
          if (!merged.some((m) => m.email.toLowerCase() === def.email.toLowerCase())) {
            merged.push(def);
          }
        }
        return merged;
      });
      setSurveyForm((prev) => {
        if (user?.email || prev.employeeEmail) return prev;
        return {
          ...prev,
          employeeName: prev.employeeName || defaultList[0].name,
          employeeEmail: defaultList[0].email,
          department: prev.department || defaultList[0].dept || "",
        };
      });
      setWellbeingForm((prev) => ({
        ...prev,
        employeeName: prev.employeeName || defaultList[0].name,
        employeeEmail: prev.employeeEmail || defaultList[0].email,
        department: prev.department || defaultList[0].dept || "",
      }));
    }
  }, []);

  // Check URL parameters for Magic Link from WF 03 email: /engagement?tab=survey&email=...&name=...
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const email = params.get('email');
      const name = params.get('name');
      const dept = params.get('dept');
      if (tab === 'survey' || email) {
        if (email) {
          const decodedName = name ? decodeURIComponent(name) : email.split('@')[0];
          const decodedDept = dept ? decodeURIComponent(dept) : 'Toàn công ty';
          const magicEmp: EmployeeOption = {
            id: 'magic-' + Date.now(),
            name: decodedName,
            email: email,
            dept: decodedDept,
          };
          setEmployees((prev) => {
            if (prev.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
              return prev;
            }
            return [magicEmp, ...prev];
          });
          setSurveyForm((prev) => ({
            ...prev,
            employeeEmail: email,
            employeeName: decodedName,
            department: decodedDept,
          }));
        }
        setShowSurveyModal(true);
      }
    }
  }, []);

  const handleResolveFeedback = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'resolved' as const } : f))
    );
  };

  // WF 01: Submit Employee Survey Response
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggeringWF('wf1');
    setStatusMessage(null);

    // Xác định chính xác email người làm bài khảo sát
    let finalEmail = user?.email || surveyForm.employeeEmail;
    let finalName = user?.fullName || surveyForm.employeeName;
    let finalDept = (typeof user?.department === 'string' ? user?.department : user?.department?.name) || surveyForm.department;

    if (!finalEmail && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          finalEmail = parsed.email || finalEmail;
          finalName = parsed.fullName || finalName;
          finalDept = (typeof parsed.department === 'string' ? parsed.department : parsed.department?.name) || finalDept;
        }
      } catch {}
    }

    finalEmail = (finalEmail || '').trim();
    finalName = (finalName || 'Nhân sự').trim();
    finalDept = (finalDept || 'Toàn công ty').trim();

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'engagement_survey',
        payload: {
          employeeName: finalName,
          employeeEmail: finalEmail,
          department: finalDept,
          rating: Number(surveyForm.rating),
          textAnswer: surveyForm.textAnswer,
        },
      });

      const data = res.data?.data || res.data || {};
      const aiCategory = data.category || 'Môi trường làm việc';
      const burnoutRisk = data.burnoutRisk || (surveyForm.rating <= 4 ? 'High' : 'Low');

      setStatusMessage({
        type: 'success',
        text: `[Ghi Nhận Thành Công] Đã tiếp nhận bài khảo sát từ ${finalName} (${finalEmail}). Phân tích cảm xúc: "${aiCategory}", Đánh giá kiệt sức: ${burnoutRisk}. (Đã đồng bộ Google Sheets${burnoutRisk === 'High' || burnoutRisk === 'Critical' ? ' & Gửi cảnh báo Slack/Email' : ''}).`,
      });

      // Add to feedbacks feed
      setFeedbacks((prev) => [
        {
          id: `fb-${Date.now()}`,
          department: finalDept,
          employeeName: finalName,
          sentiment: surveyForm.rating >= 8 ? 'positive' : surveyForm.rating >= 6 ? 'neutral' : 'attention',
          comment: surveyForm.textAnswer || `Đánh giá mức độ hài lòng: ${surveyForm.rating}/10 điểm`,
          category: aiCategory,
          time: 'Vừa xong',
          status: surveyForm.rating <= 4 ? 'in_progress' : 'resolved',
        },
        ...prev,
      ]);

      setShowSurveyModal(false);
      setSurveyForm((prev) => ({ ...prev, textAnswer: '' }));
    } catch (err: any) {
      console.error('Lỗi khi gửi khảo sát:', err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi khi gửi khảo sát: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setTriggeringWF(null);
    }
  };

  // WF 02: Dispatch Wellbeing Action Intervention
  const handleTriggerWellbeing = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggeringWF('wf2');
    setStatusMessage(null);

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'wellbeing_action',
        payload: {
          employeeName: wellbeingForm.employeeName,
          employeeEmail: wellbeingForm.employeeEmail,
          department: wellbeingForm.department,
          actionType: wellbeingForm.actionType,
          sentimentScore: Number(wellbeingForm.sentimentScore),
          burnoutRisk: wellbeingForm.burnoutRisk,
          triggerReason: wellbeingForm.triggerReason,
        },
      });

      const data = res.data?.data || res.data || {};
      const pkgTitle = data.packageTitle || 'Gói Chăm Sóc Sức Khỏe Tinh Thần';
      const actionCode = data.actionCode || 'WB-ACTION';

      setStatusMessage({
        type: 'success',
        text: `[Can Thiệp Thành Công] Đã kích hoạt ${pkgTitle} (Mã: ${actionCode}) cho ${wellbeingForm.employeeName} (${wellbeingForm.employeeEmail}). Email chăm sóc đã được gửi thành công!`,
      });

      setShowWellbeingModal(false);
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt Wellbeing:', err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi khi kích hoạt gói phúc lợi: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setTriggeringWF(null);
    }
  };

  // Dispatch Weekly Pulse Survey Campaign
  const handleDispatchPulseSurvey = async () => {
    setTriggeringWF('wf3');
    setStatusMessage(null);

    try {
      let recipients: Array<{ name: string; email: string; department?: string }> = [];

      if (dispatchTarget === 'custom' && customDispatchEmail) {
        const found = employees.find((e) => e.email === customDispatchEmail);
        recipients = [
          {
            name: found?.name || 'Nhân sự',
            email: customDispatchEmail,
            department: found?.dept || found?.department || 'Phòng Kỹ thuật & Công nghệ',
          },
        ];
      } else {
        recipients = employees.map((e) => ({
          name: e.name,
          email: e.email,
          department: e.dept || e.department || 'Toàn công ty',
        }));
      }

      const res = await axios.post('/api/n8n', {
        workflow: 'weekly_survey_dispatcher',
        payload: {
          recipients,
          week: 'Tuần 42 - 2026',
          sender: user?.fullName || 'HR Management & Wellbeing Board',
        },
      });

      setStatusMessage({
        type: 'success',
        text: `[Khởi Chạy Thành Công] Đã phát hành chiến dịch khảo sát tuần tới ${recipients.length} nhân sự. Hệ thống đã tự động gửi Magic Link qua email!`,
      });
      setShowDispatchModal(false);
    } catch (err: any) {
      console.error('Lỗi khi khởi chạy khảo sát:', err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi phát hành khảo sát tuần: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setTriggeringWF(null);
    }
  };

  const openInterventionForFeedback = (fb: FeedbackItem) => {
    const matched = employees.find((e) => e.name === fb.employeeName || e.dept === fb.department);
    setWellbeingForm({
      employeeName: matched?.name || fb.employeeName || 'Nhân sự',
      employeeEmail: matched?.email || (employees[0] ? employees[0].email : 'tunguyen2006.qt@gmail.com'),
      department: fb.department,
      actionType: 'COFFEE_VOUCHER',
      sentimentScore: fb.sentiment === 'attention' ? 2.0 : 3.0,
      burnoutRisk: fb.sentiment === 'attention' ? 'High' : 'Medium',
      triggerReason: `Phản hồi từ nhân viên: "${fb.comment}"`,
    });
    setShowWellbeingModal(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero Banner Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-rose-300 uppercase tracking-wider bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-800/60">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>TRUNG TÂM GẮN KẾT & PHÚC LỢI NHÂN SỰ</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400">ACTIVE & AUTOMATED</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>❤️ Gắn Kết Nhân Sự & Chăm Sóc Sức Khỏe Tinh Thần</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Tự động phân phối khảo sát định kỳ, thu thập & phân tích mức độ kiệt sức qua trí tuệ nhân tạo, và điều phối các gói can thiệp chăm sóc sức khỏe thể chất & tinh thần cho nhân viên.
            </p>
          </div>

          {/* Interactive Trigger Buttons: Phân quyền HR vs Nhân viên */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            {/* HR CHỈ CÓ: Gửi Khảo Sát Tuần & Can Thiệp Phúc Lợi (Không làm bài khảo sát) */}
            {isHR && (
              <>
                <button
                  onClick={() => setShowDispatchModal(true)}
                  disabled={triggeringWF !== null}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  title="Gửi email khảo sát Pulse Survey kèm Magic Link tới nhân viên"
                >
                  <Send className={`w-3.5 h-3.5 text-blue-400 ${triggeringWF === 'wf3' ? 'animate-spin' : ''}`} />
                  <span>🚀 Gửi Khảo Sát Tuần</span>
                </button>

                <button
                  onClick={() => setShowWellbeingModal(true)}
                  disabled={triggeringWF !== null}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-rose-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  title="Điều phối gói can thiệp sức khỏe (Voucher cafe, tư vấn tâm lý, giảm tải)"
                >
                  <Coffee className={`w-3.5 h-3.5 ${triggeringWF === 'wf2' ? 'animate-spin' : ''}`} />
                  <span>☕ Can Thiệp Phúc Lợi</span>
                </button>
              </>
            )}

            {/* NHÂN VIÊN CHỈ CÓ: Làm Khảo Sát (Không có quyền gửi khảo sát hay can thiệp cho người khác) */}
            {isEmployee && (
              <button
                onClick={() => handleOpenSurveyModal()}
                disabled={triggeringWF !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all shadow-lg shadow-rose-900/30 disabled:opacity-50 cursor-pointer"
                title="Điền khảo sát nhịp đập & đóng góp ý kiến"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${triggeringWF === 'wf1' ? 'animate-spin' : ''}`} />
                <span>✍️ Làm Khảo Sát Gắn Kết</span>
              </button>
            )}

            {/* Khách vãng lai / chưa đăng nhập */}
            {!isHR && !isEmployee && (
              <button
                onClick={() => handleOpenSurveyModal()}
                disabled={triggeringWF !== null}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>✍️ Làm Khảo Sát Gắn Kết</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-xs border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <p className="text-xs md:text-sm font-medium leading-relaxed">{statusMessage.text}</p>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chỉ số eNPS</span>
              <ThumbsUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">+58</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Mức Rất Tốt
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">72% Ủng hộ · 14% Trung lập · 14% Cần lưu ý</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ phản hồi</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">88.5%</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {employees.length} Nhân sự theo dõi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Dữ liệu nhân sự thật từ hệ thống HR</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Wellbeing</span>
              <Smile className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                4.6<span className="text-base text-slate-400 font-normal">/5.0</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Tích cực
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Cân bằng công việc & đời sống tốt</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đề xuất cải thiện</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {feedbacks.filter((f) => f.status === 'resolved').length}
                <span className="text-base text-slate-400 font-normal">/{feedbacks.length}</span>
              </span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Đã xử lý
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Gemini AI tự động đề xuất hành động</p>
          </div>
        </div>

        {/* Workflow Quick Explanation Card: Phân quyền HR vs Nhân viên */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {isHR ? 'PHÂN PHỐI KHẢO SÁT' : 'KHẢO SÁT TUẦN'}
                </span>
                <span className="text-[11px] text-slate-400">Tự động hóa</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isHR ? 'Phân Phối Khảo Sát Tuần (Pulse Survey)' : 'Khảo Sát Nhịp Đập Của Bạn'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHR
                  ? 'Tự động tạo Magic Link khảo sát riêng biệt cho từng nhân sự và gửi email hàng loạt để khảo sát nhịp đập doanh nghiệp.'
                  : 'Dành 60 giây chia sẻ cảm nhận về công việc, tiến độ sprint và nhận hỗ trợ chăm sóc sức khỏe tinh thần kịp thời.'}
              </p>
            </div>
            {isHR ? (
              <button
                onClick={() => setShowDispatchModal(true)}
                className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 text-left cursor-pointer flex items-center gap-1"
              >
                <span>Khởi chạy gửi khảo sát</span> →
              </button>
            ) : (
              <button
                onClick={() => handleOpenSurveyModal()}
                className="mt-3 text-xs font-bold text-rose-600 hover:text-rose-700 text-left cursor-pointer flex items-center gap-1"
              >
                <span>Điền khảo sát của bạn</span> →
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {isHR ? 'GIÁM SÁT & PHÂN TÍCH AI' : 'BẢO MẬT & ẨN DANH'}
                </span>
                <span className="text-[11px] text-slate-400">Trí tuệ nhân tạo</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isHR ? 'Giám Sát Mức Độ Kiệt Sức (Burnout Risk)' : 'Bảo Mật Danh Tính 100%'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHR
                  ? 'Gemini AI tự động phân loại 5 chủ đề, tính điểm Burnout Risk, đồng bộ dữ liệu & cảnh báo sớm nhân viên căng thẳng.'
                  : 'Mọi đánh giá và ý kiến của bạn đều được AI bảo mật, ẩn danh và tổng hợp thành báo cáo chung.'}
              </p>
            </div>
            {isHR ? (
              <span className="mt-3 text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span>Hệ thống AI giám sát tự động</span>
              </span>
            ) : (
              <span className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <span>Bảo vệ quyền riêng tư</span>
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {isHR ? 'ĐIỀU PHỐI PHÚC LỢI' : 'QUYỀN LỢI ĐỜI SỐNG'}
                </span>
                <span className="text-[11px] text-slate-400">Chăm sóc nhân sự</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isHR ? 'Điều Phối Can Thiệp Wellbeing Cá Nhân Hóa' : 'Đặc Quyền Phúc Lợi & Wellbeing'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHR
                  ? 'Gemini AI lựa chọn gói hỗ trợ tối ưu (Coffee Voucher, Tư vấn tâm lý 1:1, Điều chỉnh khối lượng) gửi cho nhân viên.'
                  : 'Hưởng 3 ngày phép Mental Health Day, Happy Friday hàng tuần, Coffee Voucher và các chương trình hỗ trợ sức khỏe toàn diện.'}
              </p>
            </div>
            {isHR ? (
              <button
                onClick={() => setShowWellbeingModal(true)}
                className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 text-left cursor-pointer flex items-center gap-1"
              >
                <span>Điều phối can thiệp phúc lợi</span> →
              </button>
            ) : (
              <span className="mt-3 text-xs font-bold text-amber-700 flex items-center gap-1">
                <span>Đang áp dụng cho bạn</span>
              </span>
            )}
          </div>
        </div>

        {/* Sentiment Categories Radar / Progress Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Mức Độ Hài Lòng Theo Từng Khía Cạnh Hoạt Động</h2>
              <p className="text-xs text-slate-500">Phân tích tự động từ kết quả khảo sát ẩn danh định kỳ.</p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md">
              Kỳ Q4/2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Môi trường & Văn hóa làm việc</span>
                  <span className="text-emerald-600 font-mono">94% Tích cực</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Mối quan hệ Đồng nghiệp & Quản lý trực tiếp</span>
                  <span className="text-emerald-600 font-mono">91% Hài lòng</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '91%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Cơ hội Đào tạo, Nâng cao Năng lực & Thăng tiến</span>
                  <span className="text-blue-600 font-mono">88% Đáp ứng</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Chế độ Đãi ngộ, Lương thưởng & Phúc lợi</span>
                  <span className="text-amber-600 font-mono">82% Đồng thuận</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Columns: Feedback Feed & Wellbeing Programs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-500" />
                  <h2 className="text-base font-bold text-slate-900">Phản Hồi & Ý Kiến Nhân Sự (Live Stream)</h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">{feedbacks.length} phản hồi</span>
              </div>

              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fb.sentiment === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fb.sentiment === 'attention'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {fb.sentiment === 'positive'
                            ? 'Tích cực'
                            : fb.sentiment === 'attention'
                            ? 'Cần chú ý'
                            : 'Góp ý'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{fb.category}</span>
                        <span className="text-[11px] text-slate-400">· {fb.department}</span>
                        {fb.employeeName && (
                          <span className="text-[11px] font-mono text-slate-500">({fb.employeeName})</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Can thiệp phúc lợi: CHỈ HR MỚI CÓ QUYỀN */}
                      {isHR && fb.sentiment === 'attention' && (
                        <button
                          onClick={() => openInterventionForFeedback(fb)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 border border-amber-300 hover:border-amber-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          title="Gửi gói chăm sóc Wellbeing cho nhân sự này"
                        >
                          <Coffee className="w-3 h-3" />
                          <span>Can thiệp phúc lợi</span>
                        </button>
                      )}

                      {/* Xử lý phản hồi: CHỈ HR MỚI CÓ QUYỀN */}
                      {isHR ? (
                        fb.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                            <Check className="w-3 h-3" /> Đã phản hồi
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResolveFeedback(fb.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <span>Xác nhận xử lý</span>
                          </button>
                        )
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                          fb.status === 'resolved' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                        }`}>
                          {fb.status === 'resolved' ? 'Đã phản hồi' : 'Đang xử lý'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wellbeing Programs */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h2 className="text-base font-bold text-slate-900">Chương Trình Wellbeing</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-600 font-bold rounded">
                  Q4/2026
                </span>
              </div>

              <div className="space-y-3">
                {wellbeingList.map((wb) => (
                  <div key={wb.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider">
                        {wb.tag}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {wb.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">{wb.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{wb.schedule}</span>
                      <span className="font-semibold text-slate-700">{wb.participants} người tham gia</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 flex items-center gap-3">
              <Coffee className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Chính sách nghỉ phép linh hoạt</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Mỗi nhân sự được cấp 14 ngày phép năm và 3 ngày Mental Health Day.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: WF 01 - Điền Khảo Sát Nhịp Đập & AI Classification */}
      {/* ========================================================= */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">Khảo Sát Xung Nhịp Tuần (Pulse Survey)</h3>
                  <p className="text-[11px] text-rose-200">Trí tuệ nhân tạo phân loại cảm xúc & đánh giá kiệt sức tự động</p>
                </div>
              </div>
              <button
                onClick={() => setShowSurveyModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSurvey} className="p-6 space-y-4">
              <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Khảo sát nhanh 60 giây. Mọi phản hồi đều được Gemini AI bảo mật và tổng hợp tự động.
                </span>
              </div>

              {/* Nếu là Nhân viên: Tự động gán thông tin của chính mình, KHÔNG cho chọn nhân sự khác */}
              {isEmployee ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Nhân sự thực hiện:</span>
                    <span className="font-bold text-slate-900">{user?.fullName || surveyForm.employeeName}</span>{' '}
                    <span className="text-rose-600 font-mono font-bold text-xs">({user?.email || surveyForm.employeeEmail})</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">
                    {(typeof user?.department === 'string' ? user?.department : user?.department?.name) || surveyForm.department}
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Nhân Sự Đánh Giá</label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-rose-500"
                    value={surveyForm.employeeEmail}
                    onChange={(e) => {
                      const sel = employees.find((emp) => emp.email === e.target.value);
                      if (sel) {
                        setSurveyForm({
                          ...surveyForm,
                          employeeEmail: sel.email,
                          employeeName: sel.name,
                          department: sel.dept || sel.department || surveyForm.department,
                        });
                      }
                    }}
                  >
                    {employees.map((emp) => (
                      <option key={emp.email + (emp.id || '')} value={emp.email}>
                        {emp.name} ({emp.email}) - {emp.dept || emp.department || 'Toàn công ty'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!isEmployee && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ Tên Nhân Sự</label>
                    <input
                      type="text"
                      required
                      value={surveyForm.employeeName}
                      onChange={(e) => setSurveyForm({ ...surveyForm, employeeName: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phòng Ban</label>
                    <input
                      type="text"
                      required
                      value={surveyForm.department}
                      onChange={(e) => setSurveyForm({ ...surveyForm, department: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-rose-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mức độ hài lòng trong tuần (1 - 10)
                  </label>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      surveyForm.rating >= 8
                        ? 'bg-emerald-100 text-emerald-800'
                        : surveyForm.rating >= 6
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {surveyForm.rating}/10 điểm
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-between">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setSurveyForm({ ...surveyForm, rating: num })}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        surveyForm.rating === num
                          ? num <= 4
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : num <= 7
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1: Rất căng thẳng / thất vọng</span>
                  <span>10: Cực kỳ hài lòng & gắn kết</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chia sẻ ý kiến, cảm xúc hoặc vấn đề cần hỗ trợ:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Dạo này khối lượng công việc sprint hơi dồn dập, hoặc trang thiết bị làm việc rất tốt..."
                  value={surveyForm.textAnswer}
                  onChange={(e) => setSurveyForm({ ...surveyForm, textAnswer: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-rose-500"
                ></textarea>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Quy trình xử lý tự động:
                </p>
                <p>1. Ghi nhận vào cơ sở dữ liệu & đồng bộ báo cáo nội bộ.</p>
                <p>2. AI phân loại chủ đề: Khối lượng công việc, Chế độ đãi ngộ, Lãnh đạo, Văn hóa, Phát triển.</p>
                <p>3. Nếu điểm ≤ 4 hoặc có dấu hiệu quá tải: Tự động gửi cảnh báo & đề xuất hỗ trợ kịp thời.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={triggeringWF === 'wf1'}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className={`w-3.5 h-3.5 ${triggeringWF === 'wf1' ? 'animate-spin' : ''}`} />
                  <span>{triggeringWF === 'wf1' ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: WF 02 - Điều Phối Gói Can Thiệp Wellbeing */}
      {/* ========================================================= */}
      {showWellbeingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coffee className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">Điều Phối Gói Can Thiệp Phúc Lợi</h3>
                  <p className="text-[11px] text-amber-200">Gửi Voucher & hỗ trợ tâm lý cá nhân hóa qua trợ lý AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowWellbeingModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerWellbeing} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Nhân Sự Nhận Can Thiệp</label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-amber-500"
                  value={wellbeingForm.employeeEmail}
                  onChange={(e) => {
                    const sel = employees.find((emp) => emp.email === e.target.value);
                    if (sel) {
                      setWellbeingForm({
                        ...wellbeingForm,
                        employeeEmail: sel.email,
                        employeeName: sel.name,
                        department: sel.dept || sel.department || wellbeingForm.department,
                      });
                    }
                  }}
                >
                  {employees.map((emp) => (
                    <option key={emp.email + (emp.id || '')} value={emp.email}>
                      {emp.name} ({emp.email}) - {emp.dept || emp.department || 'Toàn công ty'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gói Can Thiệp (Action Type)</label>
                  <select
                    value={wellbeingForm.actionType}
                    onChange={(e) => setWellbeingForm({ ...wellbeingForm, actionType: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-amber-500"
                  >
                    <option value="AUTO">🤖 Tự động (Gemini AI quyết định)</option>
                    <option value="COFFEE_VOUCHER">☕ Voucher Cafe & Trò chuyện</option>
                    <option value="COUNSELING_CHAT">💬 Buổi tư vấn 1:1 Tâm lý</option>
                    <option value="WORKLOAD_RELIEF">🌴 Giảm tải việc & Nghỉ sạc pin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức Độ Căng Thẳng (Risk)</label>
                  <select
                    value={wellbeingForm.burnoutRisk}
                    onChange={(e) => setWellbeingForm({ ...wellbeingForm, burnoutRisk: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-amber-500"
                  >
                    <option value="Low">Thấp (Bình thường)</option>
                    <option value="Medium">Trung bình (Áp lực nhẹ)</option>
                    <option value="High">Cao (Cần hỗ trợ sớm)</option>
                    <option value="Critical">Rất cao (Nguy cơ kiệt sức)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do kích hoạt can thiệp / Ghi chú từ HR:
                </label>
                <textarea
                  rows={2}
                  required
                  value={wellbeingForm.triggerReason}
                  onChange={(e) => setWellbeingForm({ ...wellbeingForm, triggerReason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-amber-500"
                ></textarea>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Hành động tiếp theo của hệ thống:
                </p>
                <p>• Trí tuệ nhân tạo soạn thảo thư động viên chân thành theo hoàn cảnh riêng.</p>
                <p>• Tự sinh mã quà tặng / thư mời tư vấn và gửi trực tiếp tới email <strong>{wellbeingForm.employeeEmail}</strong>.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWellbeingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={triggeringWF === 'wf2'}
                  className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className={`w-3.5 h-3.5 ${triggeringWF === 'wf2' ? 'animate-spin' : ''}`} />
                  <span>{triggeringWF === 'wf2' ? 'Đang gửi...' : 'Gửi Can Thiệp Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: WF 03 - Khởi chạy Pulse Survey Dispatcher */}
      {/* ========================================================= */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-bold text-sm">Phát Hành Khảo Sát Tuần Mới</h3>
                  <p className="text-[11px] text-blue-200">Tự động phát hành Magic Link và gửi email hàng loạt cho nhân sự</p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đối Tượng Nhận Khảo Sát</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchTarget('all')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      dispatchTarget === 'all'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Toàn Bộ Nhân Sự</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{employees.length} nhân sự hệ thống</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchTarget('custom');
                      if (!customDispatchEmail && employees[0]) {
                        setCustomDispatchEmail(employees[0].email);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      dispatchTarget === 'custom'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">1 Nhân Sự Cụ Thể (Test)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Chọn email để kiểm tra nhanh</div>
                  </button>
                </div>
              </div>

              {dispatchTarget === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Email Nhân Sự Để Test</label>
                  <select
                    value={customDispatchEmail}
                    onChange={(e) => setCustomDispatchEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-blue-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.email + (emp.id || '')} value={emp.email}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Quy trình gửi email tự động:
                </p>
                <p>• Mỗi nhân sự nhận được 1 email tiêu đề: <strong>[Pulse Survey Tuần 42] Khảo sát nhịp đập & gắn kết nhân viên</strong>.</p>
                <p>• Nút &ldquo;Bắt đầu khảo sát&rdquo; gắn Magic Link dẫn trực tiếp về trang <code>/engagement?tab=survey&email=...</code>.</p>
                <p>• Nhân sự bấm vào link là form tự động điền sẵn thông tin, không cần đăng nhập lại.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleDispatchPulseSurvey}
                  disabled={triggeringWF === 'wf3'}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className={`w-3.5 h-3.5 ${triggeringWF === 'wf3' ? 'animate-spin' : ''}`} />
                  <span>{triggeringWF === 'wf3' ? 'Đang phát hành...' : 'Khởi Chạy Gửi Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
