import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickApplyModal } from '../QuickApplyModal';
import { Job } from '@/types/topdev';
import * as recruitmentApi from '@/lib/api/recruitment';

const mockTopDevJob: Job = {
  id: 'mock-job-1',
  backendJobId: 'backend-uuid-1234',
  isRealFromBackend: true,
  title: 'Senior Frontend Engineer (React/Next.js)',
  company: {
    id: 'comp-1',
    name: 'TechCorp Vietnam',
    logo: 'https://example.com/logo.png',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    address: '123 Nguyễn Huệ, Quận 1',
    size: '100 - 500',
    industry: 'Phần mềm',
    verified: true,
  },
  salary: {
    display: '2,500 - 3,500 USD',
    currency: 'USD',
  },
  location: 'Hồ Chí Minh',
  workType: 'Hybrid',
  level: 'Senior',
  experienceYears: '4 - 7 năm kinh nghiệm',
  skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  postedTime: '1 ngày trước',
  viewsCount: 350,
  applicantsCount: 15,
  description: ['Phát triển tính năng Frontend ứng dụng Next.js'],
  requirements: ['Kinh nghiệm 4+ năm với React và Next.js'],
  benefits: ['Lương tháng 13, bảo hiểm sức khỏe'],
  techStackDetails: {
    primary: ['React', 'Next.js'],
    secondary: ['TypeScript', 'Tailwind CSS'],
  },
};

describe('QuickApplyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('không render khi isOpen là false hoặc job là null', () => {
    const { container: c1 } = render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={false}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <QuickApplyModal
        job={null}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('render tiêu đề vị trí và tên công ty khi isOpen là true', () => {
    render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Ứng Tuyển Nhanh')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer (React/Next.js)')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Vietnam')).toBeInTheDocument();
  });

  it('từ chối file không phải định dạng PDF', async () => {
    render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const fakeImageFile = new File(['image_content'], 'avatar.png', {
      type: 'image/png',
    });

    fireEvent.change(fileInput, { target: { files: [fakeImageFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(/Hệ thống chỉ chấp nhận file hồ sơ định dạng PDF/i)
      ).toBeInTheDocument();
    });
  });

  it('từ chối file PDF vượt quá 10MB', async () => {
    render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const hugePdf = new File(['dummy'], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(hugePdf, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [hugePdf] } });

    await waitFor(() => {
      expect(
        screen.getByText(/Dung lượng CV không được vượt quá 10MB/i)
      ).toBeInTheDocument();
    });
  });

  it('gửi hồ sơ thành công và gọi applyJob với đúng tham số khi hợp lệ', async () => {
    const applySpy = vi.spyOn(recruitmentApi, 'applyJob').mockResolvedValue({
      success: true,
      id: 'app-98765-uuid',
    });
    const handleSuccess = vi.fn();

    render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={handleSuccess}
      />
    );

    // Điền form
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Nguyễn Văn An/i), {
      target: { value: 'Trần Văn Tester' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: 0987 654 321/i), {
      target: { value: '0901234567' },
    });
    fireEvent.change(screen.getByPlaceholderText(/nguyenvanan.dev@gmail.com/i), {
      target: { value: 'tester@dev.vn' },
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validPdf = new File(['%PDF-1.5 test cv content'], 'my_cv.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [validPdf] } });

    const submitBtn = screen.getByRole('button', { name: /Nộp Hồ Sơ Ngay/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(applySpy).toHaveBeenCalledWith({
        jobId: 'backend-uuid-1234',
        name: 'Trần Văn Tester',
        email: 'tester@dev.vn',
        phone: '0901234567',
        file_cv: validPdf,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Ứng tuyển thành công!')).toBeInTheDocument();
      expect(handleSuccess).toHaveBeenCalledWith(
        'Senior Frontend Engineer (React/Next.js)',
        'TechCorp Vietnam'
      );
    });
  });

  it('hiển thị thông báo lỗi khi API nộp hồ sơ bị lỗi', async () => {
    vi.spyOn(recruitmentApi, 'applyJob').mockRejectedValue(
      new Error('Bạn đã nộp hồ sơ vào vị trí này gần đây, vui lòng chờ phản hồi.')
    );

    render(
      <QuickApplyModal
        job={mockTopDevJob}
        isOpen={true}
        onClose={vi.fn()}
        onApplySuccess={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Nguyễn Văn An/i), {
      target: { value: 'Lê Văn Lỗi' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ví dụ: 0987 654 321/i), {
      target: { value: '0912345678' },
    });
    fireEvent.change(screen.getByPlaceholderText(/nguyenvanan.dev@gmail.com/i), {
      target: { value: 'error@dev.vn' },
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validPdf = new File(['%PDF-1.5 cv'], 'cv.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validPdf] } });

    const submitBtn = screen.getByRole('button', { name: /Nộp Hồ Sơ Ngay/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Bạn đã nộp hồ sơ vào vị trí này gần đây/i)
      ).toBeInTheDocument();
    });
  });
});
