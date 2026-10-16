'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Tag, Plus } from 'lucide-react';
import { JobPost, JobStatus, CreateJobDto } from '@/types/recruitment';
import { createJob, updateJob } from '@/lib/api/recruitment';
import { useToastStore } from '@/store/useToastStore';

interface JobManageModalProps {
  job?: JobPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: JobPost) => void;
}

const COMMON_TECH_TAGS = [
  'React',
  'Node.js',
  'NestJS',
  'TypeScript',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Python',
  'Golang',
  'Kubernetes',
  'TailwindCSS',
  'Redis',
  'Next.js',
  'CI/CD',
];

export default function JobManageModal({
  job,
  isOpen,
  onClose,
  onSuccess,
}: JobManageModalProps) {
  const isEditing = Boolean(job);
  const { showToast } = useToastStore();

  const [title, setTitle] = useState(job?.title || '');
  const [description, setDescription] = useState(job?.description || '');
  const [requirements, setRequirements] = useState(job?.requirements || '');
  const [status, setStatus] = useState<JobStatus>(job?.status || 'OPEN');
  const [loading, setLoading] = useState(false);
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);

  React.useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description);
      setRequirements(job.requirements);
      setStatus(job.status);
    } else {
      setTitle('');
      setDescription('');
      setRequirements('');
      setStatus('OPEN');
    }
  }, [job]);

  if (!isOpen) return null;

  // Gợi ý JD và Yêu cầu tự động bằng AI Template chuẩn IT UpCareer
  const handleGenerateJdWithAi = () => {
    if (!title.trim()) {
      showToast({
        type: 'warning',
        title: 'Chưa có tiêu đề',
        message: 'Vui lòng nhập tiêu đề vị trí trước để AI có thể sinh bản mô tả phù hợp.',
      });
      return;
    }

    setIsGeneratingJd(true);
    setTimeout(() => {
      const lower = title.toLowerCase();
      const isBackend = lower.includes('back') || lower.includes('node') || lower.includes('nest') || lower.includes('python') || lower.includes('golang');
      const isFrontend = lower.includes('front') || lower.includes('react') || lower.includes('vue') || lower.includes('next');
      const isLead = lower.includes('lead') || lower.includes('manager') || lower.includes('trưởng');

      const generatedDesc = [
        `• Tham gia thiết kế, phát triển và tối ưu hóa hệ sinh thái phần mềm đáp ứng hàng triệu người dùng cho vị trí ${title}.`,
        `• Phối hợp chặt chẽ với Product Owner, Tech Lead và đội ngũ QA để đảm bảo tiến độ và chất lượng mã nguồn theo quy trình Agile/Scrum.`,
        `• Xây dựng và duy trì kiến trúc module sạch (Clean Architecture), dịch vụ microservices có độ tin cậy và hiệu năng cao.`,
        `• Tham gia code review, chia sẻ kiến thức kỹ thuật và đóng góp cải tiến quy trình kỹ thuật của công ty.`,
        `• Chế độ làm việc: Hybrid linh hoạt (2 ngày remote / tuần), bảo hiểm sức khỏe cao cấp, thưởng tháng 13+.`,
      ].join('\n');

      const generatedReq = isBackend
        ? [
            `• Tối thiểu ${isLead ? '5' : '2-3'} năm kinh nghiệm làm việc thực tế với backend: Node.js, NestJS hoặc Python.`,
            `• Thành thạo cơ sở dữ liệu quan hệ (PostgreSQL, MySQL) và NoSQL (Redis, MongoDB), tối ưu query và indexing.`,
            `• Kinh nghiệm thiết kế RESTful API chuẩn hóa, nắm vững Docker, CI/CD và kiến trúc microservices.`,
            `• Hiểu biết về bảo mật ứng dụng, caching và xử lý hàng đợi message broker (RabbitMQ/Kafka) là lợi thế lớn.`,
            `• Kỹ năng tư duy logic tốt, chủ động giải quyết vấn đề và tinh thần làm việc nhóm hiệu quả.`,
          ].join('\n')
        : isFrontend
        ? [
            `• Tối thiểu ${isLead ? '5' : '2-3'} năm kinh nghiệm phát triển Frontend với React, Next.js và TypeScript.`,
            `• Nắm vững HTML5, CSS3, Tailwind CSS, Responsive Design và tối ưu trải nghiệm người dùng (Core Web Vitals).`,
            `• Thành thạo quản lý state (Zustand, Redux Toolkit, React Query) và tích hợp RESTful/GraphQL API.`,
            `• Có kinh nghiệm viết Unit Test (Jest, Vitest) và hiểu biết về SSR/SSG trong Next.js là điểm cộng lớn.`,
            `• Khả năng giao tiếp tốt, cẩn thận và có mắt thẩm mỹ về UI/UX hiện đại.`,
          ].join('\n')
        : [
            `• Tối thiểu ${isLead ? '5' : '2-3'} năm kinh nghiệm trong lĩnh vực công nghệ thông tin liên quan đến ${title}.`,
            `• Nắm vững các công nghệ cốt lõi: Git, Docker, RESTful API và quy trình phát triển phần mềm chuẩn.`,
            `• Khả năng đọc hiểu tài liệu tiếng Anh chuyên ngành công nghệ tốt.`,
            `• Tinh thần trách nhiệm cao, sẵn sàng học hỏi công nghệ mới và chia sẻ với đồng nghiệp.`,
          ].join('\n');

      setDescription(generatedDesc);
      setRequirements(generatedReq);
      setIsGeneratingJd(false);
      showToast({
        type: 'success',
        title: 'Sinh JD thành công',
        message: 'Đã tạo bản mô tả công việc và tiêu chí yêu cầu chuẩn IT UpCareer.',
      });
    }, 400);
  };

  // Thêm nhanh tech tag vào ô yêu cầu
  const handleAddTechTag = (tag: string) => {
    if (requirements.toLowerCase().includes(tag.toLowerCase())) {
      return;
    }
    const updated = requirements.trim()
      ? `${requirements.trim()}, ${tag}`
      : `Yêu cầu kỹ năng: ${tag}`;
    setRequirements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requirements.trim()) {
      showToast({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng điền đầy đủ tiêu đề, mô tả công việc và yêu cầu tuyển dụng.',
      });
      return;
    }

    try {
      setLoading(true);
      const payload: CreateJobDto = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        status,
      };

      let savedJob: JobPost;
      if (isEditing && job) {
        savedJob = await updateJob(job.id, payload);
        showToast({
          type: 'success',
          title: 'Cập nhật thành công',
          message: `Đã cập nhật tin tuyển dụng "${savedJob.title}"`,
        });
      } else {
        savedJob = await createJob(payload);
        showToast({
          type: 'success',
          title: 'Đăng tin thành công',
          message: `Đã tạo mới tin tuyển dụng "${savedJob.title}"`,
        });
      }

      onSuccess(savedJob);
      onClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Thao tác thất bại',
        message: 'Có lỗi xảy ra khi lưu tin tuyển dụng.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="font-mono text-[10px] font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
              <span>// UPCAREER_JOB_POSITION_MANAGEMENT</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              {isEditing ? 'Chỉnh Sửa Vị Trí Tuyển Dụng' : 'Tạo Vị Trí Tuyển Dụng Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-mono text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Tiêu đề vị trí tuyển dụng <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateJdWithAi}
                disabled={isGeneratingJd || !title.trim()}
                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                title="Tự động sinh mô tả và yêu cầu theo tiêu chuẩn UpCareer"
              >
                <Sparkles className={`w-3 h-3 text-red-600 ${isGeneratingJd ? 'animate-spin' : ''}`} />
                <span>{isGeneratingJd ? 'AI đang viết...' : 'AI Gợi Ý JD'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Senior Backend Engineer (Node.js/NestJS)"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors shadow-xs"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Trạng thái tiếp nhận hồ sơ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors shadow-xs"
            >
              <option value="OPEN">🟢 Đang mở ứng tuyển (OPEN - Hiển thị trên Cổng UpCareer)</option>
              <option value="CLOSED">🔴 Đã đóng ứng tuyển (CLOSED - Tạm dừng tiếp nhận)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Mô tả công việc (Job Description - JD) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả trách nhiệm chính, cơ cấu dự án, quyền lợi và chế độ làm việc..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors leading-relaxed resize-y shadow-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-mono text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Yêu cầu kỹ năng & Kinh nghiệm <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                AI Agent dùng để chấm Match Score
              </span>
            </div>

            {/* Quick Tech Tag Picker */}
            <div className="mb-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-500">
                <Tag className="w-3 h-3 text-red-500" />
                <span>CHỌN NHANH TECH STACK PHỔ BIẾN:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TECH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTechTag(tag)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 text-slate-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="VD: Tối thiểu 3 năm kinh nghiệm với Node.js, NestJS, PostgreSQL. Thành thạo Docker..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors leading-relaxed resize-y shadow-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isEditing ? 'Lưu thay đổi' : 'Đăng tin tuyển dụng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
