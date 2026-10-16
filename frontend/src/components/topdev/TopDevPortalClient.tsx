'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_JOBS } from '@/data/topdevMockData';
import { Job, TopDevJob } from '@/types/topdev';
import { JobPost } from '@/types/recruitment';
import { mergeRealAndSampleJobs, adaptJobPostToTopDevJob } from '@/lib/topdev-adapter';
import { Header } from './Header';
import { HeroSearch } from './HeroSearch';
import { JobCard } from './JobCard';
import { TopDevJobDetailView } from './TopDevJobDetailView';
import { ApplicationModal } from './ApplicationModal';
import { FeaturedCompanies } from './FeaturedCompanies';
import { ITReportBanner, ITReportModal } from './ITReportBanner';
import { SalaryCalculatorModal } from './SalaryCalculatorModal';
import { CVBuilderModal } from './CVBuilderModal';
import { BlogSection } from './BlogSection';
import { AuthModal } from './AuthModal';
import { Footer } from './Footer';
import { 
  Briefcase, 
  Filter, 
  Flame, 
  Sparkles, 
  DollarSign, 
  Laptop, 
  RotateCcw, 
  Bookmark, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Building2
} from 'lucide-react';

export interface UpCareerPortalClientProps {
  initialRealJobs?: JobPost[];
  initialSelectedJobId?: string;
}
export type TopDevPortalClientProps = UpCareerPortalClientProps;

