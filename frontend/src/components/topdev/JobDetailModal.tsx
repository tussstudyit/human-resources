'use client';

import React, { useState } from 'react';
import { Job } from '@/types/topdev';
import { 
  X, 
  Bookmark, 
  Share2, 
  MapPin, 
  Building2, 
  Clock, 
  Layers, 
  Users, 
  CheckCircle2, 
  Gift, 
  FileText, 
  Cpu, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onApply: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<'jd' | 'company'>('jd');
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !job) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10">
            {/* Company Avatar */}
            <div className="w-16 h-16 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center shadow-md">
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span>{job.company.name}</span>
                {job.company.verified && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                )}
                <span className="text-slate-500">·</span>
                <span>{job.company.industry}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mt-1 leading-snug">
                {job.title}
              </h2>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
                <span className="text-base font-extrabold text-red-400 font-mono">
                  {job.salary.display}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.company.city}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {job.level} ({job.workType})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Đăng {job.postedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApply(job)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Ứng Tuyển Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleSave(job.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-400' : ''}`} />
                <span>{isSaved ? 'Đã lưu việc làm' : 'Lưu tin'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                title="Sao chép link tuyển dụng"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copiedShare && (
                <span className="text-xs text-emerald-400 font-medium">Đã sao chép link!</span>
              )}
            </div>

            <div className="text-xs text-slate-400">
              <span>{job.viewsCount} lượt xem</span>
              <span className="mx-1.5">·</span>
              <span className="text-slate-300 font-semibold">{job.applicantsCount} hồ sơ đã nộp</span>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="border-b border-slate-200 px-6 bg-slate-50 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('jd')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'jd'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Chi tiết công việc
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'company'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Về công ty & Môi trường làm việc
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800 text-sm leading-relaxed">
          {activeTab === 'jd' ? (
            <>
              {/* Quick Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Kinh nghiệm</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{job.experienceYears}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Cấp bậc</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{job.level}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Hình thức</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{job.workType}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Địa điểm</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{job.location}</div>
                </div>
              </div>

              {/* Tech Stack Matrix */}
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-red-600" />
                  Kỹ năng & Công nghệ yêu cầu
                </h4>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 min-w-24">Core Tech:</span>
                    {job.techStackDetails.primary.map((tech) => (
                      <span key={tech} className="bg-red-50 text-red-700 font-semibold px-2.5 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {job.techStackDetails.secondary.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 min-w-24">Phụ trợ / Libs:</span>
                      {job.techStackDetails.secondary.map((tech) => (
                        <span key={tech} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.techStackDetails.database && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 min-w-24">Database:</span>
                      {job.techStackDetails.database.map((db) => (
                        <span key={db} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs">
                          {db}
                        </span>
                      ))}
                    </div>
                  )}

                  {job.techStackDetails.cloudDevops && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 min-w-24">Cloud & DevOps:</span>
                      {job.techStackDetails.cloudDevops.map((c) => (
                        <span key={c} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 1. Job Description */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-red-600" />
                  Mô tả công việc
                </h4>
                <ul className="space-y-2">
                  {job.description.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Requirements */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-red-600" />
                  Yêu cầu ứng viên
                </h4>
                <ul className="space-y-2">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Benefits */}
              <div className="pt-2 border-t border-slate-100 bg-red-50/50 p-4 rounded-xl border border-red-100">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-red-600" />
                  Quyền lợi & Đãi ngộ
                </h4>
                <ul className="space-y-2">
                  {job.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-800 font-medium">
                      <span className="text-red-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Working Location Details */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Địa điểm làm việc
                </h4>
                <p className="text-slate-600">{job.company.address}</p>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.company.name}</h3>
                    <p className="text-xs text-slate-500">{job.company.industry}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Quy mô công ty:</span>
                    <span className="font-semibold text-slate-800">{job.company.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Trụ sở:</span>
                    <span className="font-semibold text-slate-800">{job.company.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Trạng thái:</span>
                    <span className="font-semibold text-blue-600">Đã xác minh bởi UpCareer</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2">Về chúng tôi</h4>
                <p className="text-slate-600">
                  {job.company.name} là một trong những doanh nghiệp công nghệ tiên phong tại Việt Nam, sở hữu môi trường văn hóa mở, minh bạch và tạo mọi điều kiện để kỹ sư phát triển vượt bậc. Đội ngũ kỹ sư tại đây luôn được tiếp cận với các bài toán quy mô lớn, thử thách công nghệ cao và hệ thống chịu tải hàng triệu người dùng.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Văn phòng làm việc</h4>
                <p className="text-slate-600 text-xs mb-3">{job.company.address}</p>
                <div className="h-48 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-mono">
                  [Bản đồ vị trí văn phòng {job.company.name} - {job.company.city}]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer for instant application */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-xs text-slate-500">Mức lương:</span>
            <span className="text-base font-extrabold text-red-600 font-mono ml-2">
              {job.salary.display}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => onApply(job)}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
            >
              Nộp đơn ứng tuyển ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
