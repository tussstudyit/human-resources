'use client';

import React, { useState, useEffect } from 'react';
import { Job } from '@/types/topdev';
import { applyJob } from '@/lib/api/recruitment';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Send,
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (candidateName: string, jobTitle: string, appId: string) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [appId, setAppId] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFullName('');setEmail('');setPhone('');setSalaryExpectation('');setCoverNote('');
    setFile(null);setErrorMsg(null);setIsDone(false);setAppId('');
  }, [job.id, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Vui lòng chọn file CV định dạng PDF để AI Agent có thể phân tích chính xác.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng file CV vượt quá giới hạn 10MB.');
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!file) {
      setErrorMsg('Vui lòng đính kèm file CV định dạng PDF trước khi nộp hồ sơ.');
      return;
    }

    setIsSubmitting(true);

    try {
      const targetJobId = job.backendJobId || job.id;
      const res = await applyJob({
        jobId: targetJobId,
        name: fullName,
        email,
        phone,
        file_cv: file,
      });

      const generatedAppId = res.id ? `APP-${res.id.slice(0, 8).toUpperCase()}` : `APP-${Math.floor(100000 + Math.random() * 900000)}`;
      setAppId(generatedAppId);
      setIsDone(true);
      if (onSuccess) {
        onSuccess(fullName, job.title, generatedAppId);
      }
    } catch (err: any) {
      console.error('Lỗi khi nộp hồ sơ ứng tuyển:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi nộp hồ sơ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsDone(false);
    setErrorMsg(null);
    setFullName('');setEmail('');setPhone('');setSalaryExpectation('');setCoverNote('');setFile(null);setAppId('');
    onClose();
  };

  return (
    <section id="job-application" tabIndex={-1} aria-label="Biểu mẫu ứng tuyển" className="scroll-mt-24 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="relative w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar matching UpCareer brand */}
        <div className="px-6 py-4 bg-[#1E293B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#3B66F5] flex items-center justify-center font-bold text-white text-xs font-mono shadow-xs">
              UC
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Ứng tuyển vị trí này</h3>
              <p className="text-[11px] text-slate-300">Nền tảng tuyển dụng UpCareer Platform</p>
            </div>
          </div>

        </div>

        {isDone ? (
          /* Confirmation Success Screen matching tranghienthitimkiem */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h4 className="text-xl font-bold text-slate-900">
              Nộp Hồ Sơ Ứng Tuyển Thành Công!
            </h4>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Hồ sơ của bạn đã được chuyển trực tiếp đến bộ phận tuyển dụng của <strong className="text-slate-900">{job.company.name}</strong> và đưa vào quy trình thẩm định Gemini AI.
            </p>

            {/* Application Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/80">
                <span className="text-slate-500">Mã hồ sơ:</span>
                <span className="font-mono font-bold text-[#3B66F5] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {appId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vị trí:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[240px]">{job.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ứng viên:</span>
                <span className="font-semibold text-slate-800">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File CV đính kèm:</span>
                <span className="font-semibold text-emerald-700">{file?.name || 'cv_ung_tuyen.pdf'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Đã tiếp nhận CSDL & Gửi AI
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#3B66F5] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Hoàn tất & Quay lại xem việc làm
              </button>
            </div>
          </div>
        ) : (
          /* Application Form matching tranghienthitimkiem */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Target Job Callout */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 shrink-0 text-xs font-mono shadow-2xs">
                {job.company.logoText || 'UC'}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                  {job.title}
                </h4>
                <div className="text-xs text-slate-600 mt-0.5">
                  {job.company.name} · <span className="text-[#E11D48] font-bold">{job.salary.display}</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="application-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input id="application-name" autoComplete="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3B66F5]/20 focus:border-[#3B66F5] outline-none"
                />
              </div>

              <div>
                <label htmlFor="application-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input id="application-phone" autoComplete="tel"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3B66F5]/20 focus:border-[#3B66F5] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="application-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email liên hệ <span className="text-red-500">*</span>
                </label>
                <input id="application-email" autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: email@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3B66F5]/20 focus:border-[#3B66F5] outline-none"
                />
              </div>

              <div>
                <label htmlFor="application-salary" className="block text-xs font-bold text-slate-700 mb-1">
                  Mức lương mong muốn
                </label>
                <input id="application-salary"
                  type="text"
                  value={salaryExpectation}
                  onChange={(e) => setSalaryExpectation(e.target.value)}
                  placeholder="Thương lượng hoặc nhập số cụ thể"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3B66F5]/20 focus:border-[#3B66F5] outline-none"
                />
              </div>
            </div>

            {/* CV Upload Box with PDF Requirement */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Đính kèm hồ sơ CV <span className="text-red-500">*</span></span>
                <span className="text-[11px] text-slate-500 font-normal">Định dạng PDF (tối đa 10MB)</span>
              </label>

              <div className="relative border-2 border-dashed border-slate-300 hover:border-[#3B66F5] rounded-xl p-4 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  aria-label="Tải lên tệp CV PDF"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  {file ? (
                    <>
                      <FileText className="w-7 h-7 text-emerald-600" />
                      <div className="text-xs font-bold text-slate-900 truncate max-w-xs">{file.name}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Sẵn sàng gửi
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-slate-400" />
                      <div className="text-xs font-bold text-slate-800">
                        Kéo thả file CV của bạn vào đây hoặc <span className="text-[#3B66F5]">chọn từ máy tính</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Bắt buộc file định dạng PDF chuẩn để AI phân tích kỹ năng
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Note */}
            <div>
              <label htmlFor="application-cover" className="block text-xs font-bold text-slate-700 mb-1">
                Thư giới thiệu / Lời nhắn tới nhà tuyển dụng (Cover Letter)
              </label>
              <textarea id="application-cover"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tóm tắt ngắn gọn lý do bạn phù hợp với vị trí này..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3B66F5]/20 focus:border-[#3B66F5] outline-none resize-none"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Xem lại mô tả công việc
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#3B66F5] hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang nộp hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi hồ sơ ứng tuyển</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
};
