import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecruitmentKanbanBoard from '../RecruitmentKanbanBoard';
import { Candidate } from '@/types/recruitment';

describe('RecruitmentKanbanBoard', () => {
  const mockCandidates: Candidate[] = [
    {
      id: 'cand-1',
      name: 'Nguyen Van Pending',
      email: 'pending@example.com',
      aiStatus: 'PENDING',
      cvUrl: 'pending.pdf',
      jobId: 'job-1',
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-2',
      name: 'Tran Van Interview',
      email: 'interview@example.com',
      aiStatus: 'DONE',
      matchScore: 92,
      cvUrl: 'interview.pdf',
      jobId: 'job-1',
      parsedSkillsJson: {
        skills: ['NestJS', 'React'],
        interviewSchedule: {
          googleMeetUrl: 'https://meet.google.com/abc-def-xyz',
          time: '10:00 AM',
          status: 'SCHEDULED',
        },
      },
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-3',
      name: 'Le Thi Pool',
      email: 'pool@example.com',
      aiStatus: 'DONE',
      matchScore: 70,
      cvUrl: 'pool.pdf',
      jobId: 'job-1',
      parsedSkillsJson: {
        skills: ['Python', 'Docker'],
        talentPool: {
          tier: 'PRIORITY_TALENT_POOL',
          status: 'ARCHIVED',
        },
      },
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
    {
      id: 'cand-4',
      name: 'Pham Van Evaluated',
      email: 'evaluated@example.com',
      aiStatus: 'DONE',
      matchScore: 85,
      cvUrl: 'evaluated.pdf',
      jobId: 'job-1',
      parsedSkillsJson: ['React', 'TypeScript'],
      createdAt: '2026-10-09T00:00:00.000Z',
      updatedAt: '2026-10-09T00:00:00.000Z',
    },
  ];

  it('hiển thị đầy đủ 5 cột quy trình tuyển dụng chuẩn hóa', () => {
    render(
      <RecruitmentKanbanBoard
        candidates={[]}
        onSelectCandidate={vi.fn()}
      />
    );

    expect(screen.getByText('Chờ AI Thẩm Định')).toBeInTheDocument();
    expect(screen.getByText('AI Đã Đánh Giá')).toBeInTheDocument();
    expect(screen.getByText('Lịch Phỏng Vấn (Meet)')).toBeInTheDocument();
    expect(screen.getByText('Kho Nhân Tài (Pool)')).toBeInTheDocument();
    expect(screen.getByText('Không Phù Hợp')).toBeInTheDocument();
  });

  it('phân loại đúng ứng viên vào các cột tương ứng theo trạng thái và dữ liệu AI', () => {
    render(
      <RecruitmentKanbanBoard
        candidates={mockCandidates}
        onSelectCandidate={vi.fn()}
      />
    );

    // Kiểm tra tên các ứng viên xuất hiện trên giao diện
    expect(screen.getByText('Nguyen Van Pending')).toBeInTheDocument();
    expect(screen.getByText('Tran Van Interview')).toBeInTheDocument();
    expect(screen.getByText('Le Thi Pool')).toBeInTheDocument();
    expect(screen.getByText('Pham Van Evaluated')).toBeInTheDocument();

    // Kiểm tra các thông tin đặc thù
    expect(screen.getByText('Google Meet Phỏng Vấn')).toBeInTheDocument();
    expect(screen.getByText('PRIORITY_TALENT_POOL')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('kích hoạt onSelectCandidate khi người dùng click vào thẻ ứng viên', () => {
    const handleSelect = vi.fn();
    render(
      <RecruitmentKanbanBoard
        candidates={mockCandidates}
        onSelectCandidate={handleSelect}
      />
    );

    const candidateCard = screen.getByText('Tran Van Interview').closest('div');
    if (candidateCard) {
      fireEvent.click(candidateCard);
      expect(handleSelect).toHaveBeenCalledWith(mockCandidates[1]);
    } else {
      throw new Error('Candidate card element not found');
    }
  });
});
