'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '@/components/topdev/Header';
import AgentNavBar from '@/components/AgentNavBar';
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
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  department: string;
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

export default function EngagementPage() {
  const { user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const [triggering, setTriggering] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: 'fb-1',
      department: 'Phòng Kỹ thuật & Công nghệ',
      sentiment: 'positive',
      comment: 'Trang thiết bị làm việc rất tốt, chế độ Remote linh hoạt giúp tôi cân bằng cuộc sống và năng suất code cao hơn.',
      category: 'Môi trường làm việc',
      time: '2 giờ trước',
      status: 'resolved',
    },
    {
      id: 'fb-2',
      department: 'Phòng Tuyển dụng & HR',
      sentiment: 'positive',
      comment: 'Hệ thống AI ATS và tự động hóa n8n mới giúp team tiết kiệm đến 40% thời gian duyệt hồ sơ và gửi email phỏng vấn.',
      category: 'Công cụ & Quy trình',
      time: 'Hôm qua',
      status: 'resolved',
    },
    {
      id: 'fb-3',
      department: 'Phòng Marketing',
      sentiment: 'attention',
      comment: 'Cần bổ sung thêm ngân sách cho các khóa đào tạo chuyên sâu về AI Performance Marketing và Content Strategy.',
      category: 'Đào tạo & Phát triển',
      time: '2 ngày trước',
      status: 'in_progress',
    },
    {
      id: 'fb-4',
      department: 'Phòng Sản phẩm',
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

  const handleResolveFeedback = (id: string) => {
    setFeedbacks(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'resolved' as const } : f))
    );
  };

  const triggerEngagementSurvey = async () => {
    setTriggering(true);
    setStatusMessage(null);

    try {
      const res = await axios.post('/api/n8n', {
        workflow: 'engagement_survey',
        payload: {
          department: 'Toàn thể công ty',
          sender: user?.fullName || 'HR Management',
        },
      });

      setStatusMessage(res.data?.message || 'Đã kích hoạt chiến dịch khảo sát eNPS thành công!');
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt khảo sát:', err);
      setStatusMessage('Đã gửi thông báo khởi chạy khảo sát nội bộ tới các phòng ban.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Header />
      <AgentNavBar />

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Hero Banner Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-rose-300 uppercase tracking-wider bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-800/60">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                <span>AGENT 5 · ENGAGEMENT & WELLBEING AUTOMATION</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400">ACTIVE & AUTOMATED</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>❤️ AI Employee Engagement & Wellbeing</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Khảo sát nhịp đập doanh nghiệp (Pulse Survey), đo lường chỉ số eNPS, phân tích tâm lý gắn kết và chăm sóc sức khỏe thể chất & tinh thần cho toàn bộ nhân sự.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <button
                onClick={triggerEngagementSurvey}
                disabled={triggering}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${triggering ? 'animate-spin' : ''}`} />
                <span>{triggering ? 'Đang gửi...' : 'Khởi chạy Pulse Survey (n8n)'}</span>
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{statusMessage}</p>
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
                  46/52 Nhân sự
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Tăng 6.2% so với kỳ khảo sát trước</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm Wellbeing</span>
                <Smile className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">4.6<span className="text-base text-slate-400 font-normal">/5.0</span></span>
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
                <span className="text-3xl font-extrabold text-slate-900">12<span className="text-base text-slate-400 font-normal">/15</span></span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  80% Đã xử lý
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">3 đề xuất đang trong quá trình thực thi</p>
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
                    <h2 className="text-base font-bold text-slate-900">Phản Hồi & Đóng Góp Ý Kiến Ẩn Danh Gần Nhất</h2>
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
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fb.sentiment === 'positive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fb.sentiment === 'attention'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {fb.sentiment === 'positive' ? 'Tích cực' : fb.sentiment === 'attention' ? 'Cần cải thiện' : 'Góp ý'}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{fb.category}</span>
                          <span className="text-[11px] text-slate-400">· {fb.department}</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {fb.status === 'resolved' ? (
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
    </div>
  );
}
