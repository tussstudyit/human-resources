import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CareersClient from '../CareersClient';
import { JobPost } from '@/types/recruitment';

const mockJobs: JobPost[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    description: 'Xây dựng giao diện React và Next.js hiện đại.',
    requirements: 'React, Next.js, TypeScript',
    status: 'OPEN',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    department: 'Kỹ thuật & Công nghệ',
  },
  {
    id: 'job-2',
    title: 'Chuyên viên Tuyển dụng Nhân sự',
    description: 'Tìm kiếm nhân tài công nghệ và điều phối phỏng vấn.',
    requirements: 'Tuyển dụng, Phỏng vấn, Đàm phán lương',
    status: 'OPEN',
    createdAt: '2026-09-30T00:00:00.000Z',
    updatedAt: '2026-09-30T00:00:00.000Z',
    department: 'Nhân sự',
  },
];

describe('CareersClient', () => {
  it('render danh sách các vị trí tuyển dụng ban đầu', () => {
    render(<CareersClient initialJobs={mockJobs} initialError={false} />);

    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Chuyên viên Tuyển dụng Nhân sự')).toBeInTheDocument();
  });

  it('hiển thị thông báo lỗi khi initialError là true', () => {
    render(<CareersClient initialJobs={[]} initialError={true} />);

    expect(
      screen.getByText('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.')
    ).toBeInTheDocument();
  });

  it('lọc danh sách việc làm theo phòng ban khi bấm nút filter', () => {
    render(<CareersClient initialJobs={mockJobs} initialError={false} />);

    // Bấm nút filter 'Nhân sự'
    const hrBtn = screen.getByRole('button', { name: /^Nhân sự/i });
    fireEvent.click(hrBtn);

    expect(screen.getByText('Chuyên viên Tuyển dụng Nhân sự')).toBeInTheDocument();
    expect(screen.queryByText('Senior Frontend Developer')).not.toBeInTheDocument();
  });

  it('tìm kiếm không phân biệt dấu tiếng Việt', async () => {
    render(<CareersClient initialJobs={mockJobs} initialError={false} />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm vị trí/i);

    // Gõ không dấu 'nhan su'
    fireEvent.change(searchInput, { target: { value: 'nhan su' } });

    // Chờ debounce 300ms
    await waitFor(() => {
      expect(screen.getByText('Chuyên viên Tuyển dụng Nhân sự')).toBeInTheDocument();
      expect(screen.queryByText('Senior Frontend Developer')).not.toBeInTheDocument();
    });
  });

  it('hiển thị empty state khi không có kết quả phù hợp', async () => {
    render(<CareersClient initialJobs={mockJobs} initialError={false} />);

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm vị trí/i);
    fireEvent.change(searchInput, { target: { value: 'vi-tri-khong-ton-tai' } });

    await waitFor(() => {
      expect(
        screen.getByText('Không tìm thấy vị trí tuyển dụng phù hợp')
      ).toBeInTheDocument();
    });
  });
});
