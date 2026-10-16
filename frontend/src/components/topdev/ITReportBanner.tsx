'use client';

import React, { useState } from 'react';
import { IT_SALARY_REPORT_DATA } from '@/data/topdevMockData';
import { 
  TrendingUp, 
  Download, 
  X, 
  BarChart3, 
  CheckCircle, 
  Zap, 
  Layers, 
  DollarSign, 
  FileSpreadsheet, 
  Share2 
} from 'lucide-react';

interface ITReportBannerProps {
  onOpenModal: () => void;
}

export const ITReportBanner: React.FC<ITReportBannerProps> = ({ onOpenModal }) => {
  return (
    <section className="py-12 bg-linear-to-r from-slate-900 via-slate-800 to-red-950 text-white relative overflow-hidden">
      {/* Background graphic elements */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/10 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-3 border border-red-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Báo Cáo Độc Quyền UpCareer · Phiên bản {IT_SALARY_REPORT_DATA.edition}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
              Báo Cáo Thị Trường IT Việt Nam: Lương & Xu Hướng Tuyển Dụng
            </h2>

            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Khảo sát chuyên sâu từ hơn 45,000+ lập trình viên và 1,500+ doanh nghiệp công nghệ. Nắm bắt thang bảng lương chuẩn xác, các kỹ năng được săn đón nhất và định hình sự nghiệp công nghệ trong kỷ nguyên AI.
            </p>

            {/* Quick Metrics */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {IT_SALARY_REPORT_DATA.keyHighlights.map((hl, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-red-400 font-mono tabular-nums">
                    {hl.metric}
                  </div>
                  <div className="text-xs font-medium text-slate-200 mt-0.5">{hl.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{hl.trend}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenModal}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Xem Trực Tuyến & Tải Báo Cáo</span>
              </button>
              <button
                onClick={onOpenModal}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors border border-white/15 cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-300" />
                <span>Tải Bản PDF Đầy Đủ</span>
              </button>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 font-mono ml-2">upcareer_salary_insight_2026.json</span>
                </div>
                <span className="text-[11px] font-bold text-red-400 uppercase bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                  HOT INSIGHTS
                </span>
              </div>

              {/* Mini Salary Preview Table */}
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Kỹ Năng IT Nóng Nhất</span>
                  <span>Mức Lương Trung Bình / Tháng</span>
                </div>

                {IT_SALARY_REPORT_DATA.salaryBySkill.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-200">{item.skill}</span>
                      <span className="text-red-400 font-bold font-mono">${item.avg} USD</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-linear-to-r from-red-500 to-rose-400 h-1.5 rounded-full" 
                        style={{ width: `${(item.avg / 3500) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Nguồn: Khảo sát độc quyền UpCareer</span>
                <button
                  onClick={onOpenModal}
                  className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                >
                  Xem toàn bộ 35+ kỹ năng →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

interface ITReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ITReportModal: React.FC<ITReportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'skill' | 'level' | 'trends'>('skill');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Generate text/csv report file for instant candidate download
    const reportSummary = `BÁO CÁO THỊ TRƯỜNG IT VIỆT NAM 2025 - 2026 (UPCAREER)\n\n` +
      `Thống kê lương theo kỹ năng:\n` +
      IT_SALARY_REPORT_DATA.salaryBySkill.map(s => `- ${s.skill}: $${s.min} - $${s.max} USD (TB: $${s.avg} USD, Tăng trưởng: ${s.trend})`).join('\n') +
      `\n\nThống kê theo số năm kinh nghiệm:\n` +
      IT_SALARY_REPORT_DATA.salaryByExperience.map(e => `- ${e.level}: ${e.range} (Nhu cầu: ${e.demand})`).join('\n') +
      `\n\nNguồn: UpCareer - Hệ sinh thái Việc làm IT hàng đầu Việt Nam`;

    const blob = new Blob([reportSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UpCareer_Vietnam_IT_Salary_Report_2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Báo Cáo Toàn Diện {IT_SALARY_REPORT_DATA.edition}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Báo Cáo Thị Trường IT Việt Nam: Lương & Xu Hướng Tuyển Dụng
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Dữ liệu từ 45,000+ lập trình viên và 1,500+ doanh nghiệp công nghệ trên toàn quốc.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('skill')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'skill'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Lương theo Kỹ năng Công nghệ
          </button>
          <button
            onClick={() => setActiveTab('level')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'level'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Lương theo Số Năm Kinh Nghiệm
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'trends'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Xu Hướng Tuyển Dụng Nổi Bật
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800">
          
          {activeTab === 'skill' && (
            <div>
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <span>Dải lương (USD Net) hàng tháng theo ngôn ngữ & chuyên môn:</span>
                <span className="font-semibold text-slate-700">Tỷ lệ tăng trưởng so với năm trước</span>
              </div>

              <div className="space-y-4">
                {IT_SALARY_REPORT_DATA.salaryBySkill.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-slate-900 text-sm">{item.skill}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-red-600">
                          ${item.min} - ${item.max} USD
                        </span>
                        <span className="text-xs text-slate-500">(TB: ${item.avg})</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.trend}
                        </span>
                      </div>
                    </div>

                    {/* Visual Bar Gauge */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-linear-to-r from-red-500 to-rose-600 h-2 rounded-full" 
                        style={{ width: `${(item.avg / 4500) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'level' && (
            <div>
              <div className="mb-4 text-xs text-slate-500">
                Bảng phân phối thu nhập thực tế theo cấp bậc và kinh nghiệm:
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Cấp Bậc & Kinh Nghiệm</th>
                      <th className="p-3">Khoảng Lương Phổ Biến</th>
                      <th className="p-3">Mức Độ Cạnh Tranh Tuyển Dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {IT_SALARY_REPORT_DATA.salaryByExperience.map((exp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{exp.level}</td>
                        <td className="p-3 font-mono font-bold text-red-600">{exp.range}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[11px] font-semibold ${
                            exp.demand.includes('khan hiếm') || exp.demand.includes('Săn đón')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {exp.demand}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-red-700 text-sm mb-1">
                  <Zap className="w-4 h-4" />
                  1. Sự trỗi dậy mạnh mẽ của Kỹ sư AI & LLMs (+48% nhu cầu)
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Các doanh nghiệp Việt Nam đang tích cực chuyển dịch từ giai đoạn thử nghiệm AI sang triển khai thực tế trên sản phẩm (Agentic AI, RAG, Local LLMs). Các kỹ sư nắm vững PyTorch, LangChain, Vector Search và tối ưu GPU đang được săn đón với mức đãi ngộ vượt trội.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <Layers className="w-4 h-4 text-blue-600" />
                  2. Mô hình Hybrid Work trở thành tiêu chuẩn vàng (68.5%)
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Đại đa số lập trình viên ưu tiên các công ty có chính sách làm việc linh hoạt (2-3 ngày tại văn phòng, các ngày còn lại làm việc từ xa). Các doanh nghiệp bắt buộc onsite 100% gặp nhiều khó khăn hơn trong việc thu hút nhân tài cấp Senior và Lead.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  3. Tối ưu chi phí Cloud (FinOps) & Nền tảng Microservices gọn nhẹ
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Xu hướng FinOps và tối ưu chi phí hạ tầng AWS/GCP đang trở thành kỹ năng bắt buộc đối với Backend và DevOps Engineers. Ngôn ngữ hiệu năng cao như Golang và Rust tiếp tục tăng trưởng mạnh trong các hệ thống Core Transaction và Fintech.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {downloadSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Đã tải file tóm tắt báo cáo thành công!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Báo Cáo Miễn Phí (TXT/PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
