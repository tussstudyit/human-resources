'use client';

import React, { useState, useEffect, useRef } from 'react';
import { JobPost, ApplyApiError } from '@/types/recruitment';
import { applyJob } from '@/lib/api/recruitment';
import { useToastStore } from '@/store/useToastStore';
import CvDropzone from './CvDropzone';
import {
  X,
  User,
  Mail,
  Phone,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

interface ApplyModalProps {
  job: JobPost | null;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export default function ApplyModal({
  job,
  isOpen,
  onClose,
  triggerRef,
}: ApplyModalProps) {
  const { showToast } = useToastStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fileCv, setFileCv] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState(''); // Chống bot (hidden)

  const [cvError, setCvError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineConflict, setInlineConflict] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setFileCv(null);
    setHoneypot('');
    setCvError(null);
    setInlineError(null);
    setInlineConflict(false);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Accessibility: Khóa scroll body, đóng bằng phím ESC, focus trap
  useEffect(() => {
    if (!isOpen) return;

    const triggerEl = triggerRef?.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const candidateElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          )
        );

        // Lọc bỏ phần tử có tabindex="-1" hoặc nằm trong vùng aria-hidden="true" (như honeypot)
        const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent?.includes('jsdom');
        const focusableElements = candidateElements.filter((el) => {
          if (el.getAttribute('tabindex') === '-1') return false;
          if (el.closest('[aria-hidden="true"]')) return false;
          if (el.classList.contains('hidden') || el.style.display === 'none') return false;
          if (isJsdom) return true;
          return el.offsetParent !== null || el.getClientRects().length > 0;
        });

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Tự động focus vào ô họ tên khi mở modal
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      // Trả lại focus cho nút đã mở modal
      triggerEl?.focus();
    };
  }, [isOpen, onClose, triggerRef]);

  // Tự động đóng modal sau 2.5s khi thành công
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [isSuccess, onClose]);

  if (!isOpen || !job) return null;

  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber) return true;
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);
    setInlineConflict(false);

    // Chống bot (Honeypot check)
    if (honeypot.trim() !== '') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Honeypot Triggered] Phát hiện bot nộp form ngầm:', {
          honeypotValue: honeypot,
        });
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        showToast({
          type: 'success',
          title: 'Nộp hồ sơ thành công!',
          message: 'AI Recruitment Agent đang phân tích CV của bạn.',
        });
      }, 800);
      return;
    }

    // Validation cơ bản
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      setInlineError('Vui lòng nhập họ và tên.');
      nameInputRef.current?.focus();
      return;
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setInlineError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (phone.trim() && !validatePhone(phone)) {
      setInlineError('Số điện thoại không hợp lệ (Ví dụ: 0912345678 hoặc +84912345678).');
      return;
    }

    if (!fileCv) {
      setCvError('Vui lòng tải lên tệp CV định dạng PDF.');
      return;
    }

    setIsSubmitting(true);

    try {
      await applyJob({
        jobId: job.id,
        name: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        file_cv: fileCv,
      });

      // Thành công (HTTP 201)
      setIsSuccess(true);
      showToast({
        type: 'success',
        title: 'Nộp hồ sơ thành công!',
        message: 'AI Recruitment Agent đã tiếp nhận và đang tiến hành chấm điểm CV.',
      });
    } catch (err: unknown) {
      const apiErr = err as ApplyApiError;

      if (apiErr.status === 409) {
        // 409 Conflict: Hiển thị INLINE nổi bật, KHÔNG bắn toast
        setInlineConflict(true);
      } else if (apiErr.status === 429) {
        // 429 Rate Limit
        showToast({
          type: 'warning',
          title: 'Thao tác quá nhanh',
          message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.',
        });
      } else if (apiErr.status === 413) {
        // 413 Payload Too Large
        setInlineError('Tệp quá lớn, vui lòng chọn tệp nhỏ hơn 10MB.');
      } else if (apiErr.status === 400) {
        // 400 Bad Request
        setInlineError(apiErr.message || 'Dữ liệu hoặc tệp không hợp lệ.');
      } else {
        // 5xx / Network Error
        showToast({
          type: 'error',
          title: 'Lỗi máy chủ',
          message: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.',
        });
        setInlineError('Không thể hoàn tất gửi hồ sơ lúc này. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 overflow-hidden transition-all my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Đóng cửa sổ"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Màn hình thành công */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                Ứng tuyển thành công!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Hồ sơ của bạn cho vị trí <span className="font-bold text-slate-800">{job.title}</span> đã được ghi nhận. AI Recruitment Agent sẽ tự động chấm điểm kỹ năng và liên hệ với bạn qua email.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Đóng thông báo
              </button>
            </div>
          </div>
        ) : (
          /* Form nộp hồ sơ */
          <>
            {/* Header modal */}
            <div className="mb-5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold mb-2">
                <Briefcase className="h-3 w-3" />
                <span>Nộp hồ sơ ứng tuyển</span>
              </div>
              <h3
                id="apply-modal-title"
                className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug"
              >
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vui lòng điền thông tin và tải lên CV dạng PDF để hệ thống AI đánh giá.
              </p>
            </div>

            {/* Thông báo lỗi 409 Conflict INLINE nổi bật */}
            {inlineConflict && (
              <div
                role="alert"
                className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 flex items-start space-x-3 text-xs shadow-xs animate-in slide-in-from-top-2 duration-200"
              >
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-900">Không thể gửi lại hồ sơ</p>
                  <p className="leading-relaxed">
                    Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi. Hệ thống đã lưu trữ thông tin của bạn.
                  </p>
                </div>
              </div>
            )}

            {/* Thông báo lỗi chung INLINE */}
            {inlineError && !inlineConflict && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2.5 text-xs animate-in slide-in-from-top-1 duration-150"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{inlineError}</span>
              </div>
            )}

            {/* Nội dung form cuộn được nếu màn hình nhỏ */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Honeypot field ẩn chống bot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website_url">Website URL</label>
                <input
                  id="website_url"
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Trường họ tên */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Trường email */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email liên hệ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ungvien@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Trường số điện thoại (tuỳ chọn) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Số điện thoại <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    disabled={isSubmitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Khu vực upload CV */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Đính kèm CV (PDF) <span className="text-rose-500">*</span>
                </label>
                <CvDropzone
                  file={fileCv}
                  onFileSelect={setFileCv}
                  error={cvError}
                  onErrorChange={setCvError}
                  disabled={isSubmitting}
                />
              </div>

              {/* Nút Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang nộp hồ sơ & gửi AI xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Nộp hồ sơ ứng tuyển</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
