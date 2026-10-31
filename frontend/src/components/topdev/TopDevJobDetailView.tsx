'use client';

import React, { useState } from 'react';
import { Job } from '@/types/topdev';
import { 
  MapPin, 
  BarChart2, 
  Clock, 
  Heart, 
  Briefcase, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  Banknote,
  AlertCircle,
  Share2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface TopDevJobDetailViewProps {
  job: Job;
  allJobs?: Job[];
  onApplyClick: () => void;
  applicationForm?: React.ReactNode;
  onBack?: () => void;
  onSelectRelatedJob?: (job: Job) => void;
  onOpenProfileIncomplete?: () => void;
}

export const TopDevJobDetailView: React.FC<TopDevJobDetailViewProps> = ({
  job,
  allJobs = [],
  onApplyClick,
  applicationForm,
  onBack,
  onSelectRelatedJob,
  onOpenProfileIncomplete,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [savedRelatedIds, setSavedRelatedIds] = useState<string[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  // Filter related jobs from the real backend jobs list (exclude current job)
  const relatedJobs = allJobs.filter((j) => j.id !== job.id).slice(0, 3);

  const toggleSaveRelated = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedRelatedIds.includes(id)) {
      setSavedRelatedIds(savedRelatedIds.filter((i) => i !== id));
    } else {
      setSavedRelatedIds([...savedRelatedIds, id]);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const remainingDays = job.remainingDays || 14;
  const applicantsCount = job.applicantsCount || 0;
  const responsibilities = job.responsibilities || job.description || [];
  const skillsAndQualifications = job.skillsAndQualifications || [
    {
      category: 'Kinh nghiệm & Trình độ chuyên môn',
      items: [
        `Yêu cầu tối thiểu ${job.experienceYears} trong lĩnh vực phát triển phần mềm IT.`,
        'Tư duy logic giải quyết vấn đề hệ thống, chủ động học hỏi và thích nghi công nghệ mới.',
        'Kỹ năng phối hợp liên chức năng, làm việc nhóm và giao tiếp kỹ thuật hiệu quả.',
      ],
    },
    {
      category: 'Kỹ năng công nghệ & Công cụ cốt lõi',
      items: job.skills.map((s) => `Thành thạo công nghệ và nền tảng: ${s}`),
    },
  ];

  return (
    <div id="job-detail-overview" className="scroll-mt-24 bg-[#F4F5F8] min-h-screen py-6 sm:py-8 text-[#1E293B]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Back Navigation */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Quay lại danh sách việc làm</span>
              </button>
            )}
            <span className="hidden sm:inline text-slate-400">/</span>
            <span className="hidden sm:inline text-slate-600 font-medium">{job.company.name}</span>
            <span className="hidden sm:inline text-slate-400">/</span>
            <span className="hidden sm:inline font-bold text-slate-900 truncate max-w-xs">{job.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tuyển dụng trực tiếp</span>
            </span>
          </div>
        </div>

        {/* Top Notice Bar matching TopDev pink alert */}
        <div className="mb-4 px-4 py-2.5 bg-pink-50 border border-pink-200/90 rounded-xl text-xs font-medium text-pink-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
            <span>
              Hạn nộp hồ sơ sắp kết thúc trong <strong>{remainingDays} ngày</strong> (Ưu tiên các hồ sơ ứng tuyển sớm)
            </span>
          </div>
          <span className="hidden sm:inline text-pink-600 font-semibold text-[11px]">
            Đã có {applicantsCount} ứng viên nộp CV
          </span>
        </div>

        {/* 2-Column Main Layout matching TopDev standard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: Job Header & JD (8/12 cols) ================= */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 1. Job Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              
              {/* Job Title */}
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-snug">
                {job.title}
              </h1>

              {/* Salary Row (vibrant magenta with banknote icon) */}
              <div className="mt-2.5 flex items-center gap-2 text-lg sm:text-xl font-black text-[#E11D48]">
                <Banknote className="w-5 h-5 text-[#E11D48] shrink-0" />
                <span>{job.salary.display}</span>
                {job.urgent && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                    Tuyển gấp
                  </span>
                )}
              </div>

              {/* Metadata Info Row */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{job.experienceYears}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hình thức: {job.workType}</span>
                </div>
              </div>

              {/* Tags & Application status row */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {/* Skill Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-[#F1F5F9] rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Remaining Days & Applicants */}
                <div className="text-xs text-slate-500 font-medium">
                  <span>Còn {remainingDays} ngày</span>
                  <span className="mx-1.5">•</span>
                  <span>{applicantsCount} Ứng viên</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Primary Button: Ứng tuyển ngay */}
                <button
                  onClick={onApplyClick}
                  className="flex-1 py-3 px-8 bg-[#3B66F5] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ứng tuyển ngay</span>
                </button>

                {/* Secondary Button: Lưu công việc */}
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`py-3 px-6 rounded-lg text-sm font-semibold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-white border-[#3B66F5] text-[#3B66F5] hover:bg-blue-50/60'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isSaved ? 'Đã lưu công việc' : 'Lưu công việc'}</span>
                </button>

                {/* Share action */}
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    title="Chia sẻ tin tuyển dụng"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedShare && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                      Đã sao chép!
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* 2. Job Responsibilities & Description List */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-slate-800 text-sm leading-relaxed space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <span>Mô tả công việc</span>
              </h2>

              <ul className="space-y-2.5 text-slate-700">
                {responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Section [2] Kỹ năng & trình độ của bạn (Matching TopDev) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-slate-800 text-sm leading-relaxed space-y-5">
              
              {/* Section Header with Blue Number Badge */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded bg-[#3B66F5] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Yêu cầu ứng viên
                </h2>
              </div>

              {/* Subsections: Experience, Tech Stack, Databases & Infrastructure */}
              <div className="space-y-4">
                {skillsAndQualifications.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {section.category}:
                    </h3>
                    <ul className="space-y-1.5 text-slate-700 pl-1">
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Section [3] Quyền lợi dành cho bạn */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-slate-800 text-sm leading-relaxed space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-6 h-6 rounded bg-[#3B66F5] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Quyền lợi dành cho bạn
                </h2>
              </div>

              <ul className="space-y-2 text-slate-700">
                {(job.benefits || [
                  'Mức lương cạnh tranh, xét tăng lương 2 lần/năm.',
                  'Thưởng tháng 13 + thưởng hiệu quả kinh doanh dự án.',
                  'Làm việc với công nghệ hiện đại, hệ thống phân tán chịu tải cao.',
                  'Gói bảo hiểm sức khỏe quốc tế cao cấp dành cho nhân viên.',
                  'Môi trường năng động, trang bị laptop cấu hình cao.',
                ]).map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5">
                    <span className="text-[#3B66F5] font-bold">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom Quick Apply Trigger */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Bạn đã sẵn sàng ứng tuyển?</span>
                  <span className="text-sm font-bold text-slate-900">{job.title}</span>
                </div>
                <button
                  onClick={onApplyClick}
                  className="py-2.5 px-6 bg-[#3B66F5] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ứng tuyển ngay</span>
                </button>
              </div>
            </div>

            {applicationForm}
          </div>

          {/* ================= RIGHT COLUMN: Company Profile & Related Jobs (4/12 cols) ================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Company Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              
              {/* Top Banner Photo (Workshop/Conference Photo) */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={job.company.bannerImage || '/images/cyberlogitec_workshop.jpg'}
                  alt={`${job.company.name} Workshop`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Overlapping Company Logo */}
              <div className="px-5 pt-0 relative pb-4">
                <div className="-mt-8 w-16 h-16 rounded-lg bg-white border border-slate-300 shadow-md p-1.5 flex items-center justify-center font-black text-slate-900 text-lg tracking-wider font-mono">
                  {job.company.logoText || 'HTH'}
                </div>

                {/* Company Name */}
                <h3 className="text-base font-bold text-[#3B66F5] hover:underline cursor-pointer mt-2 leading-tight">
                  {job.company.name}
                </h3>

                {/* Details Table */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Ngành nghề</span>
                    <span className="font-semibold text-slate-900">{job.company.industry || 'Kỹ thuật & Công nghệ'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Quy mô</span>
                    <span className="font-semibold text-slate-900">{job.company.size || '100 - 500 nhân viên'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">Quốc gia</span>
                    <span className="font-semibold text-slate-900">{job.company.country || 'Việt Nam · Quốc tế'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3B66F5] font-semibold pt-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{allJobs.length || 10} việc làm đang tuyển</span>
                  </div>
                </div>

                {/* Link: Xem công ty */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <button 
                    onClick={onBack}
                    className="text-xs text-slate-600 hover:text-[#3B66F5] font-medium flex items-center justify-center gap-1 w-full cursor-pointer"
                  >
                    <span>Xem tất cả vị trí của công ty</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. "Việc làm cùng đơn vị tuyển dụng" Card */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {relatedJobs.length} Việc làm cùng công ty
                </h3>

                <div className="space-y-3">
                  {relatedJobs.map((rJob) => {
                    const isRJobSaved = savedRelatedIds.includes(rJob.id);
                    return (
                      <div
                        key={rJob.id}
                        onClick={() => onSelectRelatedJob && onSelectRelatedJob(rJob)}
                        className="p-3 bg-white hover:bg-slate-50/80 rounded-lg border border-slate-200/90 hover:border-blue-400 transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        {/* Mini Logo */}
                        <div className="w-10 h-10 rounded bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-900 text-xs shrink-0 font-mono">
                          {rJob.company.logoText || 'HTH'}
                        </div>

                        {/* Job Title & Salary */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#3B66F5] transition-colors leading-snug line-clamp-2">
                            {rJob.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#E11D48] font-bold">
                            <Banknote className="w-3.5 h-3.5 shrink-0" />
                            <span>{rJob.salary.display}</span>
                          </div>
                        </div>

                        {/* Heart Save Button */}
                        <button
                          onClick={(e) => toggleSaveRelated(rJob.id, e)}
                          className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0 ${
                            isRJobSaved ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Lưu tin này"
                        >
                          <Heart className={`w-4 h-4 ${isRJobSaved ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* View More Link */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    onClick={onBack}
                    className="text-xs font-semibold text-[#3B66F5] hover:underline flex items-center justify-center gap-1 w-full cursor-pointer"
                  >
                    <span>Xem thêm việc làm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Recruitment Tips Card */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-200/80 p-5 text-xs space-y-2.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3B66F5]" />
                <span>Mẹo ghi điểm cùng Nhà tuyển dụng</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Đính kèm CV có định dạng PDF chuẩn, liệt kê rõ các dự án thực tế và kết quả đạt được để AI Agent chấm điểm tương thích trên 85%.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Bottom Alert matching UpCareer screenshot */}
      <div className="fixed bottom-4 right-4 sm:right-6 z-40 bg-white border border-rose-200 rounded-xl p-3.5 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 leading-tight">
            Hồ sơ của bạn chưa hoàn thiện
          </div>
          <div className="text-[11px] text-slate-500">
            Cập nhật để tăng 80% cơ hội nhà tuyển dụng liên hệ
          </div>
        </div>
        <button
          onClick={onOpenProfileIncomplete}
          className="ml-2 px-3 py-1.5 bg-[#E11D48] hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
        >
          Xem chi tiết
        </button>
      </div>

    </div>
  );
};

export const UpCareerJobDetailView = TopDevJobDetailView;
export type UpCareerJobDetailViewProps = TopDevJobDetailViewProps;

