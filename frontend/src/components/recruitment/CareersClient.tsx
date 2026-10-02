'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JobPost } from '@/types/recruitment';
import JobCard from './JobCard';
import ApplyModal from './ApplyModal';
import PublicHeader from './PublicHeader';
import { inferDepartment } from '@/lib/recruitment-utils';
import {
  Search,
  Sparkles,
  Briefcase,
  Layers,
  Bot,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface CareersClientProps {
  initialJobs: JobPost[];
  initialError?: boolean;
}

/**
 * Loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
 */
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default function CareersClient({
  initialJobs,
  initialError = false,
}: CareersClientProps) {
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [error, setError] = useState<string | null>(
    initialError
      ? 'Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.'
      : null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search input & debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Modal ứng tuyển
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeTriggerRef = useRef<HTMLElement | null>(null);

  // Debounce search query 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Danh sách phòng ban duy nhất để lọc
  const departmentList = useMemo(() => {
    const depts = new Set<string>();
    for (const job of jobs) {
      const d = job.department || inferDepartment(job.title);
      depts.add(d);
    }
    return Array.from(depts);
  }, [jobs]);

  // Lọc việc làm theo từ khóa và phòng ban
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Lọc phòng ban
      if (selectedDept !== 'ALL') {
        const dept = job.department || inferDepartment(job.title);
        if (dept !== selectedDept) return false;
      }

      // Lọc từ khóa tìm kiếm
      if (!debouncedQuery) return true;

      const normalizedQuery = removeVietnameseAccents(debouncedQuery);
      const normalizedTitle = removeVietnameseAccents(job.title);
      const normalizedDesc = removeVietnameseAccents(job.description);
      const normalizedReq = removeVietnameseAccents(job.requirements);

      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedDesc.includes(normalizedQuery) ||
        normalizedReq.includes(normalizedQuery)
      );
    });
  }, [jobs, debouncedQuery, selectedDept]);

  // Nạp lại dữ liệu việc làm từ API
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const { getJobs } = await import('@/lib/api/recruitment');
      const data = await getJobs();
      setJobs(data);
    } catch {
      setError('Không thể làm mới danh sách việc làm. Vui lòng thử lại sau.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenApplyModal = (
    job: JobPost,
    triggerRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    activeTriggerRef.current = triggerRef.current;
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseApplyModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-12 pb-20 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-4 w-4" />
              <span>Tuyển dụng thông minh kết hợp AI Agent</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
              Gia nhập đội ngũ công nghệ kiến tạo tương lai
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Khám phá các cơ hội nghề nghiệp hấp dẫn. Nộp hồ sơ nhanh chóng, hệ thống AI Recruitment Agent tự động phân tích kỹ năng và phản hồi tức thì.
            </p>

            {/* Ô tìm kiếm trung tâm */}
            <div className="max-w-2xl mx-auto pt-3">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm vị trí (ví dụ: Senior Software, Python, Cybersecurity...)"
                  className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-medium shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition"
                  aria-label="Tìm kiếm vị trí việc làm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                    aria-label="Xóa nội dung tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Chỉ số nhanh */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <strong className="text-white font-bold">{jobs.length}</strong> vị trí đang mở tuyển
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Bot className="h-4 w-4 text-emerald-400" />
                Đánh giá tự động bởi AI Recruitment Agent
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="h-4 w-4 text-amber-400" />
                Phản hồi minh bạch & nhanh chóng
              </span>
            </div>
          </div>
        </section>

        {/* Nội dung danh sách việc làm */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6">
          {/* Bộ lọc phòng ban */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/80 mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-1 pr-2 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Phòng ban:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedDept('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedDept === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({jobs.length})
              </button>

              {departmentList.map((dept) => {
                const count = jobs.filter(
                  (j) => (j.department || inferDepartment(j.title)) === dept
                ).length;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      selectedDept === dept
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dept} ({count})
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50 ml-auto shrink-0"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Lỗi hiển thị nếu fetch thất bại */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 mb-8">
              <p className="text-sm font-bold text-rose-800">{error}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Danh sách việc làm */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleOpenApplyModal}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Briefcase className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Không tìm thấy vị trí tuyển dụng phù hợp
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {debouncedQuery || selectedDept !== 'ALL'
                    ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn phòng ban khác để xem các vị trí mở tuyển.'
                    : 'Hiện tại chưa có vị trí nào đang mở tuyển. Vui lòng quay lại sau!'}
                </p>
              </div>

              {(debouncedQuery || selectedDept !== 'ALL') && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSelectedDept('ALL');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal ứng tuyển */}
      <ApplyModal
        key={selectedJob?.id ?? 'empty'}
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseApplyModal}
        triggerRef={activeTriggerRef}
      />
    </div>
  );
}
