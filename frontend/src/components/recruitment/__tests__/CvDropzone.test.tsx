import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CvDropzone from '../CvDropzone';

describe('CvDropzone', () => {
  it('hiển thị giao diện kéo thả mặc định khi chưa chọn tệp', () => {
    render(<CvDropzone file={null} onFileSelect={vi.fn()} />);

    expect(screen.getByText(/Nhấn để chọn tệp/i)).toBeInTheDocument();
    expect(screen.getByText(/Chỉ chấp nhận tệp định dạng/i)).toBeInTheDocument();
    expect(screen.getByText('10MB')).toBeInTheDocument();
  });

  it('báo lỗi khi tệp tải lên bị rỗng (0 bytes) với câu thông báo chính xác (test bắt buộc)', async () => {
    const handleFileSelect = vi.fn();
    const handleErrorChange = vi.fn();

    render(
      <CvDropzone
        file={null}
        onFileSelect={handleFileSelect}
        onErrorChange={handleErrorChange}
      />
    );

    const emptyFile = new File([''], 'empty-resume.pdf', {
      type: 'application/pdf',
    });

    const input = screen.getByLabelText(/Tải lên tệp CV PDF/i);
    await userEvent.upload(input, emptyFile);

    expect(handleErrorChange).toHaveBeenCalledWith(
      'Tệp tải lên bị rỗng, vui lòng chọn tệp khác.'
    );
    expect(handleFileSelect).not.toHaveBeenCalled();
  });

  it('báo lỗi khi dung lượng tệp vượt quá 10MB', async () => {
    const handleFileSelect = vi.fn();
    const handleErrorChange = vi.fn();

    render(
      <CvDropzone
        file={null}
        onFileSelect={handleFileSelect}
        onErrorChange={handleErrorChange}
      />
    );

    // Tạo file 11MB
    const largeContent = new Uint8Array(11 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large-resume.pdf', {
      type: 'application/pdf',
    });

    const input = screen.getByLabelText(/Tải lên tệp CV PDF/i);
    await userEvent.upload(input, largeFile);

    expect(handleErrorChange).toHaveBeenCalledWith('Dung lượng tệp tối đa là 10MB');
    expect(handleFileSelect).not.toHaveBeenCalled();
  });

  it('chấp nhận file đúng kích thước MAX_CV_SIZE (10MB) và từ chối file MAX_CV_SIZE + 1 byte (test biên bắt buộc)', async () => {
    const handleFileSelect = vi.fn();
    const handleErrorChange = vi.fn();

    render(
      <CvDropzone
        file={null}
        onFileSelect={handleFileSelect}
        onErrorChange={handleErrorChange}
      />
    );

    const input = screen.getByLabelText(/Tải lên tệp CV PDF/i);

    // 1. File đúng 10 * 1024 * 1024 bytes (10MB)
    const exact10MbFile = new File(['%PDF-1.4 dummy'], 'exact-10mb.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(exact10MbFile, 'size', {
      value: 10 * 1024 * 1024,
    });

    await userEvent.upload(input, exact10MbFile);
    expect(handleErrorChange).toHaveBeenCalledWith(null);
    expect(handleFileSelect).toHaveBeenCalledWith(exact10MbFile);

    // 2. File 10 * 1024 * 1024 + 1 bytes (vượt 1 byte)
    const over1ByteFile = new File(['%PDF-1.4 dummy'], 'over-10mb.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(over1ByteFile, 'size', {
      value: 10 * 1024 * 1024 + 1,
    });

    await userEvent.upload(input, over1ByteFile);
    expect(handleErrorChange).toHaveBeenCalledWith('Dung lượng tệp tối đa là 10MB');
  });

  it('báo lỗi khi định dạng tệp không phải PDF', () => {
    const handleFileSelect = vi.fn();
    const handleErrorChange = vi.fn();

    render(
      <CvDropzone
        file={null}
        onFileSelect={handleFileSelect}
        onErrorChange={handleErrorChange}
      />
    );

    const docxFile = new File(['dummy doc content'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const input = screen.getByLabelText(/Tải lên tệp CV PDF/i);
    fireEvent.change(input, { target: { files: [docxFile] } });

    expect(handleErrorChange).toHaveBeenCalledWith(
      'Chỉ chấp nhận tệp định dạng PDF (.pdf)'
    );
    expect(handleFileSelect).not.toHaveBeenCalled();
  });

  it('chấp nhận tệp PDF hợp lệ và kích hoạt callback onFileSelect', async () => {
    const handleFileSelect = vi.fn();
    const handleErrorChange = vi.fn();

    render(
      <CvDropzone
        file={null}
        onFileSelect={handleFileSelect}
        onErrorChange={handleErrorChange}
      />
    );

    const validPdf = new File(['%PDF-1.4 dummy content'], 'my-cv.pdf', {
      type: 'application/pdf',
    });

    const input = screen.getByLabelText(/Tải lên tệp CV PDF/i);
    await userEvent.upload(input, validPdf);

    expect(handleErrorChange).toHaveBeenCalledWith(null);
    expect(handleFileSelect).toHaveBeenCalledWith(validPdf);
  });

  it('hiển thị thông tin tệp và cho phép xóa tệp khi đã chọn', () => {
    const handleFileSelect = vi.fn();
    const validPdf = new File(['%PDF-1.4 dummy content'], 'developer-cv.pdf', {
      type: 'application/pdf',
    });

    render(<CvDropzone file={validPdf} onFileSelect={handleFileSelect} />);

    expect(screen.getByText('developer-cv.pdf')).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /Xóa tệp và chọn lại/i });
    fireEvent.click(deleteBtn);

    expect(handleFileSelect).toHaveBeenCalledWith(null);
  });
});
