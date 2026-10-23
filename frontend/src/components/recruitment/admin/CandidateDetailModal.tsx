'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Calendar,
  Video,
  ExternalLink,
  Download,
  RefreshCw,
  Award,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { Candidate, InterviewScheduleInfo, TalentPoolInfo } from '@/types/recruitment';
import {
  fetchCandidateCvBlob,
  reEvaluateCandidate,
  scheduleCandidateInterview,
  archiveCandidateTalentPool,
} from '@/lib/api/recruitment';
import { useToastStore } from '@/store/useToastStore';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onCandidateUpdated?: (updated: Candidate) => void;
}

export default function CandidateDetailModal({
  candidate,
  onClose,
  onCandidateUpdated,
}: CandidateDetailModalProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [schedulingMeet, setSchedulingMeet] = useState(false);
  const [archivingPool, setArchivingPool] = useState(false);
  const { showToast } = useToastStore();

  // Load PDF Blob when candidate changes
  useEffect(() => {
    if (!candidate) return;

    let active = true;
    let createdUrl: string | null = null;

    setLoadingPdf(true);
    setPdfError(null);

    fetchCandidateCvBlob(candidate.id)
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdUrl);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Lỗi tải CV PDF:', err);
        setPdfError('Không thể tải bản xem trước CV. Vui lòng thử lại sau.');
      })
      .finally(() => {
        if (active) setLoadingPdf(false);
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [candidate?.id]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  // Extract parsedSkillsJson data safely
  const parsed = candidate.parsedSkillsJson;
  let skillsList: string[] = [];
  let coreSkillsList: string[] = [];
  let secondarySkillsList: string[] = [];
  let githubUrl: string | null = null;
  let keywordStuffing = false;
  let systemScaleScore: number | null = null;
  let interviewKit: any[] = [];
  let careerAdvice: string | null = null;
  let talentPoolTag: string | null = null;
  let interviewSchedule: InterviewScheduleInfo | undefined;
  let talentPool: TalentPoolInfo | undefined;

  if (Array.isArray(parsed)) {
    skillsList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.skills)) {
      skillsList = parsed.skills;
    }
    if (Array.isArray(parsed.coreSkills)) {
      coreSkillsList = parsed.coreSkills;
    }
    if (Array.isArray(parsed.secondarySkills)) {
      secondarySkillsList = parsed.secondarySkills;
    }
    if (parsed.githubUrl) {
      githubUrl = parsed.githubUrl;
    }
    if (parsed.keywordStuffingFlag) {
      keywordStuffing = true;
    }
    if (parsed.systemScaleScore !== undefined && parsed.systemScaleScore !== null) {
      systemScaleScore = parsed.systemScaleScore;
    }
    if (Array.isArray(parsed.interviewKit)) {
      interviewKit = parsed.interviewKit;
    }
    if (parsed.careerAdvice) {
      careerAdvice = parsed.careerAdvice;
    }
    if (parsed.interviewSchedule) {
      interviewSchedule = parsed.interviewSchedule;
    }
    if (parsed.talentPool) {
      talentPool = parsed.talentPool;
      if (parsed.talentPool.tag) {
        talentPoolTag = parsed.talentPool.tag;
      }
    }
  }

  const score = candidate.matchScore ?? 0;
  const isPending = candidate.aiStatus === 'PENDING';

  const getScoreBadge = (sc: number) => {
    if (sc >= 80) return 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]';
    if (sc >= 50) return 'bg-[#fefce8] text-[#854d0e] border-[#fef08a]';
    return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]';
  };

  const handleReEvaluate = async () => {
    try {
      setReEvaluating(true);
      const res = await reEvaluateCandidate(candidate.id);
      showToast({
        type: 'success',
        title: 'Đã gửi yêu cầu thẩm định',
        message: res.message || 'AI Agent đang tiến hành chấm lại hồ sơ...',
      });
      if (onCandidateUpdated) {
        onCandidateUpdated({ ...candidate, aiStatus: 'PENDING' });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Thao tác thất bại',
        message: 'Không thể kích hoạt AI chấm lại.',
      });
    } finally {
      setReEvaluating(false);
    }
  };

  const handleScheduleMeet = async () => {
    try {
      setSchedulingMeet(true);
      const res = await scheduleCandidateInterview(candidate.id, 'ONLINE');
      showToast({
        type: 'success',
        title: 'Đã kích hoạt n8n WF_05',
        message: res.message || 'Đang tạo sự kiện Google Calendar & link Meet...',
      });
      if (res?.updatedCandidate && onCandidateUpdated) {
        onCandidateUpdated(res.updatedCandidate);
      } else if (res?.schedule && onCandidateUpdated) {
        onCandidateUpdated({
          ...candidate,
          parsedSkillsJson: {
            ...(typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { skills: skillsList }),
            interviewSchedule: {
              status: 'SCHEDULED',
              type: 'ONLINE',
              time: res.schedule.time || '09:30 - 10:30 (Giờ Việt Nam)',
              location: res.schedule.location,
              googleMeetUrl: res.schedule.googleMeetUrl,
              isRealGoogleMeet: res.schedule.isRealGoogleMeet ?? true,
              googleCalendarEventId: res.schedule.googleCalendarEventId,
              googleCalendarHtmlLink: res.schedule.googleCalendarHtmlLink,
              interviewer: res.interviewerPanel,
            },
          },
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Thao tác thất bại',
        message: err.message || 'Không thể kết nối đến n8n Interview Scheduler.',
      });
    } finally {
      setSchedulingMeet(false);
    }
  };

  const handleArchivePool = async () => {
    try {
      setArchivingPool(true);
      const res = await archiveCandidateTalentPool(candidate.id);
      showToast({
        type: 'success',
        title: 'Đã kích hoạt n8n WF_06',
        message: res.message || 'Đã phân bổ hồ sơ vào Kho Nhân Tài & gửi email phản hồi.',
      });
      if (res?.updatedCandidate && onCandidateUpdated) {
        onCandidateUpdated(res.updatedCandidate);
      } else if (onCandidateUpdated) {
        onCandidateUpdated({
          ...candidate,
          parsedSkillsJson: {
            ...(typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { skills: skillsList }),
            talentPool: {
              tier: res?.tier || 'PRIORITY_TALENT_POOL',
              status: 'ARCHIVED',
              emailSent: true,
              archivedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Thao tác thất bại',
        message: err.message || 'Không thể kết nối đến n8n Talent Pool Retention.',
      });
    } finally {
      setArchivingPool(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `CV_${candidate.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyMeetUrl = (url: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Đã sao chép liên kết',
        message: 'Đã sao chép đường dẫn Google Meet vào bộ nhớ tạm.',
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-[#ebebeb] rounded-[12px] w-full max-w-7xl h-[92vh] flex flex-col shadow-[0px_4px_16px_rgba(0,0,0,0.08),0px_16px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs">
              {candidate.name[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  {candidate.name}
                </h2>
                {isPending ? (
                  <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#fefce8] text-[#854d0e] border border-[#fef08a] flex items-center">
                    <Clock className="w-2.5 h-2.5 mr-1 animate-spin" /> PENDING_EVALUATION
                  </span>
                ) : (
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${getScoreBadge(
                      score
                    )}`}
                  >
                    MATCH_SCORE: {score}%
                  </span>
                )}
                {keywordStuffing && (
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-red-100 text-red-800 border border-red-200" title="AI Screener phát hiện mật độ từ khóa kỹ thuật bất thường so với nội dung thực tế">
                    ⚠️ KEYWORD_STUFFING
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-1 text-slate-400" aria-hidden="true" /> {candidate.email}
                </span>
                {candidate.phone && (
                  <span>• {candidate.phone}</span>
                )}
                {candidate.experienceYears !== null &&
                  candidate.experienceYears !== undefined && (
                    <span className="text-slate-900 font-semibold">
                      • {candidate.experienceYears}Y EXP
                    </span>
                  )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                    title="Mở hồ sơ GitHub của ứng viên"
                  >
                    • GitHub
                  </a>
                )}
                {systemScaleScore !== null && (
                  <span className="text-purple-700 font-semibold" title="Điểm thẩm định năng lực xử lý tải hệ thống (System Scale)">
                    • Scale: {systemScaleScore}/100
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleScheduleMeet}
              disabled={schedulingMeet || isPending}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs cursor-pointer focus-ring"
              title="Kích hoạt n8n WF_05: Xếp lịch Google Meet và gửi thư mời cho ứng viên"
            >
              <Video className={`w-3.5 h-3.5 ${schedulingMeet ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{schedulingMeet ? 'Đang tạo Meet...' : 'Lên lịch Meet'}</span>
            </button>

            <button
              onClick={handleArchivePool}
              disabled={archivingPool || isPending}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors disabled:opacity-50 shadow-xs cursor-pointer focus-ring"
              title="Kích hoạt n8n WF_06: Lưu kho nhân tài và gửi email phản hồi"
            >
              <Archive className={`w-3.5 h-3.5 ${archivingPool ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{archivingPool ? 'Đang lưu...' : 'Lưu Talent Pool'}</span>
            </button>

            <button
              onClick={handleReEvaluate}
              disabled={reEvaluating || isPending}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors disabled:opacity-50 shadow-xs cursor-pointer focus-ring"
              title="Gửi lại CV cho Gemini AI phân tích (n8n WF_04)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reEvaluating || isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{isPending ? 'Đang chấm...' : 'Chấm lại AI'}</span>
            </button>

            {pdfBlobUrl && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-white hover:bg-[#fafafa] text-[#171717] border border-[#ebebeb] text-xs font-medium transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] cursor-pointer focus-ring"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tải CV</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#8f8f8f] hover:text-[#171717] hover:bg-[#fafafa] transition-colors cursor-pointer focus-ring"
              aria-label="Đóng cửa sổ chi tiết (Esc)"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Modal Split View Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Inline PDF Viewer */}
          <div className="w-1/2 border-r border-[#ebebeb] flex flex-col bg-[#fafafa]">
            <div className="px-4 py-2 bg-white border-b border-[#ebebeb] flex items-center justify-between text-xs text-[#8f8f8f] font-mono">
              <span className="flex items-center font-medium text-[#171717]">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-[#0070f3]" />
                // CV_DOCUMENT_PREVIEW.pdf
              </span>
              <span className="text-[10px] truncate max-w-xs">{candidate.cvUrl}</span>
            </div>

            <div className="flex-1 p-3 relative flex items-center justify-center">
              {loadingPdf && (
                <div className="flex flex-col items-center space-y-2 text-[#8f8f8f] text-xs font-mono">
                  <div className="h-5 w-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin"></div>
                  <span>STREAMING_PDF_PAYLOAD...</span>
                </div>
              )}

              {pdfError && !loadingPdf && (
                <div className="text-center p-6 max-w-sm">
                  <AlertCircle className="w-6 h-6 text-[#ee0000] mx-auto mb-2" />
                  <p className="text-xs text-[#ee0000] mb-3">{pdfError}</p>
                </div>
              )}

              {pdfBlobUrl && !loadingPdf && (
                <iframe
                  src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                  title="Candidate CV Preview"
                  className="w-full h-full rounded-[8px] border border-[#ebebeb] bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
                />
              )}
            </div>
          </div>

          {/* Right Column: AI Analysis & Insights */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-5 bg-white">
            {/* AI Match Score Summary Card */}
            <div className="border border-[#ebebeb] rounded-[8px] p-4 bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider">
                    // GEMINI AI EVALUATION
                  </div>
                  <h3 className="text-xs font-semibold text-[#171717] mt-0.5">
                    Độ Tương Thích Tuyển Dụng
                  </h3>
                </div>

                {isPending ? (
                  <div className="px-3 py-1.5 rounded-[6px] border border-[#fde68a] bg-[#fffbeb] text-[#b45309] font-mono font-medium text-xs flex items-center space-x-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#d97706]" />
                    <span>AI_EVALUATING</span>
                  </div>
                ) : (
                  <div
                    className={`px-3 py-1.5 rounded-[6px] border font-mono font-bold text-sm ${getScoreBadge(
                      score
                    )}`}
                  >
                    {score}%
                  </div>
                )}
              </div>

              {isPending && (
                <div className="p-2.5 rounded-[6px] bg-[#fffbeb] border border-[#fde68a] text-[#854d0e] flex items-center space-x-2 text-xs font-sans">
                  <Sparkles className="w-4 h-4 text-[#d97706] shrink-0 animate-spin" />
                  <span>Gemini AI (n8n WF_04) đang thẩm định lại hồ sơ... Kết quả sẽ tự động hiển thị sau vài giây.</span>
                </div>
              )}

              {/* Summary text */}
              <div className="p-3 rounded-[6px] bg-white border border-[#ebebeb] text-[#4d4d4d] text-xs leading-relaxed">
                {candidate.summary && !isPending ? (
                  <p>{candidate.summary}</p>
                ) : isPending ? (
                  <p className="text-[#854d0e] italic font-mono text-[11px] flex items-center space-x-1.5">
                    <span>// AI Agent đang trích xuất kỹ năng & tính toán độ tương thích...</span>
                  </p>
                ) : (
                  <p className="text-[#8f8f8f] italic font-mono text-[11px]">
                    // Chưa có bản tóm tắt từ AI.
                  </p>
                )}
              </div>
            </div>

            {/* Google Meet & Interview Schedule Card */}
            {interviewSchedule && (
              <div className="border border-[#0070f3]/30 bg-[#d3e5ff]/20 rounded-[8px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] font-semibold text-[#0070f3] uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>// INTERVIEW_SCHEDULED</span>
                  </div>
                  <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#0070f3] text-white">
                    CONFIRMED
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#171717]">
                  {interviewSchedule.time && (
                    <div className="flex items-center space-x-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#0070f3] shrink-0" />
                      <span>{interviewSchedule.time}</span>
                    </div>
                  )}

                  {interviewSchedule.interviewer && (
                    <div className="p-2.5 bg-white rounded-[6px] border border-[#ebebeb] text-[11px] space-y-0.5">
                      <div className="font-mono text-[10px] text-[#8f8f8f] uppercase">Người phỏng vấn:</div>
                      <div className="font-semibold text-[#171717]">
                        {interviewSchedule.interviewer.name}{' '}
                        <span className="text-[#0070f3]">({interviewSchedule.interviewer.role})</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#8f8f8f]">
                        {interviewSchedule.interviewer.email}
                      </div>
                    </div>
                  )}

                  {/* Google Meet CTA Button */}
                  {interviewSchedule.googleMeetUrl && (
                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href={interviewSchedule.googleMeetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-[#0070f3] hover:bg-[#0761d1] text-white font-medium text-xs transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Vào Google Meet</span>
                        <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
                      </a>

                      <button
                        onClick={() => handleCopyMeetUrl(interviewSchedule!.googleMeetUrl!)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-white hover:bg-[#fafafa] text-[#171717] font-medium text-xs border border-[#ebebeb] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring cursor-pointer"
                        title="Sao chép link Google Meet"
                      >
                        <span>Sao chép link</span>
                      </button>

                      {interviewSchedule.googleCalendarHtmlLink && (
                        <a
                          href={interviewSchedule.googleCalendarHtmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-white hover:bg-[#fafafa] text-[#171717] font-medium text-xs border border-[#ebebeb] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] focus-ring cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#8f8f8f]" aria-hidden="true" />
                          <span>Google Calendar</span>
                          <ExternalLink className="w-3 h-3 text-[#8f8f8f]" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Technical Interview Kit Card */}
            {interviewKit.length > 0 && (
              <div className="border border-blue-200 bg-blue-50/30 rounded-[8px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] font-semibold text-blue-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>// AI_INTERVIEW_KIT (GỢI Ý HỘI ĐỒNG PHỎNG VẤN)</span>
                  </div>
                  <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-blue-600 text-white">
                    {interviewKit.length} CÂU HỎI TÌNH HUỐNG
                  </span>
                </div>

                <div className="space-y-2.5">
                  {interviewKit.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-[6px] border border-blue-100 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {idx + 1}. {item.question}
                      </div>
                      {item.targetSkill && (
                        <div className="text-[11px] text-blue-700 font-mono">
                          🎯 Trọng tâm: {item.targetSkill}
                        </div>
                      )}
                      {item.whyAsk && (
                        <div className="text-[11px] text-slate-600 leading-relaxed">
                          🔍 <span className="font-medium">Lý do hỏi (CV Insight):</span> {item.whyAsk}
                        </div>
                      )}
                      {item.goodAnswerSignals && (
                        <div className="text-[11px] text-emerald-700 leading-relaxed bg-emerald-50/60 p-1.5 rounded-[4px]">
                          ✅ <span className="font-medium">Dấu hiệu trả lời tốt:</span> {item.goodAnswerSignals}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Talent Pool Card */}
            {talentPool && (
              <div className="border border-[#ebebeb] bg-[#fafafa] rounded-[8px] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider flex items-center space-x-1.5">
                    <Archive className="w-3.5 h-3.5 text-[#171717]" />
                    <span>// TALENT_POOL_ARCHIVE</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {talentPoolTag && (
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 border border-blue-200">
                        {talentPoolTag}
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-white border border-[#ebebeb] text-[#171717]">
                      {talentPool.tier || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#4d4d4d]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8f8f8f]">Kịch bản:</span>
                    <span className="font-medium text-[#171717]">
                      {talentPool.scenario === 'TOP_TALENT'
                        ? 'Ứng viên tiềm năng (Top Talent)'
                        : talentPool.scenario === 'POST_INTERVIEW'
                        ? 'Lưu trữ sau phỏng vấn'
                        : 'Lưu trữ vòng hồ sơ'}
                    </span>
                  </div>
                  {talentPool.archivedAt && (
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#8f8f8f]">Ngày lưu trữ:</span>
                      <span>{new Date(talentPool.archivedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {talentPool.emailSent && (
                    <div className="flex items-center space-x-1 text-[#166534] pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã gửi email thông báo từ chối tinh tế đến ứng viên</span>
                    </div>
                  )}
                  {careerAdvice && (
                    <div className="p-2.5 rounded-[6px] bg-white border border-[#ebebeb] text-[11px] text-slate-700 leading-relaxed mt-2">
                      <p className="font-semibold text-slate-900 mb-1">💡 Góp ý phát triển chuyên môn:</p>
                      <p>{careerAdvice}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Skills Section */}
            <div className="border border-[#ebebeb] rounded-[8px] p-4 space-y-3">
              <div className="font-mono text-[10px] font-medium text-[#8f8f8f] uppercase tracking-wider flex items-center justify-between">
                <span>// SKILLS_EXTRACTED ({coreSkillsList.length + secondarySkillsList.length || skillsList.length})</span>
              </div>

              {coreSkillsList.length > 0 ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] font-mono text-blue-700 font-semibold uppercase mb-1">
                      Core Skills (Kỹ năng cốt lõi):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coreSkillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-[4px] font-mono text-[11px] bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {secondarySkillsList.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] font-mono text-slate-500 font-medium uppercase mb-1">
                        Secondary Skills:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {secondarySkillsList.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-[4px] font-mono text-[11px] bg-[#f2f2f2] text-[#4d4d4d] border border-[#ebebeb]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-[4px] font-mono text-[11px] bg-[#f2f2f2] text-[#171717] border border-[#ebebeb]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8f8f8f] italic font-mono text-[11px]">
                  // Không tìm thấy dữ liệu kỹ năng bóc tách.
                </p>
              )}
            </div>

            {/* Candidate Metadata Footer */}
            <div className="font-mono text-[10px] text-[#8f8f8f] space-y-0.5 pt-2 border-t border-[#ebebeb]">
              <div>ID: {candidate.id}</div>
              <div>
                CREATED_AT: {new Date(candidate.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
