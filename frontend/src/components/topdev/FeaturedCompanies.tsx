'use client';

import React from 'react';
import { CompanySpotlight } from '@/types/topdev';
import { SPOTLIGHT_COMPANIES } from '@/data/topdevMockData';
import { Building2, Star, ArrowRight, MapPin } from 'lucide-react';

interface FeaturedCompaniesProps {
  onSelectCompany: (companyName: string) => void;
}

export const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ onSelectCompany }) => {
  return (
    <section id="companies-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Top Tech Employers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Nhà Tuyển Dụng IT Hàng Đầu
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Khám phá văn hóa làm việc và cơ hội nghề nghiệp tại các tập đoàn công nghệ dẫn đầu thị trường.
            </p>
          </div>

          <button
            onClick={() => onSelectCompany('')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group cursor-pointer"
          >
            <span>Xem tất cả công ty</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPOTLIGHT_COMPANIES.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company.name)}
              className="group relative bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-red-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Logo, Name, Rating */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                        {company.name}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                      {company.industry}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {company.rating}
                      </span>
                      <span className="text-slate-400">({company.reviewsCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                {/* City & Address */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{company.city}</span>
                </div>

                {/* Highlight snippet */}
                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {company.highlight}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Open positions count */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="font-extrabold text-red-600">
                  {company.openJobsCount} việc làm đang tuyển
                </span>
                <span className="text-slate-500 group-hover:text-slate-900 font-semibold flex items-center gap-1">
                  Khám phá việc làm
                  <ArrowRight className="w-3 h-3 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
