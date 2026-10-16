import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TopDevPortalClient } from '../TopDevPortalClient';
import { JobPost } from '@/types/recruitment';

const mockBackendJobs: JobPost[] = [
  {
    id: 'backend-job-abc',
    title: 'Lead Cloud Architect (AWS/Kubernetes)',
    description: 'Chịu trách nhiệm kiến trúc hệ thống cloud phân tán chịu tải cao.',
    requirements: 'AWS, Kubernetes, Terraform, Docker, Go',
    status: 'OPEN',
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-10T08:00:00.000Z',
    department: 'Cloud & Infrastructure',
    _count: { candidates: 4 },
  },
];

describe('TopDevPortalClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('render giao diện TopDev đầy đủ bao gồm Header, HeroSearch, danh sách việc làm và Tab bộ lọc', () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    // Kiểm tra các phần cốt lõi của giao diện TopDev
    expect(screen.getByText('Cơ Hội Việc Làm IT Nổi Bật')).toBeInTheDocument();
    expect(screen.getByText(/1 vị trí tuyển trực tiếp/i)).toBeInTheDocument();
    expect(screen.getByText('Lead Cloud Architect (AWS/Kubernetes)')).toBeInTheDocument();
  });

  it('lọc công việc theo từ khóa tìm kiếm trong ô HeroSearch', async () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    const searchInput = screen.getByPlaceholderText(/Vị trí, kỹ năng/i);
    expect(searchInput).toBeInTheDocument();

    // Nhập từ khóa "Kubernetes"
    fireEvent.change(searchInput, { target: { value: 'Kubernetes' } });

    await waitFor(() => {
      expect(screen.getByText('Lead Cloud Architect (AWS/Kubernetes)')).toBeInTheDocument();
    });

    // Nhập từ khóa không tồn tại
    fireEvent.change(searchInput, { target: { value: 'NonExistentSkillXYZ123' } });

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy việc làm phù hợp')).toBeInTheDocument();
    });
  });

  it('chuyển tab bộ lọc (Nổi bật, Tuyển gấp, Lương cao, Hybrid / Remote)', async () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    const remoteTab = screen.getByRole('button', { name: /Hybrid \/ Remote/i });
    fireEvent.click(remoteTab);

    // Tab đang active
    expect(remoteTab).toHaveClass('bg-red-600');
  });

  it('mở modal chi tiết khi click "Xem chi tiết JD"', async () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    const detailButtons = screen.getAllByText('Xem chi tiết JD');
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Mô tả công việc')).toBeInTheDocument();
      expect(screen.getByText('Yêu cầu ứng viên')).toBeInTheDocument();
    });
  });

  it('mở modal ứng tuyển khi click "Ứng tuyển ngay"', async () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    const applyButtons = screen.getAllByText('Ứng tuyển ngay');
    fireEvent.click(applyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Ứng Tuyển Nhanh')).toBeInTheDocument();
      expect(screen.getByText('Đính kèm hồ sơ CV')).toBeInTheDocument();
    });
  });

  it('đẩy history.pushState khi xem chi tiết JD và quay lại khi nhận sự kiện popstate của trình duyệt', async () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    // Click xem chi tiết
    const detailButtons = screen.getAllByText('Xem chi tiết JD');
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 'backend-job-abc', view: 'detail' }),
        '',
        '/jobs/backend-job-abc'
      );
      expect(screen.getByText('Quay lại danh sách việc làm')).toBeInTheDocument();
    });

    // Giả lập người dùng bấm nút Quay lại (Back) trên thanh điều hướng trình duyệt (bắn popstate về '/')
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname: '/', href: 'http://localhost:3000/' },
    });
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

    await waitFor(() => {
      expect(screen.getByText('Cơ Hội Việc Làm IT Nổi Bật')).toBeInTheDocument();
    });
  });

  it('hiển thị nhận diện thương hiệu UpCareer trong Header và Footer', () => {
    render(<TopDevPortalClient initialRealJobs={mockBackendJobs} />);

    expect(screen.getAllByText('UP').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CAREER').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/UpCareer là nền tảng tuyển dụng IT/i)).toBeInTheDocument();
  });
});

