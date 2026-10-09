'use client';

import React from 'react';
import {
  Clock,
  Sparkles,
  Calendar,
  Archive,
  XCircle,
  Video,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { Candidate, InterviewScheduleInfo, TalentPoolInfo } from '@/types/recruitment';

interface RecruitmentKanbanBoardProps {
  candidates: Candidate[];
  onSelectCandidate: (c: Candidate) => void;
}

export default function RecruitmentKanbanBoard({
  candidates,
  onSelectCandidate,
}: RecruitmentKanbanBoardProps) {
  // Helper to extract parsed data safely
  const getParsedData = (candidate: Candidate) => {
    const parsed = candidate.parsedSkillsJson;
    let skills: string[] = [];
    let interviewSchedule: InterviewScheduleInfo | undefined;
    let talentPool: TalentPoolInfo | undefined;

    if (Array.isArray(parsed)) {
      skills = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.skills)) skills = parsed.skills;
      if (parsed.interviewSchedule) interviewSchedule = parsed.interviewSchedule;
      if (parsed.talentPool) talentPool = parsed.talentPool;
    }

    return { skills, interviewSchedule, talentPool };
  };

  // Categorize candidates into 5 columns
  const pendingCol: Candidate[] = [];
  const evaluatedCol: Candidate[] = [];
  const interviewCol: Candidate[] = [];
  const talentPoolCol: Candidate[] = [];
  const rejectedCol: Candidate[] = [];

  candidates.forEach((c) => {
    const { interviewSchedule, talentPool } = getParsedData(c);

    if (c.aiStatus === 'PENDING') {
      pendingCol.push(c);
    } else if (interviewSchedule && interviewSchedule.googleMeetUrl) {
      interviewCol.push(c);
    } else if (talentPool && talentPool.tier) {
      talentPoolCol.push(c);
    } else if (c.aiStatus === 'FAILED') {
      rejectedCol.push(c);
    } else {
      evaluatedCol.push(c);
    }
  });

  const columns = [
    {
      id: 'pending',
      title: 'Chờ AI Thẩm Định',
      icon: Clock,
      count: pendingCol.length,
      items: pendingCol,
    },
    {
      id: 'evaluated',
      title: 'AI Đã Đánh Giá',
      icon: Sparkles,
      count: evaluatedCol.length,
      items: evaluatedCol,
    },
    {
      id: 'interview',
      title: 'Lịch Phỏng Vấn (Meet)',
      icon: Calendar,
      count: interviewCol.length,
      items: interviewCol,
    },
    {
      id: 'talentPool',
      title: 'Kho Nhân Tài (Pool)',
      icon: Archive,
      count: talentPoolCol.length,
      items: talentPoolCol,
    },
    {
      id: 'rejected',
      title: 'Không Phù Hợp',
      icon: XCircle,
      count: rejectedCol.length,
      items: rejectedCol,
    },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    }
    if (score >= 50) {
      return 'bg-[#fefce8] text-[#854d0e] border-[#fef08a]';
    }
    return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 h-full min-h-[600px] select-none font-sans">
      {columns.map((col) => {
        const IconComponent = col.icon;
        return (
          <div
            key={col.id}
            className="flex flex-col bg-white border border-[#ebebeb] rounded-[12px] overflow-hidden shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
          >
            {/* Column Header - Vercel Spec-sheet style */}
            <div className="px-3.5 py-3 border-b border-[#ebebeb] flex items-center justify-between bg-[#fafafa]">
              <div className="flex items-center space-x-2">
                <IconComponent className="w-3.5 h-3.5 text-[#171717]" />
                <span className="font-semibold text-xs text-[#171717] tracking-tight">
                  {col.title}
                </span>
              </div>
              <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-white border border-[#ebebeb] text-[#4d4d4d]">
                {String(col.count).padStart(2, '0')}
              </span>
            </div>

            {/* Column Body / Candidate Cards */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-270px)] bg-[#fafafa]/50">
              {col.items.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-[#8f8f8f] text-[11px] font-mono border border-dashed border-[#ebebeb] rounded-[8px] p-4 text-center space-y-1">
                  <span className="text-[#a1a1a1]">Chưa có ứng viên</span>
                  <span className="text-[10px] text-[#8f8f8f] font-sans">
                    Kéo thả hoặc chuyển giai đoạn để thêm vào đây
                  </span>
                </div>
              ) : (
                col.items.map((candidate) => {
                  const { skills, interviewSchedule, talentPool } = getParsedData(candidate);
                  const score = candidate.matchScore ?? 0;

                  return (
                    <div
                      key={candidate.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectCandidate(candidate)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectCandidate(candidate);
                        }
                      }}
                      className="group p-3 rounded-[8px] bg-white border border-[#ebebeb] hover:border-[#171717]/40 cursor-pointer transition-all shadow-[0px_1px_1px_rgba(0,0,0,0.04)] hover:shadow-[0px_2px_4px_rgba(0,0,0,0.06)] hover-lift focus-ring space-y-2"
                      aria-label={`Xem chi tiết hồ sơ ${candidate.name}, điểm tương thích ${score}%`}
                    >
                      {/* Name & Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#171717] group-hover:text-[#0070f3] transition-colors truncate">
                            {candidate.name}
                          </h4>
                          <p className="text-[11px] font-mono text-[#8f8f8f] truncate flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1 shrink-0 text-[#a1a1a1]" aria-hidden="true" />
                            <span className="truncate">{candidate.email}</span>
                          </p>
                        </div>

                        {candidate.aiStatus === 'PENDING' ? (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-medium border bg-[#fffbeb] text-[#b45309] border-[#fde68a] shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                            <span>Đang chấm...</span>
                          </span>
                        ) : candidate.aiStatus === 'DONE' ? (
                          <span
                            className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-medium border shrink-0 ${getScoreBadge(
                              score
                            )}`}
                          >
                            {score}%
                          </span>
                        ) : null}
                      </div>

                      {/* Google Meet Info Badge */}
                      {interviewSchedule?.googleMeetUrl && (
                        <div className="p-2 rounded-[6px] bg-[#d3e5ff]/40 border border-[#0070f3]/20 text-[11px] text-[#0761d1] space-y-0.5">
                          <div className="flex items-center space-x-1.5 font-medium">
                            <Video className="w-3 h-3 text-[#0070f3] shrink-0" />
                            <span className="truncate">Google Meet Phỏng Vấn</span>
                          </div>
                          {interviewSchedule.time && (
                            <div className="text-[10px] font-mono text-[#0761d1]/80 truncate">
                              {interviewSchedule.time}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Talent Pool Tier Badge */}
                      {talentPool && (
                        <div className="px-2 py-1 rounded-[6px] bg-[#f8f8f8] border border-[#ebebeb] text-[10px] font-mono text-[#4d4d4d] flex items-center justify-between">
                          <span className="truncate">{talentPool.tier || 'POOL'}</span>
                          <span className="text-[#8f8f8f]">Lưu trữ</span>
                        </div>
                      )}

                      {/* Skills Preview */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {skills.slice(0, 3).map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-[4px] bg-[#f2f2f2] border border-[#ebebeb] text-[10px] font-mono text-[#4d4d4d]"
                            >
                              {sk}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="px-1 py-0.5 rounded-[4px] bg-white border border-[#ebebeb] text-[10px] font-mono text-[#8f8f8f]">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#ebebeb] text-[10px] text-[#8f8f8f] font-mono">
                        <span>
                          {candidate.experienceYears !== null &&
                          candidate.experienceYears !== undefined
                            ? `${candidate.experienceYears}Y EXP`
                            : 'N/A EXP'}
                        </span>
                        <span className="group-hover:text-[#171717] flex items-center transition-colors">
                          Chi tiết <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
