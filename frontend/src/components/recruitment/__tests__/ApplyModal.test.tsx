import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplyModal from '../ApplyModal';
import { JobPost } from '@/types/recruitment';
import * as recruitmentApi from '@/lib/api/recruitment';
import { useToastStore } from '@/store/useToastStore';

const mockJob: JobPost = {
  id: 'job-123',
  title: 'Senior Software Engineer',
  description: 'Mô tả công việc kỹ thuật phần mềm cao cấp.',
  requirements: 'React, TypeScript, Node.js',
  status: 'OPEN',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  department: 'Kỹ thuật & Công nghệ',
};

describe('ApplyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('không render khi isOpen là false', () => {
    const { container } = render(
      <ApplyModal job={mockJob} isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('render đầy đủ thông tin vị trí tuyển dụng và các trường trong form', () => {
    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ungvien@gmail.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i })).toBeInTheDocument();
  });

  describe('B3: Honeypot chống bot ngầm', () => {
    it('ghi log console.warn khi bot kích hoạt honeypot ở môi trường development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      // Bot điền trường honeypot website_url
      const honeypotInput = screen.getByLabelText(/Website URL/i);
      fireEvent.change(honeypotInput, { target: { value: 'https://spam-bot.com' } });

      const form = honeypotInput.closest('form')!;
      fireEvent.submit(form);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Honeypot Triggered]'),
        expect.objectContaining({ honeypotValue: 'https://spam-bot.com' })
      );
      warnSpy.mockRestore();
    });

    it('KHÔNG ghi log console.warn khi bot kích hoạt honeypot ở môi trường production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      const honeypotInput = screen.getByLabelText(/Website URL/i);
      fireEvent.change(honeypotInput, { target: { value: 'https://spam-bot.com' } });

      const form = honeypotInput.closest('form')!;
      fireEvent.submit(form);

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('B4: Xử lý lỗi 409 Conflict', () => {
    it('hiển thị inline alert chính xác câu thông báo và KHÔNG gọi showToast khi nhận HTTP 409 (test bắt buộc)', async () => {
      // Mock applyJob reject với status 409
      vi.spyOn(recruitmentApi, 'applyJob').mockRejectedValueOnce({
        status: 409,
        message: 'You have already applied for this job',
      });

      const showToastSpy = vi.spyOn(useToastStore.getState(), 'showToast');

      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      // Điền form hợp lệ
      const nameInput = screen.getByPlaceholderText('Nguyễn Văn A');
      const emailInput = screen.getByPlaceholderText('ungvien@gmail.com');
      const fileInput = screen.getByLabelText(/Tải lên tệp CV PDF/i);

      fireEvent.change(nameInput, { target: { value: 'Nguyễn Văn Ứng Viên' } });
      fireEvent.change(emailInput, { target: { value: 'ungvien.duplicate@gmail.com' } });

      const validPdf = new File(['%PDF-1.4 mock cv'], 'cv.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(fileInput, validPdf);

      const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
      fireEvent.click(submitBtn);

      // Assert xuất hiện câu thông báo 409 inline chính xác
      await waitFor(() => {
        expect(
          screen.getByText(
            'Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi. Hệ thống đã lưu trữ thông tin của bạn.'
          )
        ).toBeInTheDocument();
      });

      // Assert KHÔNG gọi showToast
      expect(showToastSpy).not.toHaveBeenCalled();
    });
  });

  it('gửi hồ sơ thành công gọi applyJob và hiển thị toast chúc mừng', async () => {
    vi.spyOn(recruitmentApi, 'applyJob').mockResolvedValueOnce({
      success: true,
      id: 'candidate-new-id',
    });

    render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText('Nguyễn Văn A');
    const emailInput = screen.getByPlaceholderText('ungvien@gmail.com');
    const fileInput = screen.getByLabelText(/Tải lên tệp CV PDF/i);

    fireEvent.change(nameInput, { target: { value: 'Trần Thị B' } });
    fireEvent.change(emailInput, { target: { value: 'tranthib@gmail.com' } });

    const validPdf = new File(['%PDF-1.4 mock'], 'candidate_cv.pdf', {
      type: 'application/pdf',
    });
    await userEvent.upload(fileInput, validPdf);

    const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Ứng tuyển thành công!')).toBeInTheDocument();
    });
  });

  describe('Khóa scroll body (Scroll lock)', () => {
    it('khôi phục overflow ban đầu khác rỗng (scroll) khi modal đóng và khi unmount', () => {
      document.body.style.overflow = 'scroll';

      const { rerender, unmount } = render(
        <ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ApplyModal job={mockJob} isOpen={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('scroll');

      // Mở lại rồi unmount
      rerender(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('scroll');
    });
  });

  describe('Bảo đảm Focus trap và phím Tab', () => {
    it('userEvent.tab() đi vòng qua các focusable, bỏ qua honeypot, bỏ qua nút bị disabled, và wrap vòng đầu-cuối', async () => {
      const user = userEvent.setup();
      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByLabelText('Đóng cửa sổ');
      const nameInput = screen.getByPlaceholderText('Nguyễn Văn A');
      const emailInput = screen.getByPlaceholderText('ungvien@gmail.com');
      const phoneInput = screen.getByPlaceholderText('0912 345 678');
      const dropzoneBtn = screen.getByRole('button', { name: /Nhấn để chọn tệp/i });
      const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
      const honeypotInput = screen.getByLabelText(/Website URL/i);

      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);

      await user.tab();
      expect(document.activeElement).toBe(nameInput);

      await user.tab();
      expect(document.activeElement).toBe(emailInput);

      await user.tab();
      expect(document.activeElement).toBe(phoneInput);

      // Đi qua honeypot? Honeypot không bao giờ nhận focus
      await user.tab();
      expect(document.activeElement).toBe(dropzoneBtn);
      expect(document.activeElement).not.toBe(honeypotInput);

      await user.tab();
      expect(document.activeElement).toBe(submitBtn);

      // Đang ở phần tử cuối cùng: Tab -> vòng lại phần tử đầu tiên (closeBtn)
      await user.tab();
      expect(document.activeElement).toBe(closeBtn);

      // Đang ở phần tử đầu tiên: Shift + Tab -> vòng lại phần tử cuối cùng (submitBtn)
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(submitBtn);
    });

    it('focus trap bỏ qua nút bị disabled', async () => {
      const user = userEvent.setup();
      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      const dropzoneBtn = screen.getByRole('button', { name: /Nhấn để chọn tệp/i });
      const submitBtn = screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i });
      const closeBtn = screen.getByLabelText('Đóng cửa sổ');

      // Disable nút submit
      submitBtn.setAttribute('disabled', 'true');

      // Focus vào dropzoneBtn
      dropzoneBtn.focus();
      expect(document.activeElement).toBe(dropzoneBtn);

      // Tab từ dropzoneBtn -> vì submitBtn disabled, focus trap phải vòng về phần tử đầu (closeBtn)
      await user.tab();
      expect(document.activeElement).toBe(closeBtn);
    });
  });

  describe('Xử lý lỗi HTTP 400 và 413 từ backend', () => {
    it('hiển thị inline alert khi nhận lỗi 413 (Payload Too Large) và KHÔNG gọi showToast', async () => {
      vi.spyOn(recruitmentApi, 'applyJob').mockRejectedValueOnce({
        status: 413,
        message: 'Payload Too Large',
      });

      const showToastSpy = vi.spyOn(useToastStore.getState(), 'showToast');
      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
        target: { value: 'Lê Văn C' },
      });
      fireEvent.change(screen.getByPlaceholderText('ungvien@gmail.com'), {
        target: { value: 'levanc@gmail.com' },
      });

      const validPdf = new File(['%PDF-1.4 mock cv'], 'large_cv.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(screen.getByLabelText(/Tải lên tệp CV PDF/i), validPdf);

      fireEvent.click(screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Tệp quá lớn, vui lòng chọn tệp nhỏ hơn 10MB.')
        ).toBeInTheDocument();
      });

      expect(showToastSpy).not.toHaveBeenCalled();
    });

    it('hiển thị inline alert khi nhận lỗi 400 (Bad Request) với message từ backend và KHÔNG gọi showToast', async () => {
      vi.spyOn(recruitmentApi, 'applyJob').mockRejectedValueOnce({
        status: 400,
        message: 'Dữ liệu hồ sơ không hợp lệ hoặc thiếu thông tin.',
      });

      const showToastSpy = vi.spyOn(useToastStore.getState(), 'showToast');
      render(<ApplyModal job={mockJob} isOpen={true} onClose={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), {
        target: { value: 'Phạm Văn D' },
      });
      fireEvent.change(screen.getByPlaceholderText('ungvien@gmail.com'), {
        target: { value: 'phamvand@gmail.com' },
      });

      const validPdf = new File(['%PDF-1.4 mock cv'], 'cv.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(screen.getByLabelText(/Tải lên tệp CV PDF/i), validPdf);

      fireEvent.click(screen.getByRole('button', { name: /Nộp hồ sơ ứng tuyển/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Dữ liệu hồ sơ không hợp lệ hoặc thiếu thông tin.')
        ).toBeInTheDocument();
      });

      expect(showToastSpy).not.toHaveBeenCalled();
    });
  });
});
