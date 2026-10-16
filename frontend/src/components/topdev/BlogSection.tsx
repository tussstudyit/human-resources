'use client';

import React, { useState } from 'react';
import { BlogPost } from '@/types/topdev';
import { BLOG_POSTS } from '@/data/topdevMockData';
import { BookOpen, Clock, Eye, ArrowRight, X, User } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả bài viết' },
    { id: 'career', label: 'Sự nghiệp IT', match: 'Sự nghiệp IT' },
    { id: 'salary', label: 'Báo cáo Lương', match: 'Báo cáo Lương' },
    { id: 'interview', label: 'Phỏng vấn IT', match: 'Phỏng vấn IT' },
    { id: 'trend', label: 'Xu hướng Công nghệ', match: 'Xu hướng Công nghệ' }
  ];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    if (selectedCategory === 'all') return true;
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat ? post.category === cat.match : true;
  });

  return (
    <section id="blog-section" className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>UpCareer Techtalk & Insights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Blog IT & Cẩm Nang Lập Trình Viên
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Kinh nghiệm phỏng vấn, tư vấn phát triển nghề nghiệp và các phân tích kỹ thuật chuyên sâu.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setActivePost(post)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-red-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Meta line */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2.5">
                  <span className="text-red-600 uppercase tracking-wider">{post.category}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              {/* Author and Date footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[140px] font-medium text-slate-700">
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {post.views}
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Article Detail Reading Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">{activePost.category}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{activePost.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Tác giả: <strong>{activePost.author}</strong></span>
                  <span>·</span>
                  <span>Ngày đăng: {activePost.publishDate}</span>
                  <span>·</span>
                  <span>{activePost.readTime}</span>
                </div>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">
                {activePost.summary}
              </p>
              <p>
                Thị trường công nghệ thông tin tại Việt Nam đang chứng kiến những bước chuyển mình mạnh mẽ. Đối với các kỹ sư phần mềm, việc liên tục trau dồi cả chiều sâu kỹ thuật (System Architecture, Concurrency, Clean Code) lẫn kỹ năng mềm (Giao tiếp, Đàm phán, Tư duy sản phẩm) chính là chìa khóa để đạt được các mức đãi ngộ hấp dẫn.
              </p>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-xs text-red-950 space-y-1">
                <strong>Ghi chú từ Ban biên tập UpCareer:</strong>
                <p>
                  Bài viết này được tổng hợp từ dữ liệu phỏng vấn thực tế và khảo sát lương độc quyền của UpCareer. Chúc các lập trình viên vững bước trên hành trình chinh phục đỉnh cao sự nghiệp công nghệ!
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActivePost(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
