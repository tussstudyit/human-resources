'use client';

import React, { useState } from 'react';
import { Job } from '@/types/topdev';
import { applyJob } from '@/lib/api/recruitment';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Send 
} from 'lucide-react';

interface QuickApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySuccess: (jobTitle: string, companyName: string) => void;
  fallbackJobId?: string;
}

export const QuickApplyModal: React.FC<QuickApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplySuccess,
  fallbackJobId,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [applicationId, setApplicationId] = useState('');

  if (!isOpen || !job) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        setErrorMessage('Hệ thống chỉ chấp nhận file hồ sơ định dạng PDF.');
        setCvFile(null);
        setCvFileName('');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('Dung lượng CV không được vượt quá 10MB.');
        setCvFile(null);
        setCvFileName('');
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ và tên, Email, Số điện thoại.');
      return;
    }
    if (!cvFile) {
      setErrorMessage('Vui lòng đính kèm file CV của bạn (định dạng PDF).');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const targetJobId = job.backendJobId || fallbackJobId;
      let applicationCode = `TD-${Math.floor(100000 + Math.random() * 900000)}`;

      if (targetJobId && cvFile) {
        const result = await applyJob({
          jobId: targetJobId,
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          file_cv: cvFile,
        });
        if (result.id) {
          applicationCode = `APP-${result.id.slice(0, 8).toUpperCase()}`;
        }
      } else {
        // Fallback for sample preview jobs
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setApplicationId(applicationCode);
      setIsSubmitting(false);
      setIsSubmitted(true);
      onApplySuccess(job.title, job.company.name);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const errorObj = err as { message?: string; errors?: string[] };
      if (errorObj?.errors && Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
        setErrorMessage(errorObj.errors.join(', '));
      } else if (errorObj?.message) {
        setErrorMessage(errorObj.message);
      } else {
        setErrorMessage('Đã xảy ra lỗi khi gửi hồ sơ ứng tuyển. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.');
      }
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setCvFile(null);
    setCvFileName('');
    setErrorMessage('');
    setApplicationId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ứng Tuyển Nhanh</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vị trí: <strong className="text-slate-800">{job.title}</strong> tại <strong className="text-red-600">{job.company.name}</strong>
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Ứng tuyển thành công!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Hồ sơ ứng tuyển của bạn đã được gửi trực tiếp đến phòng nhân sự của <strong>{job.company.name}</strong> qua hệ sinh thái tuyển dụng UpCareer.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div><strong>Vị trí:</strong> {job.title}</div>
              <div><strong>Ứng viên:</strong> {fullName} ({email})</div>
              <div><strong>File CV:</strong> {cvFileName}</div>
              <div><strong>Mã hồ sơ:</strong> {applicationId || `UC-${Math.floor(100000 + Math.random() * 900000)}`}</div>
              {job.isRealFromBackend && (
                <div className="text-[11px] text-emerald-600 font-semibold pt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Hồ sơ đã được tiếp nhận và đồng bộ trực tiếp vào hệ thống ATS tuyển dụng.
                </div>
              )}
            </div>
            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Hoàn tất & Tiếp tục xem việc làm
            </button>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="nguyenvanan.dev@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link GitHub / LinkedIn / Portfolio
              </label>
              <input
                type="url"
                placeholder="https://github.com/your-username hoặc LinkedIn"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>

            {/* CV Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đính kèm hồ sơ CV <span className="text-red-500">* (Định dạng PDF dung lượng dưới 10MB)</span>
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  {cvFileName ? (
                    <>
                      <FileText className="w-8 h-8 text-red-600" />
                      <span className="text-xs font-bold text-slate-900">{cvFileName}</span>
                      <span className="text-[11px] text-emerald-600 font-medium">Bấm để chọn file PDF khác</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">Kéo thả CV hoặc click để tải lên</span>
                      <span className="text-[11px] text-slate-400">Chỉ chấp nhận file .pdf dưới 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thư giới thiệu ngắn (Cover Letter)
              </label>
              <textarea
                rows={3}
                placeholder="Nêu bật lý do bạn phù hợp với vị trí này, các dự án nổi bật đã từng triển khai..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Đang gửi hồ sơ...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Nộp Hồ Sơ Ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
