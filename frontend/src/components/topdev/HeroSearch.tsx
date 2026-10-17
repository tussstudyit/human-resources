'use client';

import React from 'react';
import { Search, MapPin, Layers, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { POPULAR_TECH_KEYWORDS, VIETNAM_LOCATIONS, JOB_LEVELS } from '@/data/topdevMockData';

interface HeroSearchProps {
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  level: string;
  setLevel: (val: string) => void;
  selectedSkill: string;
  setSelectedSkill: (val: string) => void;
  onSearchSubmit: () => void;
  onOpenReportModal: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  keyword,
  setKeyword,
  location,
  setLocation,
  level,
  setLevel,
  selectedSkill,
  setSelectedSkill,
  onSearchSubmit,
  onOpenReportModal
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const handleTagClick = (tag: string) => {
    if (selectedSkill === tag) {
      setSelectedSkill('');
    } else {
      setSelectedSkill(tag);
    }
    onSearchSubmit();
  };

  return (
    <div id="hero" className="relative bg-[#0F172A] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
      {/* Subtle tech background grid pattern & ambient glow */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Top editorial kicker */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Hệ sinh thái Tuyển dụng & Việc làm IT #1 Việt Nam</span>
          </div>
          <button
            onClick={onOpenReportModal}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 cursor-pointer"
          >
            <span>Báo cáo Lương IT 2025 - 2026 đã phát hành</span>
            <ArrowRight className="w-3 h-3 text-red-400" />
          </button>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center tracking-tight leading-tight max-w-4xl mx-auto text-balance">
          Tìm Kiếm <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">2,500+ Việc Làm IT</span> Hàng Đầu Tại Việt Nam
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-300 text-center max-w-2xl mx-auto font-normal">
          Kết nối trực tiếp với 1,400+ doanh nghiệp công nghệ uy tín, chế độ đãi ngộ minh bạch và môi trường chuyên nghiệp.
        </p>

        {/* Search Bar Container */}
        <div className="mt-8 bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200/20 text-slate-900">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">
            
            {/* Input 1: Keyword / Role */}
            <div className="flex-1 relative flex items-center min-w-0">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5 text-red-600" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Vị trí, kỹ năng (React, Golang, Java, Python, AI...)"
                className="w-full pl-11 pr-3 py-3 text-sm font-medium text-slate-900 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none border border-slate-200 md:border-0 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Divider in desktop */}
            <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0 mx-2" />

            {/* Select 2: Location */}
            <div className="relative flex items-center md:w-52 shrink-0">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <MapPin className="w-4 h-4 text-slate-500" />
              </div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-8 py-3 text-sm font-medium text-slate-700 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none border border-slate-200 md:border-0 focus:outline-none appearance-none cursor-pointer"
              >
                {VIETNAM_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="text-slate-900">
                    {loc}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Divider in desktop */}
            <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0 mx-2" />

            {/* Select 3: Level */}
            <div className="relative flex items-center md:w-44 shrink-0">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Layers className="w-4 h-4 text-slate-500" />
              </div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full pl-9 pr-8 py-3 text-sm font-medium text-slate-700 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none border border-slate-200 md:border-0 focus:outline-none appearance-none cursor-pointer truncate"
              >
                {JOB_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="text-slate-900">
                    {lvl}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="shrink-0 md:pl-2">
              <button
                type="submit"
                className="w-full md:w-auto py-3 px-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Tìm Kiếm</span>
              </button>
            </div>
          </form>
        </div>

        {/* Popular Tech Stacks / Quick Filter Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Tìm kiếm phổ biến:</span>
          {POPULAR_TECH_KEYWORDS.map((tech) => {
            const isSelected = selectedSkill.toLowerCase() === tech.toLowerCase();
            return (
              <button
                key={tech}
                type="button"
                onClick={() => handleTagClick(tech)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {tech}
              </button>
            );
          })}
          {selectedSkill && (
            <button
              onClick={() => setSelectedSkill('')}
              className="px-2.5 py-1 text-red-400 hover:text-red-300 underline underline-offset-2 ml-1"
            >
              Xóa bộ lọc kỹ năng
            </button>
          )}
        </div>

        {/* Quick KPI Strip below Hero */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              2,850+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Việc làm IT đang tuyển</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              1,400+
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Doanh nghiệp công nghệ</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono tabular-nums">
              $1,850
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Lương trung bình IT/tháng</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              72%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Việc làm Hybrid / Remote</div>
          </div>
        </div>

      </div>
    </div>
  );
};
