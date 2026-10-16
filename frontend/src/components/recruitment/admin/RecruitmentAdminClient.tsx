'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  RefreshCw,
  Edit,
  SlidersHorizontal,
  ExternalLink,
  Download,
  Filter,
  Globe,
} from 'lucide-react';
import { JobPost, Candidate } from '@/types/recruitment';
import {
  getAdminJobs,
  getJobCandidates,
  updateJob,
} from '@/lib/api/recruitment';
import RecruitmentKanbanBoard from './RecruitmentKanbanBoard';
import CandidateDetailModal from './CandidateDetailModal';
import JobManageModal from './JobManageModal';
import { useToastStore } from '@/store/useToastStore';

export default function RecruitmentAdminClient() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'TOP' | 'MEDIUM' | 'LOW'>('ALL');
  const [expFilter, setExpFilter] = useState<'ALL' | 'JUNIOR' | 'MIDDLE' | 'SENIOR'>('ALL');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);

  const { showToast } = useToastStore();

  // Load Admin Jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const data = await getAdminJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách việc làm:', err);
      showToast({
        type: 'error',
        title: 'Lỗi nạp dữ liệu',
        message: 'Không thể tải danh sách việc làm quản trị.',
      });
    } finally {
      setLoadingJobs(false);
    }
  }, [showToast, selectedJobId]);

  // Load Candidates for Selected Job
  const fetchCandidates = useCallback(async (jobId: string, silent = false) => {
    if (!jobId) {
      setCandidates([]);
      return;
    }
    try {
      if (!silent) {
        setLoadingCandidates(true);
      }
      const data = await getJobCandidates(jobId);
      setCandidates(data);
      // Cập nhật cả modal chi tiết nếu đang mở ứng viên đó
      setSelectedCandidate((curr) => {
        if (!curr) return null;
        const found = data.find((c) => c.id === curr.id);
        return found || curr;
      });
    } catch (err: any) {
      if (!silent) {
        console.error('Lỗi tải danh sách ứng viên:', err);
        showToast({
          type: 'error',
          title: 'Lỗi nạp ứng viên',
          message: 'Không thể tải danh sách ứng viên của vị trí này.',
        });
      }
    } finally {
      if (!silent) {
        setLoadingCandidates(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidates(selectedJobId);
    }
  }, [selectedJobId, fetchCandidates]);

  // Auto-polling theo thời gian thực khi có hồ sơ đang ở trạng thái PENDING (AI đang chấm)
  useEffect(() => {
    const hasPending = candidates.some((c) => c.aiStatus === 'PENDING');
    if (!hasPending || !selectedJobId) return;

    let pollCount = 0;
    const maxPolls = 24; // 24 * 2.5s = 60s tối đa

    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(interval);
        return;
      }
      await fetchCandidates(selectedJobId, true);
    }, 2500);

    return () => clearInterval(interval);
  }, [candidates, selectedJobId, fetchCandidates]);

  const currentJob = jobs.find((j) => j.id === selectedJobId);

  // Toggle Job status OPEN / CLOSED
  const handleToggleJobStatus = async () => {
    if (!currentJob) return;
    const nextStatus = currentJob.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const updated = await updateJob(currentJob.id, { status: nextStatus });
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      showToast({
        type: 'info',
        title: 'Cập nhật trạng thái',
        message: `Đã đổi trạng thái vị trí sang ${nextStatus}`,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: 'Không thể thay đổi trạng thái tuyển dụng.',
      });
    }
  };

  // Filter candidates by search query, AI score and experience
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter((c) => {
      // 1. Text Search
      if (q) {
        const nameMatch = c.name.toLowerCase().includes(q);
        const emailMatch = c.email.toLowerCase().includes(q);
        const phoneMatch = c.phone?.toLowerCase().includes(q);
        let skillsMatch = false;

        const parsed = c.parsedSkillsJson;
        if (Array.isArray(parsed)) {
          skillsMatch = parsed.some((s) => s.toLowerCase().includes(q));
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.skills)) {
          skillsMatch = parsed.skills.some((s) => s.toLowerCase().includes(q));
        }

        if (!nameMatch && !emailMatch && !phoneMatch && !skillsMatch) {
          return false;
        }
      }

      // 2. Score Filter
      const score = c.matchScore ?? 0;
      if (scoreFilter === 'TOP' && score < 80) return false;
      if (scoreFilter === 'MEDIUM' && (score < 50 || score >= 80)) return false;
      if (scoreFilter === 'LOW' && score >= 50) return false;

      // 3. Experience Filter
      const exp = c.experienceYears ?? 0;
      if (expFilter === 'JUNIOR' && exp > 2) return false;
      if (expFilter === 'MIDDLE' && (exp < 2 || exp > 5)) return false;
      if (expFilter === 'SENIOR' && exp < 5) return false;

      return true;
    });
  }, [candidates, searchQuery, scoreFilter, expFilter]);

  // Xuất dữ liệu ứng viên ra định dạng CSV chuẩn UTF-8 BOM cho Excel
  const handleExportCsv = () => {
    if (!currentJob || filteredCandidates.length === 0) {
      showToast({
        type: 'warning',
        title: 'Chưa có dữ liệu',
        message: 'Không có ứng viên nào phù hợp với bộ lọc hiện tại để xuất file.',
      });
      return;
    }

    const headers = [
      'STT',
      'Họ và tên',
      'Email',
      'Số điện thoại',
      'Vị trí',
      'Điểm AI Match (%)',
      'Trạng thái AI',
      'Số năm kinh nghiệm',
      'Kỹ năng',
      'Ngày nộp',
    ];

    const rows = filteredCandidates.map((c, idx) => {
      let skills = '';
      const parsed = c.parsedSkillsJson;
      if (Array.isArray(parsed)) skills = parsed.join('; ');
      else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.skills)) {
        skills = parsed.skills.join('; ');
      }

      return [
        idx + 1,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone || ''}"`,
        `"${currentJob.title.replace(/"/g, '""')}"`,
        c.matchScore ?? 0,
        c.aiStatus,
        c.experienceYears !== null && c.experienceYears !== undefined ? c.experienceYears : '',
        `"${skills.replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toLocaleDateString('vi-VN')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ung_vien_${currentJob.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Xuất file thành công',
      message: `Đã xuất ${filteredCandidates.length} hồ sơ ứng viên ra file CSV.`,
    });
  };

  const handleCandidateUpdated = (updated: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setSelectedCandidate(updated);
  };

  const statsSummary = useMemo(() => {
    const total = candidates.length;
    const evaluated = candidates.filter((c) => c.aiStatus === 'DONE').length;
    const interview = candidates.filter((c) => {
      const parsed = c.parsedSkillsJson;
      return (
        parsed &&
        !Array.isArray(parsed) &&
        typeof parsed === 'object' &&
        parsed.interviewSchedule?.googleMeetUrl
      );
    }).length;
    const talentPool = candidates.filter((c) => {
      const parsed = c.parsedSkillsJson;
      return (
        parsed &&
        !Array.isArray(parsed) &&
        typeof parsed === 'object' &&
        parsed.talentPool?.tier
      );
    }).length;
    const avgScore =
      total > 0
        ? Math.round(
            candidates.reduce((acc, c) => acc + (c.matchScore ?? 0), 0) / total
          )
        : 0;

    return { total, evaluated, interview, talentPool, avgScore };
  }, [candidates]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa] font-sans">
      {/* Top Banner Header - Vercel Spec */}
      <div className="bg-white border-b border-[#ebebeb] px-6 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#8f8f8f] uppercase tracking-wider mb-1">
              <span>QUY TRÌNH TUYỂN DỤNG ATS</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-0.5 animate-pulse" />
                N8N ENGINE CONNECTED
              </span>
              {candidates.some((c) => c.aiStatus === 'PENDING') && (
                <span className="inline-flex items-center gap-1 text-[#0070f3] bg-[#d3e5ff] px-1.5 py-0.5 rounded border border-[#0070f3]/20 font-semibold animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  ĐANG CHẤM ĐIỂM AI...
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-[#171717] tracking-tight">
              Quản Trị Tuyển Dụng & Phân Tích Hồ Sơ AI
            </h1>
            <p className="text-xs text-[#4d4d4d] mt-0.5">
              Theo dõi tiến độ chấm điểm CV từ Gemini AI, lịch họp Google Meet và kho hồ sơ lưu trữ
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={handleExportCsv}
              disabled={filteredCandidates.length === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors shadow-xs disabled:opacity-50 cursor-pointer focus-ring"
              title="Xuất danh sách ứng viên của vị trí hiện tại ra file CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV ({filteredCandidates.length})</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-red-50/70 text-slate-700 hover:text-red-600 font-medium text-xs border border-slate-200 transition-colors shadow-xs focus-ring"
              title="Xem Cổng Việc Làm UpCareer công khai"
            >
              <Globe className="w-3.5 h-3.5 text-red-600" />
              <span>Xem Cổng Việc Làm</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={() => {
                setEditingJob(null);
                setIsJobModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-xs focus-ring cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng Tin Tuyển Dụng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Job Selector, Segmented Pills, Status, Search */}
      <div className="bg-white/95 border-b border-slate-200 px-6 md:px-8 py-3 backdrop-blur-md sticky top-0 z-20 space-y-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Job Post Selector */}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <div className="flex items-center space-x-1.5 shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-red-600" />
              <span className="font-mono text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Vị trí:
              </span>
            </div>

            {loadingJobs ? (
              <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse"></div>
            ) : jobs.length === 0 ? (
              <span className="text-xs text-slate-400">Chưa có tin tuyển dụng nào</span>
            ) : (
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                {/* Segmented Job Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-0.5">
                  {jobs.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-xs font-semibold'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{job.title}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                            isSelected
                              ? 'bg-white/25 text-white font-bold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {job._count?.candidates ?? 0} CV
                        </span>
                      </button>
                    );
                  })}
                </div>

                {currentJob && (
                  <button
                    onClick={() => {
                      setEditingJob(currentJob);
                      setIsJobModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                    title="Chỉnh sửa tin tuyển dụng"
                    aria-label="Chỉnh sửa tin tuyển dụng"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentJob && (
                  <button
                    onClick={handleToggleJobStatus}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors shadow-xs cursor-pointer ${
                      currentJob.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {currentJob.status === 'OPEN' ? '● ĐANG MỞ' : '○ ĐÃ ĐÓNG'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search Candidate Input & Refresh */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ứng viên, email, kỹ năng..."
                className="pl-8 pr-7 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors w-52 md:w-64 shadow-xs"
                aria-label="Tìm kiếm ứng viên"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <span className="text-xs">×</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedJobId) fetchCandidates(selectedJobId);
              }}
              disabled={loadingCandidates}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs transition-colors disabled:opacity-50 shadow-xs cursor-pointer focus-ring"
              title="Làm mới danh sách ứng viên"
              aria-label="Làm mới danh sách ứng viên"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingCandidates ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Multi-dimensional Filter Bar (Score & Experience) */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-red-500" />
              ĐIỂM AI:
            </span>
            <button
              onClick={() => setScoreFilter('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                scoreFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setScoreFilter(scoreFilter === 'TOP' ? 'ALL' : 'TOP')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                scoreFilter === 'TOP'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              ⭐ Xuất sắc (≥ 80%)
            </button>
            <button
              onClick={() => setScoreFilter(scoreFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                scoreFilter === 'MEDIUM'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Tiềm năng (50-79%)
            </button>
            <button
              onClick={() => setScoreFilter(scoreFilter === 'LOW' ? 'ALL' : 'LOW')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                scoreFilter === 'LOW'
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              &lt; 50%
            </button>

            <span className="text-slate-300 mx-1">|</span>

            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
              KINH NGHIỆM:
            </span>
            <button
              onClick={() => setExpFilter(expFilter === 'JUNIOR' ? 'ALL' : 'JUNIOR')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                expFilter === 'JUNIOR'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Junior (&lt; 2Y)
            </button>
            <button
              onClick={() => setExpFilter(expFilter === 'MIDDLE' ? 'ALL' : 'MIDDLE')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                expFilter === 'MIDDLE'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Middle (2-5Y)
            </button>
            <button
              onClick={() => setExpFilter(expFilter === 'SENIOR' ? 'ALL' : 'SENIOR')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                expFilter === 'SENIOR'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Senior (&gt; 5Y)
            </button>
          </div>

          {(scoreFilter !== 'ALL' || expFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setScoreFilter('ALL');
                setExpFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] font-mono text-red-600 hover:underline cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Main Kanban Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-4">
        {/* Real-time Candidate Pipeline Stats Ribbon */}
        {jobs.length > 0 && !loadingCandidates && (
          <div className="bg-white rounded-[10px] p-3.5 border border-[#ebebeb] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#8f8f8f] uppercase tracking-wider">CHỈ SỐ PIPELINE:</span>
              <span className="font-semibold text-[#171717]">
                {currentJob?.title || 'Tất cả vị trí'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#fafafa] border border-[#ebebeb] text-[#4d4d4d]">
                <span>TỔNG HỒ SƠ:</span>
                <strong className="text-[#171717]">{statsSummary.total}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span>AI ĐÃ CHẤM:</span>
                <strong>{statsSummary.evaluated}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#d3e5ff] border border-[#0070f3]/20 text-[#0761d1]">
                <span>LỊCH MEET:</span>
                <strong>{statsSummary.interview}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800">
                <span>KHO NHÂN TÀI:</span>
                <strong>{statsSummary.talentPool}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f2f2f2] border border-[#ebebeb] text-[#171717] font-semibold">
                <span>ĐIỂM TB:</span>
                <strong>{statsSummary.avgScore}%</strong>
              </span>
            </div>
          </div>
        )}

        {loadingCandidates ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-2 text-[#8f8f8f] text-xs font-mono">
            <div className="h-5 w-5 border-2 border-[#171717] border-t-transparent rounded-full animate-spin"></div>
            <span>LOADING_CANDIDATE_PIPELINE...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3 text-center border border-[#ebebeb] bg-white rounded-[12px] p-8 shadow-[0px_1px_1px_rgba(0,0,0,0.04)]">
            <div className="w-10 h-10 rounded-[6px] bg-[#fafafa] border border-[#ebebeb] flex items-center justify-center mx-auto text-[#8f8f8f]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">
                Chưa có vị trí tuyển dụng nào
              </h3>
              <p className="text-xs text-[#8f8f8f] mt-1 max-w-md">
                Tạo một tin tuyển dụng mới để tiếp nhận CV từ ứng viên và kích hoạt quy trình thẩm định tự động bằng Gemini AI.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingJob(null);
                setIsJobModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#171717] hover:bg-[#333333] text-white font-medium text-xs transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
            >
              Tạo Tin Đầu Tiên
            </button>
          </div>
        ) : (
          <RecruitmentKanbanBoard
            candidates={filteredCandidates}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          />
        )}
      </div>

      {/* Split-View Candidate Detail Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onCandidateUpdated={handleCandidateUpdated}
      />

      {/* Create / Edit Job Modal */}
      <JobManageModal
        job={editingJob}
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onSuccess={(savedJob) => {
          fetchJobs();
          setSelectedJobId(savedJob.id);
        }}
      />
    </div>
  );
}
