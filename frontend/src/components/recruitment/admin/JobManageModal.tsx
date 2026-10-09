'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { JobPost, JobStatus, CreateJobDto } from '@/types/recruitment';
import { createJob, updateJob } from '@/lib/api/recruitment';
import { useToastStore } from '@/store/useToastStore';

interface JobManageModalProps {
  job?: JobPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (job: JobPost) => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-[#ebebeb] rounded-[12px] w-full max-w-xl shadow-[0px_4px_16px_rgba(0,0,0,0.08),0px_16px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white">
          <div>
            <div className="font-mono text-[10px] text-[#8f8f8f] uppercase tracking-wider">
              // JOB_POSITION_MANAGEMENT
            </div>
            <h2 className="text-sm font-semibold text-[#171717] tracking-tight mt-0.5">
              {isEditing ? 'Chỉnh Sửa Vị Trí Tuyển Dụng' : 'Tạo Vị Trí Tuyển Dụng Mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#8f8f8f] hover:text-[#171717] hover:bg-[#fafafa] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block font-mono text-[11px] font-medium text-[#171717] uppercase tracking-wider mb-1.5">
              Tiêu đề vị trí tuyển dụng <span className="text-[#ee0000]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Senior Backend Engineer (Node.js/NestJS)"
              className="w-full px-3 py-2 rounded-[6px] bg-white border border-[#ebebeb] text-[#171717] placeholder-[#8f8f8f] text-xs focus:outline-none focus:border-[#171717] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-medium text-[#171717] uppercase tracking-wider mb-1.5">
              Trạng thái tiếp nhận hồ sơ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full px-3 py-2 rounded-[6px] bg-white border border-[#ebebeb] text-[#171717] text-xs font-medium focus:outline-none focus:border-[#171717] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
            >
              <option value="OPEN">🟢 Đang mở ứng tuyển (OPEN)</option>
              <option value="CLOSED">🔴 Đã đóng ứng tuyển (CLOSED)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] font-medium text-[#171717] uppercase tracking-wider mb-1.5">
              Mô tả công việc (Job Description - JD) <span className="text-[#ee0000]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả trách nhiệm chính, sản phẩm tham gia phát triển, cơ cấu đội ngũ..."
              className="w-full px-3 py-2 rounded-[6px] bg-white border border-[#ebebeb] text-[#171717] placeholder-[#8f8f8f] text-xs focus:outline-none focus:border-[#171717] transition-colors leading-relaxed resize-y shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] font-medium text-[#171717] uppercase tracking-wider mb-1.5">
              Yêu cầu kỹ năng & Kinh nghiệm <span className="text-[#ee0000]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="VD: Tối thiểu 3 năm kinh nghiệm với Node.js, NestJS, PostgreSQL. Thành thạo Docker..."
              className="w-full px-3 py-2 rounded-[6px] bg-white border border-[#ebebeb] text-[#171717] placeholder-[#8f8f8f] text-xs focus:outline-none focus:border-[#171717] transition-colors leading-relaxed resize-y shadow-[0px_1px_1px_rgba(0,0,0,0.04)]"
            />
            <p className="font-mono text-[10px] text-[#8f8f8f] mt-1">
              // AI Agent sẽ dựa vào tiêu chí này để đối sánh và xếp hạng Match Score.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-[6px] bg-white hover:bg-[#fafafa] text-[#171717] border border-[#ebebeb] text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-[6px] bg-[#171717] hover:bg-[#333333] text-white text-xs font-medium border border-[#171717] transition-colors shadow-[0px_1px_1px_rgba(0,0,0,0.04)] disabled:opacity-50"
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
