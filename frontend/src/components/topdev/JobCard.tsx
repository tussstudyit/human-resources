'use client';

import React from 'react';
import { Job } from '@/types/topdev';
import { 
  Bookmark, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ArrowUpRight,
  Briefcase
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onSelectJob: (job: Job) => void;
  onQuickApply: (job: Job) => void;
  onSelectSkill: (skill: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onSelectJob,
  onQuickApply,
  onSelectSkill
}) => {
  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/90 p-5 hover:border-red-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top section: Company info & Actions */}
      <div>
        <div className="flex items-start justify-between gap-3">
          {/* Logo & Company Title */}
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Company Avatar / Logo */}
            <div className="w-13 h-13 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="w-full h-full object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to text avatar if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span class="font-bold text-red-600 text-sm">${job.company.name.slice(0, 2).toUpperCase()}</span>`;
                  }
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 truncate">
                <span>{job.company.name}</span>
                {job.company.verified && (
                  <span title="Doanh nghiệp đã xác thực" className="inline-flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  </span>
                )}
                {job.urgent && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-red-600 ml-1">
                    <Flame className="w-3 h-3 fill-red-500 text-red-500" />
                    Tuyển gấp
                  </span>
                )}
                {job.isRealFromBackend && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-1">
                    Trực tiếp
                  </span>
                )}
              </div>

              {/* Job Title */}
              <h3 
                onClick={() => onSelectJob(job)}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors mt-0.5 cursor-pointer leading-snug line-clamp-2"
                title={job.title}
              >
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
              isSaved
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-red-600' : ''}`} />
          </button>
        </div>

        {/* Salary highlight */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-base font-extrabold text-red-600 font-mono tracking-tight">
            {job.salary.display}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{job.workType}</span>
          </div>
        </div>

        {/* Key Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{job.level}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{job.experienceYears}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {job.postedTime}
          </span>
        </div>

        {/* Tech Stack Skills (Clean micro tags) */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <button
              key={skill}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSkill(skill);
              }}
              className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              {skill}
            </button>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-slate-400 self-center px-1 font-medium">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectJob(job)}
          className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Xem chi tiết JD</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onQuickApply(job)}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
        >
          Ứng tuyển ngay
        </button>
      </div>
    </div>
  );
};
