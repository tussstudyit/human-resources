'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { JobPost } from '@/types/recruitment';
import JobCard from './JobCard';
import ApplyModal from './ApplyModal';
import PublicHeader from './PublicHeader';
import { inferDepartment } from '@/lib/recruitment-utils';
import {
  Search,
  Briefcase,
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react';

interface CareersClientProps {
  initialJobs: JobPost[];
  initialError?: boolean;
}

const DEPARTMENTS = [
  'Tất cả',
  'Kỹ thuật & Công nghệ',
  'Kinh doanh & Phát triển',
  'Nhân sự',
  'Khác',
] as const;

type DepartmentFilter = (typeof DEPARTMENTS)[number];

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

/**
 * Chuẩn hóa phòng ban theo 4 danh mục chính hoặc 'Khác'
 */
function normalizeDepartment(deptName: string): DepartmentFilter {
  if (deptName === 'Kỹ thuật & Công nghệ') return 'Kỹ thuật & Công nghệ';
  if (deptName === 'Kinh doanh & Phát triển') return 'Kinh doanh & Phát triển';
  if (deptName === 'Nhân sự') return 'Nhân sự';
  return 'Khác';
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
  const [selectedDept, setSelectedDept] = useState<string>('Tất cả');

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

  // Đếm số lượng việc làm cho từng tab phòng ban
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Tất cả': jobs.length,
      'Kỹ thuật & Công nghệ': 0,
      'Kinh doanh & Phát triển': 0,
      'Nhân sự': 0,
      Khác: 0,
    };

    for (const job of jobs) {
      const rawDept = job.department || inferDepartment(job.title);
      const cat = normalizeDepartment(rawDept);
      counts[cat] = (counts[cat] || 0) + 1;
    }

    return counts;
  }, [jobs]);

  // Lọc việc làm theo từ khóa và phòng ban
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const rawDept = job.department || inferDepartment(job.title);

      // Lọc theo tab phòng ban
      if (selectedDept !== 'Tất cả' && selectedDept !== 'ALL') {
        const cat = normalizeDepartment(rawDept);
        if (selectedDept === 'Khác') {
          if (cat !== 'Khác') return false;
        } else if (rawDept !== selectedDept && cat !== selectedDept) {
          return false;
        }
      }

      // Lọc từ khóa tìm kiếm (case insensitive, accent insensitive)
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
      setError('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.');
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* 1. Header (Desktop 72px, Mobile 64px) */}
      <PublicHeader />

      <main className="flex-1 pb-20">
        {/* 2. Hero Section: Light Mode, White Space, H1: "Gia nhập đội ngũ của chúng tôi" */}
        <section className="bg-white border-b border-[#E2E8F0] pt-12 pb-14 sm:pt-16 sm:pb-16 px-4 sm:px-8">
          <div className="max-w-[1184px] mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ebebeb] shadow-[0px_1px_2px_rgba(0,0,0,0.04)] text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-[#171717]">Cổng thông tin việc làm</span>
              <span className="text-[#8f8f8f]">•</span>
              <span className="text-[#4d4d4d]">Khám phá các vị trí tuyển dụng mới nhất</span>
            </div>

            <h1 className="text-[36px] sm:text-[48px] md:text-[60px] md:leading-[1.12] font-black tracking-tight text-[#0F172A] max-w-4xl mx-auto">
              Gia nhập đội ngũ của chúng tôi
            </h1>

            <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed font-normal">
              Khám phá các cơ hội nghề nghiệp hấp dẫn và cùng chúng tôi kiến tạo những giá trị mới.
            </p>

            {/* 3. Search: "Tìm theo vị trí hoặc kỹ năng" */}
            <div className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-[#64748B] pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo vị trí hoặc kỹ năng"
                  className="w-full pl-12 pr-10 py-3 sm:py-3.5 bg-[#F8FAFC] hover:bg-white text-[#0F172A] placeholder:text-[#64748B] border border-[#E2E8F0] focus:border-[#78C64C] rounded-[12px] text-sm font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-[#ACE77E] transition duration-150"
                  aria-label="Tìm theo vị trí hoặc kỹ năng"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3.5 p-1 rounded-[8px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 transition"
                    aria-label="Xóa nội dung tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Department Filter & Job Grid Container (Desktop 1280px max-width 1184px, Mobile 16px padding) */}
        <div className="max-w-[1184px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* 4. Department Filter: Desktop inline, Mobile horizontal scroll */}
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-full">
              {DEPARTMENTS.map((dept) => {
                const isSelected =
                  selectedDept === dept || (dept === 'Tất cả' && selectedDept === 'ALL');
                const count = deptCounts[dept] ?? 0;

                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-colors duration-150 shrink-0 border cursor-pointer focus-ring ${
                      isSelected
                        ? 'bg-[#171717] border-[#171717] text-white shadow-xs font-semibold'
                        : 'bg-white border-[#ebebeb] text-[#4d4d4d] hover:bg-slate-50 hover:text-[#171717]'
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4d4d4d] hover:text-[#171717] px-3 py-1.5 rounded-[8px] bg-white border border-[#ebebeb] hover:bg-[#fafafa] transition disabled:opacity-50 ml-auto shrink-0 shadow-xs cursor-pointer focus-ring"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white border border-rose-200 rounded-[12px] p-6 text-center space-y-3 mb-8 shadow-xs">
              <div className="h-12 w-12 rounded-[12px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#0F172A]">
                  Không thể tải danh sách việc làm
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  {error}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#333333] active:bg-black text-white text-xs font-semibold rounded-[8px] shadow-xs transition duration-150 cursor-pointer focus-ring"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* 5. Job Grid: Desktop 3 columns, gap 24px (gap-6), Mobile 1 column */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center space-y-4 shadow-xs">
              <div className="h-14 w-14 rounded-[12px] bg-slate-100 text-[#64748B] flex items-center justify-center mx-auto">
                <Briefcase className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#0F172A]">
                  {jobs.length === 0
                    ? 'Hiện chưa có vị trí nào đang mở tuyển'
                    : 'Không tìm thấy vị trí tuyển dụng phù hợp'}
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                  {jobs.length === 0
                    ? 'Hiện tại chưa có vị trí nào đang mở tuyển. Vui lòng quay lại sau!'
                    : debouncedQuery || selectedDept !== 'Tất cả'
                    ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn phòng ban khác để xem các vị trí mở tuyển.'
                    : 'Hiện tại chưa có vị trí nào đang mở tuyển. Vui lòng quay lại sau!'}
                </p>
              </div>

              {(debouncedQuery || (selectedDept !== 'Tất cả' && selectedDept !== 'ALL')) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSelectedDept('Tất cả');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold rounded-[12px] transition duration-150"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 6. Footer: Minimal, clean, light mode */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 px-4 sm:px-8 mt-auto">
        <div className="max-w-[1184px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0F172A]">HR Platform</span>
            <span>•</span>
            <span>Cổng tuyển dụng nhân tài công nghệ Việt Nam</span>
          </div>
          <div>
            <p>© {new Date().getFullYear()} HR Platform. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>

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
