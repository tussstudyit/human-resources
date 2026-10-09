'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, AlertCircle } from 'lucide-react';
import { formatFileSize, MAX_CV_SIZE } from '@/lib/recruitment-utils';

interface CvDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  disabled?: boolean;
}

export default function CvDropzone({
  file,
  onFileSelect,
  error,
  onErrorChange,
  disabled = false,
}: CvDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [multipleWarning, setMultipleWarning] = useState<string | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    setMultipleWarning(null);

    // 1. Kiểm tra file rỗng (0 bytes)
    if (selectedFile.size === 0) {
      const err = 'Tệp tải lên bị rỗng, vui lòng chọn tệp khác.';
      onErrorChange?.(err);
      return;
    }

    // 2. Kiểm tra dung lượng tối đa 10MB
    if (selectedFile.size > MAX_CV_SIZE) {
      const err = 'Dung lượng tệp tối đa là 10MB';
      onErrorChange?.(err);
      return;
    }

    // 3. Kiểm tra định dạng PDF
    const lowerName = selectedFile.name.toLowerCase();
    const isPdfExt = lowerName.endsWith('.pdf');
    const isPdfMime =
      !selectedFile.type ||
      selectedFile.type === 'application/pdf' ||
      selectedFile.type.includes('pdf');

    if (!isPdfExt || !isPdfMime) {
      const err = 'Chỉ chấp nhận tệp định dạng PDF (.pdf)';
      onErrorChange?.(err);
      return;
    }

    // Hợp lệ
    onErrorChange?.(null);
    onFileSelect(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setMultipleWarning('Đã chọn file đầu tiên (hệ thống chỉ nhận 1 file CV).');
    }

    validateAndSetFile(files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    validateAndSetFile(files[0]);
    // Reset value để có thể chọn lại cùng một file nếu vừa xóa
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onFileSelect(null);
    onErrorChange?.(null);
    setMultipleWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        tabIndex={-1}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Tải lên tệp CV PDF"
      />

      {/* Khi chưa chọn file */}
      {!file ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[12px] p-6 text-center cursor-pointer transition-all duration-200 ease-out outline-none ${
            disabled
              ? 'border-[#ebebeb] bg-slate-50 cursor-not-allowed opacity-60'
              : isDragging
              ? 'border-[#0070f3] bg-[#0070f3]/5'
              : error
              ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/60'
              : 'border-[#ebebeb] bg-[#fafafa] hover:bg-white hover:border-[#0070f3]/50 focus-ring'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`p-3 rounded-[10px] ${
                isDragging
                  ? 'bg-[#0070f3] text-white'
                  : 'bg-slate-100 text-[#475569]'
              } transition-colors duration-150`}
            >
              <UploadCloud className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#171717]">
                <span className="text-[#0070f3] underline underline-offset-2 hover:text-[#0051b3]">
                  Nhấn để chọn tệp
                </span>{' '}
                hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-[#64748B]">
                Chỉ chấp nhận tệp định dạng <span className="font-semibold text-[#475569]">PDF (.pdf)</span>, dung lượng tối đa <span className="font-semibold text-[#475569]">10MB</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Khi đã chọn file */
        <div className="p-3.5 sm:p-4 bg-white border border-[#ebebeb] rounded-[12px] shadow-[0px_1px_1px_rgba(0,0,0,0.04)] space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              <div className="h-10 w-10 rounded-[8px] bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#171717] truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5 font-mono">
                  {formatFileSize(file.size)} • PDF Document
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-2 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition duration-150 shrink-0 cursor-pointer focus-ring"
              title="Xóa tệp và chọn lại"
              aria-label="Xóa tệp và chọn lại"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Upload Progress Complete Bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8f8f8f] mb-1">
              <span className="text-emerald-700 font-medium">● ĐÃ NẠP TỆP VÀO BỘ NHỚ SẴN SÀNG</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-[#f2f2f2] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-full transition-all duration-300"></div>
            </div>
          </div>
        </div>
      )}

      {/* Cảnh báo thả nhiều file */}
      {multipleWarning && (
        <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{multipleWarning}</span>
        </p>
      )}

      {/* Thông báo lỗi định dạng/dung lượng */}
      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1.5 font-medium mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