export const UpCareerPortalClient: React.FC<UpCareerPortalClientProps> = ({
  initialRealJobs = [],
  initialSelectedJobId,
}) => {
  // Filter States
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('Tất cả địa điểm');
  const [level, setLevel] = useState('Tất cả cấp bậc');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'urgent' | 'high_salary' | 'remote'>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'salary_high' | 'popular'>('latest');
  // View Mode: 'list' (job board) or 'detail' (exact 2-column JD view from tranghienthitimkiem)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(initialSelectedJobId ? 'detail' : 'list');
  const [currentJob, setCurrentJob] = useState<Job | null>(() => {
    if (initialSelectedJobId) {
      const found = initialRealJobs.find((j) => j.id === initialSelectedJobId);
      if (found) return adaptJobPostToTopDevJob(found);
    }
    return null;
  });
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  // Interactive Saved Jobs state
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSalaryCalcOpen, setIsSalaryCalcOpen] = useState(false);
  const [isCVBuilderOpen, setIsCVBuilderOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedJobsModalOpen, setIsSavedJobsModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Chỉ hiển thị việc làm thực tế từ Backend CSDL (100% Real Jobs)
  const allJobs: Job[] = useMemo(() => {
    return mergeRealAndSampleJobs(initialRealJobs, []);
  }, [initialRealJobs]);

  useEffect(() => {
    if (initialSelectedJobId && allJobs.length > 0) {
      const found = allJobs.find(
        (j) => j.id === initialSelectedJobId || j.backendJobId === initialSelectedJobId
      );
      if (found) {
        setCurrentJob(found);
        setViewMode('detail');
      }
    }
  }, [initialSelectedJobId, allJobs]);

  // Open Job Detail and push history state so browser Back button works
  const handleSelectJob = (job: Job, openApplyModal = false) => {
    setCurrentJob(job);
    setViewMode('detail');
    if (openApplyModal) {
      setIsApplicationModalOpen(true);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({ jobId: job.id, view: 'detail' }, '', `/jobs/${job.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate back to job board list
  const handleBackToList = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1 && window.location.pathname.startsWith('/jobs/')) {
        window.history.back();
      } else {
        window.history.pushState(null, '', '/');
        setViewMode('list');
        setCurrentJob(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setViewMode('list');
      setCurrentJob(null);
    }
  };

  // Listen to browser Back / Forward events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      if (path.startsWith('/jobs/')) {
        const jobId = path.replace('/jobs/', '').split('/')[0];
        const found = allJobs.find(
          (j) => j.id === jobId || j.backendJobId === jobId
        );
        if (found) {
          setCurrentJob(found);
          setViewMode('detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      // If path is root or /careers or not a valid job detail, return to list mode
      setViewMode('list');
      setCurrentJob(null);
      setIsApplicationModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [allJobs]);

  // Toggle Save Job
  const handleToggleSave = (jobId: string) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      showToast('Đã xóa việc làm khỏi danh sách đã lưu');
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      showToast('Đã lưu việc làm vào danh sách yêu thích!');
    }
  };

  // Handle Search Trigger
  const handleSearchSubmit = () => {
    const jobsEl = document.getElementById('jobs-section');
    if (jobsEl) {
      jobsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Navigation Click Handler
  const handleSelectNav = (sectionId: string) => {
    if (viewMode === 'detail') {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/jobs/')) {
        window.history.pushState(null, '', '/');
      }
      setViewMode('list');
      setCurrentJob(null);
    }
    if (sectionId === 'jobs-section') {
      const el = document.getElementById('jobs-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'companies-section') {
      const el = document.getElementById('companies-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'blog-section') {
      const el = document.getElementById('blog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter Jobs Logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      // 1. Keyword search (title, company, description, skills)
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.company.name.toLowerCase().includes(q);
        const matchSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCompany && !matchSkills) {
          return false;
        }
      }

      // 2. Company filter (when clicked from featured companies)
      if (companyFilter) {
        if (!job.company.name.toLowerCase().includes(companyFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Location filter
      if (location !== 'Tất cả địa điểm') {
        if (location === 'Remote (Toàn quốc)') {
          if (job.workType !== 'Remote') return false;
        } else {
          if (!job.location.includes(location) && !job.company.city.includes(location)) {
            return false;
          }
        }
      }

      // 4. Level filter
      if (level !== 'Tất cả cấp bậc') {
        const cleanLevel = level.split('/')[0].trim();
        if (!job.level.toLowerCase().includes(cleanLevel.toLowerCase())) {
          return false;
        }
      }

      // 5. Selected Skill tag
      if (selectedSkill) {
        const match = job.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());
        if (!match) return false;
      }

      // 6. Work Type filter dropdown
      if (workTypeFilter !== 'all') {
        if (workTypeFilter === 'hybrid' && job.workType !== 'Hybrid') return false;
        if (workTypeFilter === 'remote' && job.workType !== 'Remote') return false;
        if (workTypeFilter === 'office' && job.workType !== 'At office') return false;
      }

      // 7. Tab filters
      if (activeTab === 'featured' && !job.featured) return false;
      if (activeTab === 'urgent' && !job.urgent) return false;
      if (activeTab === 'high_salary') {
        if (job.salary.currency === 'USD' && (job.salary.min || 0) < 2000) return false;
        if (job.salary.currency === 'VND' && (job.salary.min || 0) < 1500) return false;
      }
      if (activeTab === 'remote' && job.workType !== 'Remote' && job.workType !== 'Hybrid') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'salary_high') {
        const salaryA = a.salary.max || a.salary.min || 0;
        const salaryB = b.salary.max || b.salary.min || 0;
        return salaryB - salaryA;
      }
      if (sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }
      // If 'latest', maintain real jobs at the very top
      if (a.isRealFromBackend && !b.isRealFromBackend) return -1;
      if (!a.isRealFromBackend && b.isRealFromBackend) return 1;
      return 0;
    });
  }, [allJobs, keyword, companyFilter, location, level, selectedSkill, activeTab, workTypeFilter, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setKeyword('');
    setLocation('Tất cả địa điểm');
    setLevel('Tất cả cấp bậc');
    setSelectedSkill('');
    setActiveTab('all');
    setWorkTypeFilter('all');
    setCompanyFilter('');
    setSortBy('latest');
  };

  // Saved Jobs list
  const savedJobsList = useMemo(() => {
    return allJobs.filter((j) => savedJobIds.includes(j.id));
  }, [allJobs, savedJobIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <Header
        savedJobsCount={savedJobIds.length}
        onOpenSavedJobs={() => setIsSavedJobsModalOpen(true)}
        onOpenSalaryCalc={() => setIsSalaryCalcOpen(true)}
        onOpenCVBuilder={() => setIsCVBuilderOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSelectNav={handleSelectNav}
      />

      {viewMode === 'detail' && currentJob ? (
        <TopDevJobDetailView
          job={currentJob}
          allJobs={allJobs}
          onApplyClick={() => setIsApplicationModalOpen(true)}
          onBack={handleBackToList}
          onSelectRelatedJob={(relatedJob) => {
            handleSelectJob(relatedJob, false);
            showToast(`Đã chuyển sang xem vị trí: ${relatedJob.title}`);
          }}
          onOpenProfileIncomplete={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <>
          {/* 2. Hero Search Section */}
          <HeroSearch
        keyword={keyword}
        setKeyword={setKeyword}
        location={location}
        setLocation={setLocation}
        level={level}
        setLevel={setLevel}
        selectedSkill={selectedSkill}
        setSelectedSkill={setSelectedSkill}
        onSearchSubmit={handleSearchSubmit}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 3. Main Job Board Section */}
      <main id="jobs-section" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Header & Navigation Tabs for Jobs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          
          {/* Title & Results Counter */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-600" />
              <span>Cơ Hội Việc Làm IT Nổi Bật</span>
              <span className="text-xs font-bold text-slate-500 font-mono bg-slate-200/80 px-2.5 py-0.5 rounded-full ml-1">
                {filteredJobs.length} việc làm
              </span>
              {initialRealJobs.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {initialRealJobs.length} vị trí tuyển trực tiếp
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Các vị trí kỹ sư phần mềm chất lượng cao được cập nhật liên tục từ nhà tuyển dụng uy tín
            </p>
          </div>

          {/* Interactive Tab Switchers */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Nổi bật
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'urgent'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Tuyển gấp
            </button>
            <button
              onClick={() => setActiveTab('high_salary')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'high_salary'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Lương cao ($2,000+)
            </button>
            <button
              onClick={() => setActiveTab('remote')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'remote'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-500" />
              Hybrid / Remote
            </button>
          </div>
        </div>

        {/* Secondary Filter & Sort Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
          
          {/* Left: Active filter chips & clear button */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Bộ lọc:
            </span>

            {companyFilter && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold px-2 py-1 rounded">
                Công ty: {companyFilter}
                <button onClick={() => setCompanyFilter('')} className="hover:text-red-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {location !== 'Tất cả địa điểm' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded">
                {location}
                <button onClick={() => setLocation('Tất cả địa điểm')} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {level !== 'Tất cả cấp bậc' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded">
                {level}
                <button onClick={() => setLevel('Tất cả cấp bậc')} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSkill && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2 py-1 rounded">
                Kỹ năng: {selectedSkill}
                <button onClick={() => setSelectedSkill('')} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(keyword || companyFilter || location !== 'Tất cả địa điểm' || level !== 'Tất cả cấp bậc' || selectedSkill || workTypeFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            )}
          </div>

          {/* Right: Work Type and Sort Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Hình thức:</span>
              <select
                value={workTypeFilter}
                onChange={(e) => setWorkTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold outline-none cursor-pointer"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="hybrid">Làm việc Hybrid</option>
                <option value="remote">Làm việc Remote</option>
                <option value="office">Làm việc Tại văn phòng</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'salary_high' | 'popular')}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold outline-none cursor-pointer"
              >
                <option value="latest">Mới nhất</option>
                <option value="salary_high">Lương cao nhất</option>
                <option value="popular">Nhiều lượt xem nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        {filteredJobs.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.includes(job.id)}
                onToggleSave={handleToggleSave}
                onSelectJob={(j) => handleSelectJob(j, false)}
                onQuickApply={(j) => handleSelectJob(j, true)}
                onSelectSkill={(skill) => setSelectedSkill(skill)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy việc làm phù hợp</h3>
            <p className="text-xs text-slate-600">
              Hãy thử tìm kiếm với từ khóa kỹ năng khác (React, Java, Python, Go...) hoặc điều chỉnh lại bộ lọc địa điểm và cấp bậc.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Xóa bộ lọc & Xem tất cả việc làm
            </button>
          </div>
        )}
      </main>

      {/* 4. Featured Tech Employers Section */}
      <FeaturedCompanies
        onSelectCompany={(compName) => {
          setCompanyFilter(compName);
          handleSearchSubmit();
        }}
      />

      {/* 5. TopDev IT Market & Salary Report Section */}
      <ITReportBanner onOpenModal={() => setIsReportModalOpen(true)} />

      {/* 6. Blog & Techtalk Section */}
      <BlogSection />
        </>
      )}

      {/* 7. Footer */}
      <Footer
        onSelectSkill={(skill) => {
          setSelectedSkill(skill);
          handleSearchSubmit();
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSalaryCalc={() => setIsSalaryCalcOpen(true)}
        onOpenCVBuilder={() => setIsCVBuilderOpen(true)}
      />

      {/* --- ALL MODALS & DRAWERS --- */}

      {/* TopDev Application Modal (Real Backend Integration) */}
      {currentJob && (
        <ApplicationModal
          job={currentJob}
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          onSuccess={(candidateName, jobTitle, appId) => {
            showToast(
              `Hồ sơ ${appId ? `#${appId} ` : ''}của ${candidateName} đã được nộp thành công cho vị trí ${jobTitle}!`
            );
          }}
        />
      )}

      {/* IT Market Report Modal */}
      <ITReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Gross to Net Salary Calculator Modal */}
      <SalaryCalculatorModal
        isOpen={isSalaryCalcOpen}
        onClose={() => setIsSalaryCalcOpen(false)}
      />

      {/* CV Builder Modal */}
      <CVBuilderModal
        isOpen={isCVBuilderOpen}
        onClose={() => setIsCVBuilderOpen(false)}
      />

      {/* Candidate Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(userEmail) => {
          showToast(`Đã đăng nhập thành công với tài khoản ${userEmail}`);
        }}
      />

      {/* Saved Jobs Modal / Drawer */}
      {isSavedJobsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-base font-bold text-white">
                  Việc Làm Đã Lưu ({savedJobsList.length})
                </h3>
              </div>
              <button
                onClick={() => setIsSavedJobsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {savedJobsList.length > 0 ? (
                savedJobsList.map((j) => (
                  <div
                    key={j.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <h4 
                        onClick={() => {
                          setIsSavedJobsModalOpen(false);
                          handleSelectJob(j, false);
                        }}
                        className="text-sm font-bold text-slate-900 hover:text-red-600 transition-colors cursor-pointer truncate"
                      >
                        {j.title}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {j.company.name} · <span className="font-mono text-red-600 font-bold">{j.salary.display}</span> · {j.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setIsSavedJobsModalOpen(false);
                          handleSelectJob(j, true);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Ứng tuyển
                      </button>
                      <button
                        onClick={() => handleToggleSave(j.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Bỏ lưu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-2 text-slate-500 text-xs">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Bạn chưa lưu việc làm nào.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsSavedJobsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const TopDevPortalClient = UpCareerPortalClient;

