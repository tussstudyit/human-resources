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
  Briefcase,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileCheck,
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
  const visibleSkills = allSkills.slice(0, 5);
  const remainingCount = allSkills.length - visibleSkills.length;
  const postedTime = formatRelativeTime(job.createdAt);

  const handleApplyClick = () => {
    onApply(job, applyButtonRef);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Phần trên của Card */}
      <div className="p-6 sm:p-7 space-y-4">
        {/* Badges: Department, Work Type, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Building2 className="h-3 w-3" />
              <span>{department}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              <Briefcase className="h-3 w-3" />
              <span>Toàn thời gian</span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Đang mở tuyển
          </span>
        </div>

        {/* Tiêu đề công việc */}
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Đăng {postedTime}</span>
          </p>
        </div>

        {/* Mô tả tóm tắt hoặc toàn bộ */}
        <div>
          <p
            className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${
              isExpanded ? '' : 'line-clamp-3'
            }`}
          >
            {job.description}
          </p>
        </div>

        {/* Danh sách Tag kỹ năng */}
        {allSkills.length > 0 && (
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition"
                >
                  {skill}
                </span>
              ))}

              {remainingCount > 0 && (
                <span
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                  title="Nhấn để xem đầy đủ kỹ năng"
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết mở rộng (nếu được bấm 'Xem chi tiết') */}
        {isExpanded && (
          <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Yêu cầu chi tiết công việc:</span>
              </h4>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pl-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {job.requirements}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Card: Nút hành động */}
      <div className="p-6 pt-0 sm:p-7 sm:pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 py-2 sm:py-0 transition"
        >
          <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <button
          ref={applyButtonRef}
          type="button"
          onClick={handleApplyClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition duration-150"
        >
          <span>Ứng tuyển ngay</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
