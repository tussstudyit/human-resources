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
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 outline-none ${
            disabled
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              : isDragging
              ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
              : error
              ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/60'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className={`p-3 rounded-2xl ${
                isDragging
                  ? 'bg-indigo-600 text-white animate-bounce'
                  : 'bg-indigo-50 text-indigo-600'
              } transition-colors`}
            >
              <UploadCloud className="h-6 w-6" />
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-800">
                <span className="text-indigo-600 hover:underline">Nhấn để chọn tệp</span> hoặc kéo thả vào đây
              </p>
              <p className="text-xs text-slate-500">
                Chỉ chấp nhận tệp định dạng <span className="font-semibold text-slate-700">PDF (.pdf)</span>, dung lượng tối đa <span className="font-semibold text-slate-700">10MB</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Khi đã chọn file */
        <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl">
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="h-11 w-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-xs">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {formatFileSize(file.size)} • PDF Document
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
            title="Xóa tệp và chọn lại"
            aria-label="Xóa tệp và chọn lại"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
