'use client';

import React, { useState, useRef } from 'react';
import { JobPost } from '@/types/recruitment';
import {
  parseSkills,
  inferDepartment,
  formatRelativeTime,
} from '@/lib/recruitment-utils';
import {
  Building2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JobCardProps {
  job: JobPost;
  onApply: (job: JobPost, triggerRef: React.RefObject<HTMLButtonElement | null>) => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const applyButtonRef = useRef<HTMLButtonElement>(null);

  const department = job.department || inferDepartment(job.title);
  const allSkills = parseSkills(job.requirements);
  const visibleSkills = allSkills.slice(0, 4);
  const remainingCount = allSkills.length - visibleSkills.length;
  const postedTime = formatRelativeTime(job.createdAt);

  const handleApplyClick = () => {
    onApply(job, applyButtonRef);
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 ease-out flex flex-col justify-between p-5 sm:p-6 group h-full">
      {/* Phần nội dung phía trên của Card */}
      <div className="space-y-3.5">
        {/* Hàng 1: Phòng ban & Thời gian đăng */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] font-semibold bg-slate-100 text-[#475569] border border-slate-200/60">
            <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
            <span>{department}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] font-medium shrink-0">
            <Clock className="h-3 w-3" />
            <span>{postedTime}</span>
          </span>
        </div>

        {/* Hàng 2: Tên vị trí tuyển dụng (tối đa 2 dòng) */}
        <div>
          <h3
            className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight line-clamp-2 min-h-[3rem] group-hover:text-slate-900 transition-colors"
            title={job.title}
          >
            {job.title}
          </h3>
        </div>

        {/* Mô tả tóm tắt hoặc toàn bộ */}
        {job.description && (
          <p
            className={`text-xs text-[#475569] leading-relaxed ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {job.description}
          </p>
        )}

        {/* Danh sách Kỹ năng (Requirements được parse thành skill tags) */}
        {allSkills.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-[8px] text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}

              {remainingCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-[8px] text-[11px] font-semibold bg-slate-100 text-[#475569] cursor-pointer hover:bg-slate-200 transition"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title="Xem thêm kỹ năng"
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết mở rộng nếu người dùng xem thêm */}
        {isExpanded && job.requirements && (
          <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#475569] space-y-1.5 animate-in fade-in duration-150">
            <p className="font-semibold text-[#0F172A]">Yêu cầu chi tiết:</p>
            <p className="whitespace-pre-line bg-[#F8FAFC] p-2.5 rounded-[8px] border border-[#E2E8F0] text-[11px] leading-relaxed">
              {job.requirements}
            </p>
          </div>
        )}
      </div>

      {/* CTA nằm cuối card bằng flex layout */}
      <div className="pt-5 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] py-1 transition"
        >
          <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          ref={applyButtonRef}
          type="button"
          onClick={handleApplyClick}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#171717] hover:bg-[#333333] active:bg-black text-white text-xs sm:text-sm font-semibold rounded-[8px] shadow-xs hover:shadow-sm transition-all duration-150 ease-out focus-ring hover-lift shrink-0 cursor-pointer"
        >
          <span>Ứng tuyển ngay</span>
          <ArrowRight className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
